//models/Meeting.js

  import Model from './Model'
  import Util from '../utils/util'
  import Config from '../config.js'

  class Meeting extends Model {
    constructor(obj) {
      super()
      Object.assign(this, {
        title: '',
        color: '',
        date: '',
        start_time: '',
        end_time: '',
        destination: '',
        mapObj: undefined,
        personNumber: null,
      }, obj)
    }

    static get USER_CREATOR() {
      return 'creator';
    }

    static get USER_MEMBER() {
      return 'member';
    }

    static findById(id){
      return new Promise((resolve, reject) => {
          getApp().getToken().then(token => {
              wx.request({
                  url: Config.service.getEventById + `?id=${id}&token=${token}`,
                  success(result) {
                  resolve(result.data)
                  },
                  fail(error) {
                  reject(error);
                  }
              })
          });
      });
    return meeting;
    }

    validate(){
      let errors = [];

      if (!this.title || this.title == '' || this.title.length == 0) {
        errors.push("请填写标题");
      }

      if (!this.destination || this.destination == '' || this.destination.length == 0) {
        errors.push("请填写目的地");
      }

      if (!this.mapObj || this.mapObj == undefined) {
        errors.push('需要选择目的地');
      }

      

      return errors;
    }

    static acceptInvite(eventId) {
      return new Promise((resolve, reject) => {
        getApp().getToken().then(token => {
          wx.request({
            url: Config.service.acceptInvite,
            method: "post",
            data: {
              token: token,
              event_id: eventId
            },
            success(result) {
              resolve(result.data);
            },
            fail(error) {
              reject(error);
            }
          });
        });
      });
    }

    save(){
      let token = getApp().globalData.token;
      let requestData = {
        token: token,
        title: this.title,
        date: this.date,
        color: this.color,
        start_time: this.start_time,
        end_time: this.end_time,
        destination: this.destination,
        mapObj: this.mapObj ? JSON.stringify(this.mapObj) : undefined,
        personNumber: parseInt(this.personNumber) || 99,
        is_participating: this.participating,
      };
      
      console.log('Sending request with data:', requestData);
      console.log('personNumber type:', typeof requestData.personNumber);
      console.log('personNumber value:', requestData.personNumber);

      return new Promise((resolve, reject) => {
        wx.request({
          url: Config.service.createEvent,
          method: "post",
          data: requestData,
          login: true,
          success(result) {
            console.log('Request success, response:', result);
            resolve(result);
          },
          fail(error) {
            console.error('Request failed:', error);
            reject(error);
          }
        });
      });
    }

      static update(obj) {
          let token = getApp().globalData.token;
          return new Promise((resolve, reject) => {
              wx.request({
                  url: Config.service.updateEvent,
                  method: "post",
                  data: {
                      token: token,
                      id: obj.id,
                      title: obj.title,
                      date: obj.date,
                      color: obj.color,
                      start_time: obj.start_time,
                      end_time: obj.end_time,
                      destination: obj.destination,
                      personNumber: obj.personNumber ? Number(obj.personNumber) : null,
                      mapObj: obj.mapObj ? JSON.stringify(obj.mapObj) : undefined
                  },
                  login: true,
                  success(result) {
                      console.log('request success', result)
                      resolve(result);
                  },
                  fail(error) {
                      console.log('request fail', error);
                      reject(error);
                  }
              });
          });
      }
  }

  export default Meeting;