const DB = require('../tools/db');

const EventClass = require('../models/event.js');
const Event = EventClass.Event;
const EventDAO = EventClass.EventDAO;

const InviteClass = require('../models/invite.js');
const EventInvite = InviteClass.EventInvite;
const EventInviteDAO = InviteClass.EventInviteDAO;

const UserDAO = require('../models/user').UserDAO;

// Return list of event by month (and year)
let getListByOpenId = async (ctx, next) => {

    let openid = ctx.user.openid;
    let year = parseInt(ctx.query.year);
    let month = parseInt(ctx.query.month);

    if (openid && !isNaN(year) && !isNaN(month)) {
        let result = await EventDAO.findList(openid, year, month);
        for (let i = 0; i < result.length; i++) {
            let event = Event.fromObject(result[i]);
            result[i] = event.toClient();
        }
        ctx.state.data = {result: true, data: result};
    } else {
        ctx.state.data = {result: false, message: 'Wrong value'};
    }
};

let updateEvent = async (ctx, next) => {

    let id = ctx.request.body.id;
    let title = ctx.request.body.title;
    let date = ctx.request.body.date;
    let color = ctx.request.body.color;
    let start_time = ctx.request.body.start_time;
    let end_time = ctx.request.body.end_time;
    let destination = ctx.request.body.destination;
    let mapObj = ctx.request.body.mapObj;

    if (!isNaN(parseInt(id)) && (title || date || start_time || end_time || destination || color || mapObj)) {

        let event = await EventDAO.findById(id);
        // Only creator can edit event
        if (!event || (event.creator_openid !== ctx.user.openid)) {
            ctx.state.data = {result: false, message: 'Access denied'};
            return;
        }

        await EventDAO.update(id, title, date, start_time, end_time, destination, color, mapObj);

        ctx.state.data = {result: true};
    } else {
        ctx.state.data = {result: false, message: 'Invalid values'};
    }

};

// Create new event
let addEvent = async (ctx, next) => {

    let title = ctx.request.body.title;
    let date = ctx.request.body.date;
    let start_time = ctx.request.body.start_time;
    let end_time = ctx.request.body.end_time;
    let color = ctx.request.body.color;
    let destination = ctx.request.body.destination;
    let creator_openid = ctx.user.openid;
    let mapObj = ctx.request.body.mapObj;

    let event = new Event(title, date, start_time, end_time, destination, color, creator_openid, mapObj);

    let errors = event.validate();
    if (errors.length > 0) {
        ctx.state.data = {result: false, message: errors[0]};
    } else {
        let id = await EventDAO.createNew(event);
        ctx.state.data = {result: true, id: id};
    }
};

let viewEvent = async (ctx, next) => {

    let id = parseInt(ctx.query.id);
    let openid = ctx.user.openid;

    if (!isNaN(id)) {
        let event = await EventDAO.findById(id);
        if (event) {
            let creator_openid = event.creator_openid;
            let data = event.toClient();
            if(creator_openid === openid){
                data.user = 'creator'; // if this event created by user
            } else {
                let invite = await EventInviteDAO.getInvite(id, openid);
                data.user = invite ? 'member' : ''; // if user member of even
            }
            data.members = await UserDAO.getUsersByEventId(id);
            let creator = await UserDAO.findByOpenid(event.creator_openid);
            data.members.push(creator.toClient());
            ctx.state.data = {result: true, data: data };
        } else {
            ctx.state.data = {result: false, message: 'Not found'};
        }

    } else {
        ctx.state.data = {result: false, message: 'Id required'};
    }

};

// Add member to event
const acceptInvite = async (ctx, next) => {

    let event_id = ctx.request.body.event_id;
    let invited_openid = ctx.user.openid;

    if(!isNaN(parseInt(event_id))){
        let event = await EventDAO.findById(event_id);
        if(event){
            let invite = await EventInviteDAO.getInvite(event_id, invited_openid);
            if(!invite){
                invite = await EventInviteDAO.acceptInvite(event_id, invited_openid);
                ctx.state.data = {result: true};
            } else {
                ctx.state.data = {result: false, message: 'Already accepted'};
            }
        } else {
            ctx.state.data = {result: false, message: 'Event not exists'};
        }
    } else {
        ctx.state.data = {result: false, message: 'event_id required'};
    }

};

// Get list of event where user is member by accepting invite
const getInvites = async (ctx, next) => {

  let openid = ctx.user.openid;

  if (openid) {
    let result = await EventInviteDAO.getEventsByOpenid(openid);
    for (let i = 0; i < result.length; i++) {
      let event = Event.fromObject(result[i]);
      result[i] = event.toClient();
    }
    ctx.state.data = {result: true, data: result};
  } else {
    ctx.state.data = {result: false, data: [], message: 'Invalid openid'};
  }

};

const deleteEvent = async (ctx, next) => {
  let openid = ctx.user.openid;
  let event_id = ctx.request.body.event_id;

  if (openid && event_id) {
    let event = await EventDAO.findById(event_id);
    if(event && event.creator_openid === openid){
      let result = await EventDAO.removeById(event_id);
      ctx.state.data = {result: true};
    } else {
      ctx.state.data = {result: false, message: 'Access denied'};
    }
  } else {
    ctx.state.data = {result: false, data: [], message: 'Invalid data'};
  }
};


module.exports = {
    getListByOpenId: getListByOpenId,
    addEvent: addEvent,
    updateEvent: updateEvent,
    viewEvent: viewEvent,
    acceptInvite: acceptInvite,
    getInvites: getInvites,
    deleteEvent: deleteEvent
};
