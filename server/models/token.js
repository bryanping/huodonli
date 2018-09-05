const DB = require('../tools/db');

class Token {
  constructor(code, openid, expire) {
    this.code = code || '';
    this.expire = expire || '';
    this.openid = openid || '';
  }

  static genCode(length = 12){
    let code = '';
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
      code += possible.charAt(Math.floor(Math.random() * possible.length));

    return code;
  }

  static fromMysql(obj){
    if(Array.isArray(obj)){
      obj = obj[0];
    }

    if(obj && obj.code) {
      return new Token(obj.code, obj.openid, obj.expire);
    } else {
      return undefined;
    }
  }
}

class TokenDAO {

  static get TABLE() {
    return 'token';
  }

  static get TOKEN_EXPIRE(){
    return 604800000;
  }

  static async findByCode(code){
    return Token.fromMysql(await DB.select().from(this.TABLE).where('code', code));
  }

  static async findByOpenid(openid) {
    return Token.fromMysql(await DB.select().from(this.TABLE).where('openid', openid));
  }

  static async createToken(openid){
    let expire = new Date(Date.now() + this.TOKEN_EXPIRE);
    let code = Token.genCode();
    await DB(this.TABLE)
        .insert({
          openid: openid,
          code: code,
          expire: expire
      });
    return {
      code: code
    };
  }

  static async extendToken(code){
    let expire = new Date(Date.now() + this.TOKEN_EXPIRE);
    await DB(this.TABLE).where('code', code).update({
      expire: expire
    });
    return true;
  }

  // TODO: create User Model
  static async findUserByOpenid(openid){
    let result =  await DB.select().from('user').where('openid', openid);
    if(Array.isArray(result)){
      result = result[0];
    }
    return result;
  }
}


module.exports = {
  Token: Token,
  TokenDAO: TokenDAO
};