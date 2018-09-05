
const DB = require('../tools/db');

const axios = require('axios');

const config = require('../config');

const TokenDAO = require('../models/token').TokenDAO;
const EventDAO = require('../models/event').EventDAO;

const UserClass = require('../models/user');
const User = UserClass.User;
const UserDAO = UserClass.UserDAO;


// save user to DB and get token
const addUser = async (ctx, next) => {

  try{

  let code = ctx.request.body.code;
  let userInfo = ctx.request.body.userInfo;

  let sessionResponse = await axios.get("https://api.weixin.qq.com/sns/jscode2session",
      {
        params : {
          appid : config.appId,
          secret : config.appSecret,
          js_code : code,
          grant_type : "authorization_code"
        }
      });


  let sessionResponseData = sessionResponse.data;

  let session_key = sessionResponseData.session_key;

  let openid = sessionResponseData.openid;

  let token = await TokenDAO.findByOpenid(openid);

  let user = new User(openid, userInfo.nickName, userInfo.avatarUrl, userInfo.gender, userInfo.province, userInfo.city, userInfo.country, session_key);
  let errors = user.validate();

  if(errors.length > 0){
    ctx.state.data = { result: false, token: '', message: errors[0] };
    return;
  }

  if(token){

    await TokenDAO.extendToken(token.code);
    await UserDAO.updateUser(user);

  } else {

    token = await TokenDAO.createToken(openid);
    let addUser = await UserDAO.addUser(user);
    await DB("testTableResponse").insert({ textVal: JSON.stringify(userInfo) });

  }

  ctx.state.data = { result: true, token: token.code, addUser: addUser };

  }
  catch(error)
  {
    ctx.state.data = { result: false, token: '', message: 'error happened', debug: error.message };
  }

  
};

// Get profile of current user
const getProfile = async (ctx, next) => {
  let openid = ctx.user.openid;

  let user = await UserDAO.findByOpenid(openid);

  if(user){
    let result = user.toClient();
    result.created = await EventDAO.countByOpenid(user.openid);
    ctx.state.data = { result: true, user: result};
  } else {
    ctx.state.data = { result: false, message: 'User not found'};
  }
};

// Get profile of user by id (not open id)
let getById = async (ctx, next) => {
  let id = parseInt(ctx.query.id);

  if(!isNaN(id)){
    let user =  await UserDAO.findById(id);
    if(user){
      ctx.state.data = { result: true, user: user.toClient()};
    } else {
      ctx.state.data = { result: false, message: 'User not found'};
    }

  } else {
    ctx.state.data = { result: false, message: 'Invalid id'};
  }
};

module.exports = {
  getProfile: getProfile,
  addUser: addUser,
  getById: getById
};
