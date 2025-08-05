const DB = require('../tools/db');

class EventInvite {
  constructor(event_id, invited_openid, status, is_participating = 0, id) {
    if (id) {
      this.id = id;
    }
    this.event_id = event_id;
    this.invited_openid = invited_openid;
    this.status = status;
    this.is_participating = is_participating;
  }

  toMysql() {
    return {
      event_id: this.event_id,
      invited_openid: this.invited_openid,
      status: this.status,
      is_participating: this.is_participating 
    }
  }

  static fromObject(obj) {
    if (!obj) {
      return undefined;
    }

    return new EventInvite(obj.event_id, obj.invited_openid, obj.status, obj.is_participating, obj.id);
  }
}

class EventInviteDAO {

  static get TABLE() {
    return 'event_invite';
  }

  static async getInvite(event_id, invited_openid) {
    let elem = await DB.select().from(this.TABLE).whereRaw('event_id = ' + event_id + ' and invited_openid = "' + invited_openid + '"');

    return EventInvite.fromObject(elem[0]);
  }

  static async getEventsByMonth(openid, year, month){
    return await DB.select().from(this.TABLE).rightJoin('event', 'event_invite.event_id', '=', 'event.id')
        .select('event.id', 'event.date', 'event.title', 'event.destination', 'event.start_time', 'event.end_time', 'event.mapObj', 'event.color','event.personNumber')
        .where(DB.raw(`YEAR(event.date) = ${year} AND MONTH(event.date) = ${month} AND event_invite.invited_openid = "${openid}" AND event.deleted IS NULL`))
        .orderByRaw('event.date, event.start_time');
  }

  static async getEventsByOpenid(openid){
    return await DB.select().from(this.TABLE).rightJoin('event', 'event_invite.event_id', '=', 'event.id')
        .select('event.id', 'event.date', 'event.title', 'event.destination', 'event.start_time', 'event.end_time', 'event.mapObj', 'event.color', 'event.personNumber')
      .where(DB.raw(`event_invite.invited_openid = "${openid}" AND event.date >= date(now()) AND  event.deleted IS NULL `))
      // .where(DB.raw(`event_invite.invited_openid = "${openid}" AND event.deleted IS NULL `))
        .orderByRaw('event.date, event.start_time');
  }

  static async acceptInvite(event_id, invited_openid) {
    try {
      const invite = await this.getInvite(event_id, invited_openid);
      if (!invite) {
        // 如果邀請記錄不存在，創建新記錄
        await DB(this.TABLE).insert({
          event_id: event_id,
          invited_openid: invited_openid,
          status: true,
          is_participating: 1,
        });
      } else {
        // 如果邀請記錄存在，更新參與狀態
        await DB(this.TABLE)
          .where({
            event_id: event_id,
            invited_openid: invited_openid
          })
          .update({
            status: true,
            is_participating: 1
          });
      }
    }
    catch (ex) {
      console.log('EventDAO:' + ex.message);
      return false;
    }
    return true;
  }
  static async cancelParticipation(event_id, invited_openid) {
    try {
      await DB(this.TABLE)
        .where({
          event_id: event_id,
          invited_openid: invited_openid
        })
        .update({
          is_participating: 0 // 取消参与时设置为0
        });
    } catch (ex) {
      console.log('EventDAO:' + ex.message);
      return false;
    }
    return true;
  }
  
}

module.exports = {
  EventInvite: EventInvite,
  EventInviteDAO: EventInviteDAO
};