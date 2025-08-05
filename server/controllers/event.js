//server/controllers/event.js

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
    let personNumber = ctx.request.body.personNumber !== undefined ? parseInt(ctx.request.body.personNumber) : null;
    console.log('Received personNumber:', personNumber);
    

    if (!isNaN(parseInt(id)) && (title || date || start_time || end_time || destination || color || mapObj || personNumber)) {

        let event = await EventDAO.findById(id);
        // Only creator can edit event
        if (!event || (event.creator_openid !== ctx.user.openid)) {
            ctx.state.data = {result: false, message: 'Access denied'};
            return;
        }

        await EventDAO.update(id, title, date, start_time, end_time, destination, color, mapObj, personNumber);

        ctx.state.data = {result: true};
    } else {
        ctx.state.data = {result: false, message: 'Invalid values'};
    }

};

// Create new event
let addEvent = async (ctx, next) => {
    try {
        console.log('========== START ADD EVENT ==========');
        console.log('Raw request body:', ctx.request.body);
        console.log('Request personNumber:', ctx.request.body.personNumber);
        console.log('Request personNumber type:', typeof ctx.request.body.personNumber);
        
        const eventParams = {
            title: ctx.request.body.title,
            date: ctx.request.body.date,
            start_time: ctx.request.body.start_time,
            end_time: ctx.request.body.end_time,
            destination: ctx.request.body.destination,
            color: ctx.request.body.color,
            creator_openid: ctx.user.openid,
            mapObj: ctx.request.body.mapObj,
            personNumber: ctx.request.body.personNumber !== undefined ? parseInt(ctx.request.body.personNumber) : null
        };
        
        console.log('Processed eventParams:', eventParams);
        console.log('Processed personNumber:', eventParams.personNumber);
        
        let event = new Event(eventParams);
        console.log('Created Event object:', event);
        
        let errors = event.validate();
        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            ctx.state.data = {result: false, message: errors[0]};
            return;
        }

        console.log('Before calling EventDAO.createNew');
        let id = await EventDAO.createNew(event);
        console.log('After EventDAO.createNew, ID:', id);
        
        ctx.state.data = {result: true, id: id};
        console.log('========== END ADD EVENT ==========');
    } catch (error) {
        console.error('Error in addEvent:', error);
        ctx.state.data = {result: false, message: error.message};
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
            } else if(invite.is_participating === 0) {
                // 如果之前接受過但取消參與了，重新設置參與狀態
                await EventInviteDAO.acceptInvite(event_id, invited_openid);
                ctx.state.data = {result: true};
            } else {
                ctx.state.data = {result: false, message: 'Already participating'};
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
