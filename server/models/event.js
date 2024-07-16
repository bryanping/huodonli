const DB = require('../tools/db');

const dateToYMD = require('../tools/helper').dateToYMD;

class Event {
  constructor(title, date, start_time, end_time, destination, color, creator_openid, mapObj, id, ) {
    if (id) {
      this.id = id;
    }
    this.title = title || '';
    this.date = date || '';
    this.start_time = start_time || '';
    this.end_time = end_time || '';
    this.destination = destination || '';
    this.color = color || '';
    this.creator_openid = creator_openid || '';
    this.mapObj = mapObj || '';
  }

  validate() {
    let errors = [];

    if (!this.title || this.title === '') {
      errors.push('请输入标题');
    }
    if (!this.destination || this.destination === '') {
      errors.push('请输入活动地点');
    }
    if (!this.mapObj || this.mapObj === '') {
      errors.push('请输入活动地点');
    }
    if (this.start_time === '' || this.end_time === '' || this.date === '') {
      errors.push('请选择时间');
    }
    if (this.creator_openid === '') {
      errors.push('creator_openid is empty');
    }

    return errors;
  }

  toClient() {
    return {
      id: this.id,
      title: this.title,
      date: dateToYMD(new Date(this.date.toString())),
      start_time: this.start_time.substring(0, this.start_time.length - 3),
      end_time: this.end_time.substring(0, this.end_time.length - 3),
      destination: this.destination,
      color: this.color,
      mapObj: this.mapObj
    }
  }

  toMysql() {
    return {
      title: this.title,
      date: this.date,
      start_time: this.start_time,
      end_time: this.end_time,
      destination: this.destination,
      color: this.color,
      creator_openid: this.creator_openid,
      mapObj: this.mapObj
    };
  }

  static fromObject(obj) {
    if(!obj){
      return undefined;
    }
    return new Event(obj.title, obj.date, obj.start_time, obj.end_time, obj.destination, obj.color, obj.creator_openid, obj.mapObj, obj.id)
  }
}

class EventDAO {

  static get TABLE() {
    return 'event';
  }

  static async findList(openid, year, month) {
    return await DB.select().from(this.TABLE)
        .where(DB.raw('creator_openid = "' + openid + '" AND MONTH(`date`) = ' + month + ' AND YEAR(`date`) = ' + year + ' AND deleted IS NULL'))
        .orderByRaw('date, start_time');
  }

  static async createNew(event) {
    let elem = await DB(this.TABLE).insert(event.toMysql()).returning('id');
    return elem[0];
  }

  static async update(id, title, date, start_time, end_time, destination, color, mapObj) {
    let obj = {};
    if (date) {
      obj.date = date;
    }
    if (title) {
      obj.title = title;
    }
    if (start_time) {
      obj.start_time = start_time;
    }
    if (end_time) {
      obj.end_time = end_time;
    }
    if (destination) {
      obj.destination = destination;
    }
    if (color) {
      obj.color = color;
    }
    if (mapObj) {
      obj.mapObj = mapObj;
    }
    return await DB(this.TABLE).where('id', id).update(obj);
  }

  static async findById(id) {
    let elem = await DB.select().from(this.TABLE).where(DB.raw(`id = ${id} AND deleted IS NULL`));

    return Event.fromObject(elem[0]);
  }


  static async countByOpenid(openid){
    let result = await DB(this.TABLE).count().where(DB.raw(`creator_openid = "${openid}" AND deleted IS NULL`));
    return result[0]['count(*)'];
  }

  static async removeById(id){
    return await DB(this.TABLE).where('id', id).update({
      deleted: true
    });
  }
}

module.exports = {
  Event: Event,
  EventDAO: EventDAO
};