//server/models/event.js

const DB = require('../tools/db');

const dateToYMD = require('../tools/helper').dateToYMD;

class Event {
  constructor(params = {}) {
    console.log('version1');
    console.log('Constructing Event with params:', params);
    
    // 允许 personNumber 为任意整数或 null
    let personNumber = params.personNumber !== undefined ? parseInt(params.personNumber) : null;
    if (isNaN(personNumber)) {
      personNumber = null; // 设置为 null
    }
    
    this.id = params.id || null;
    this.title = params.title || '';
    this.date = params.date || '';
    this.start_time = params.start_time || '';
    this.end_time = params.end_time || '';
    this.destination = params.destination || '';
    this.color = params.color || '';
    this.creator_openid = params.creator_openid || '';
    this.mapObj = params.mapObj || '';
    this.personNumber = personNumber;
    
    console.log('Constructed Event:', this);
  }

  validatePersonNumber(value) {
    console.log('Validating personNumber:', value);
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 99) {
      console.log('Invalid personNumber, using default 99');
      return 99;
    }
    console.log('Valid personNumber:', num);
    return num;
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
      mapObj: this.mapObj,
      personNumber: this.personNumber, // 直接返回 personNumber
    }
  }

  toMysql() {
    console.log('version1');
    const data = {
      title: this.title,
      date: this.date,
      start_time: this.start_time,
      end_time: this.end_time,
      destination: this.destination,
      color: this.color,
      creator_openid: this.creator_openid,
      mapObj: typeof this.mapObj === 'string' ? this.mapObj : JSON.stringify(this.mapObj),
      personNumber: this.personNumber // 允许为 null
    };
    console.log('toMysql generated data:', data);
    return data;
  }

  static fromObject(obj) {
    if(!obj){
      return undefined;
    }
    let personNumber = obj.personNumber !== undefined ? parseInt(obj.personNumber) : null;
    if (isNaN(personNumber)) {
      personNumber = null; // 设置为 null
    }
    return new Event(obj.id, obj.title, obj.date, obj.start_time, obj.end_time, obj.destination, obj.color, obj.creator_openid, obj.mapObj, personNumber)
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
    const trx = await DB.transaction();
    try {
      console.log('Starting transaction for new event');
      console.log('Event data:', event);
      
      const mysqlData = event.toMysql();
      console.log('MySQL data:', mysqlData);
      
      // 确保 personNumber 是数字类型
      if (typeof mysqlData.personNumber !== 'number') {
        mysqlData.personNumber = parseInt(mysqlData.personNumber) || 99;
      }
      
      console.log('Final MySQL data to insert:', mysqlData);
      
      const result = await trx(this.TABLE).insert(mysqlData);
      console.log('Insert result:', result);
      
      // 验证插入是否成功
      const insertedEvent = await trx(this.TABLE)
        .where('id', result[0])
        .first();
      console.log('Inserted event:', insertedEvent);
      
      await trx.commit();
      console.log('Transaction committed');
      
      return result[0];
    } catch (error) {
      await trx.rollback();
      console.error('Error in createNew:', error);
      throw error;
    }
  }

  static async update(id, title, date, start_time, end_time, destination, color, mapObj, personNumber) {
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
    if (personNumber !== undefined) {
      const event = new Event();
      obj.personNumber = event.validatePersonNumber(personNumber);
    }

    const sql = DB(this.TABLE).where('id', id).update(obj).toString();
    console.log('SQL Update executed:', sql);
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