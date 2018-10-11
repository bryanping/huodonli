const axios = require('axios');

const config = require('../config');

const Token = require('../models/token').Token;
const TokenDAO = require('../models/token').TokenDAO;

module.exports = async function (ctx, next) {

  let code = ctx.query.token || ctx.request.body.token;
    if (code) {
        let token = await TokenDAO.findByCode(code);
        if (new Date(token.expire).getTime() > Date.now()) {
            await TokenDAO.extendToken(token.code);
            ctx.user = await TokenDAO.findUserByOpenid(token.openid);
            await next();
        } else {
            ctx.state.data = {result: false, message: 'Token expired'};
        }
    } else {
        ctx.state.data = {result: false, message: 'Token required'};
    }
};