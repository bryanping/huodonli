const DB = require('../tools/db');


class User {
  constructor(openid, nickName, avatarUrl, gender, province, city, country, last_session_key, id) {
    if(id){
      this.id = id;
    }
    this.openid = openid || '';
    this.nickName = nickName || '';
    this.avatarUrl = avatarUrl || '';
    this.gender = gender || 0;
    this.province = province || '';
    this.city = city || '';
    this.country = country || '';
    this.last_session_key = last_session_key || '';
  }

  validate(){
    let errors = [];
    if(this.openid === ''){
      errors.push('Openid cannot be empty');
    }
    if(this.last_session_key === ''){
      errors.push('Openid cannot be empty');
    }
    return errors;
  }

  toMysql() {
    return {
      openid: this.openid,
      nickName: this.nickName,
      avatarUrl: this.avatarUrl,
      gender: this.gender || 0,
      province: this.province,
      city: this.city,
      country: this.country,
      last_session_key: this.last_session_key
    }
  }


  toClient() {
    return {
      id: this.id,
      nickName: this.nickName,
      avatarUrl: this.avatarUrl,
      gender: this.gender,
      province: this.province,
      city: this.city,
      country: this.country
    }
  }

  static fromMysql(obj){
    if(!obj){
      return undefined;
    }
    return new User(obj.openid, obj.nickName, obj.avatarUrl, obj.gender, obj.province, obj.city, obj.country, obj.last_session_key, obj.id)
  }
}

class UserDAO {

  static get TABLE() {
    return 'user';
  }

  static async findByOpenid(openid){
    let result = await DB.select().from(this.TABLE).where('openid', openid);

    return User.fromMysql(result[0]);
  }

  static async findById(id){
    let result = await DB.select().from(this.TABLE).where('id', id);

    return User.fromMysql(result[0]);
  }

  static async getUsersByEventId(eventId){
    //let subquery = DB.select('invited_openid').from('event_invite').where('event_id', eventId);
    //return await DB.select('nickName', 'avatarUrl', 'gender', 'province', 'city', 'country').from(this.TABLE).whereIn('openid', subquery);
    return  await DB.select('user.id', 'user.nickName', 'user.avatarUrl', 'user.gender', 'user.province', 'user.city', 'user.country').from(this.TABLE).leftJoin('event_invite', 'user.openid', 'event_invite.invited_openid')
        .where('event_invite.event_id', eventId);
  }

  static async addUser(user){
    try {
      await DB(this.TABLE).insert(user.toMysql());
    } catch(ex) {
      console.log('addUser ' + ex.message);
      return false;
    }
    return true;
  }

  static async updateUser(user){
    let obj = user.toMysql();
    obj.last_visit_time = new Date();
    return await DB(this.TABLE).where('openid', user.openid).update(obj);
  }
}

module.exports = {
  User: User,
  UserDAO: UserDAO
};