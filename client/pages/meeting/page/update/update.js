import amapFile from '../../../../libs/amap-wx.js';

import Meeting from '../../../../models/Meeting';
import Util from '../../../../utils/util.js';
import Config from '../../../../config.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    title: '',
    date: '',
    start_time: '',
    how_long: '00:00',
    end_time: '',
    destination: '',
    color: '',
    mapObj: undefined,
    tips: [],
    loader: true,
    loadingDelete: false,
    loadingUpdate: false,
    members: [],
    AllMembers: [],
    showAllMembers: false,
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    showAllText: 'Show all',
    information: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let obj = Meeting.findById(options.id).then(resp => {
      let obj = resp.data.data;

      let members = [];
      if (obj.members.length > 7) {
        for (let i = 0; i < 7; i++) {
          members.push(obj.members[i]);
        }
      } else {
        members = obj.members;
      }

      let how_long = Util.calculateHowLong(obj.start_time, obj.end_time);

      this.setData({
        id: obj.id,
        title: obj.title,
        color: obj.color,
        date: obj.date,
        start_time: obj.start_time,
        how_long: how_long,
        end_time: obj.end_time,
        destination: obj.destination,
        mapObj: obj.mapObj ? JSON.parse(obj.mapObj) : undefined,
        loader: false,
        members: members,
        AllMembers: obj.members
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  onShareAppMessage: function(res) {

    return {
      title: '分享 ' + this.data.title,
      path: 'pages/share/share?id=' + this.data.id,
      success: function(res) {
        // Forwarding successful
        console.log("分享成功");
        console.log(res);
      },
      fail: function(res) {
        // Forwarding failed
        console.log("分享失敗");
        console.log(res);
      }
    }
  },

  bindlinechange: function(e) {
    var height = e.detail.height;
    var heightRpx = e.detail.heightRpx;
    var lineCount = e.detail.lineCount;
    this.setData({
      log: "height=" + height + "  |  heightRpx=" + heightRpx + "  |  lineCount=" + lineCount
    })
  },

  bindKeyInput: function(e) {
    let str = e.detail.value;

    this.setData({
      title: str
    });
  },

  bindDateStart: function(e) {
    this.setData({
      date: e.detail.value
    })
  },

  changecolor: function(e) {
    let color = e.currentTarget.dataset.color;
    this.setData({
      color: color
    })
  },
  
  formSubmit: function(e) {
    console.log('formSubmit', e.detail.value)
    if (this.data.loadingUpdate || this.data.loadingDelete) {
      return false;
    }

    let title = this.data.title;
    let color = this.data.color;
    let date = this.data.date;
    let start_time = this.data.start_time;
    let end_time = this.data.end_time;
    let mapObj = this.data.mapObj;
    let destination = this.data.destination;
    let id = this.data.id;

    let obj = {
      id: id,
      title: title,
      color: color,
      date: date,
      start_time: start_time,
      end_time: end_time,
      destination: destination,
      mapObj: mapObj
    }

    let meeting = new Meeting(obj);
    let errors = meeting.validate();

    if (errors.length > 0) {
      wx.showToast({
        title: errors[0],
        icon: 'none',
        duration: 1200
      });
      return;
    }
    this.setData({
      loadingUpdate: true
    });
    let eventDate = new Date(`${date} ${start_time}`);
    Meeting.update(obj).then(x => {
      wx.reLaunch({
        url: `/pages/meeting/meeting`,
        // ?y=${ eventDate.getFullYear() } & mon=${ eventDate.getMonth() + 1 }
      })
    });

  },

  bindTime: function(e) {

    let time = new Date(this.data.date + ' ' + e.detail.value);
    time.setMinutes(time.getMinutes() + parseInt(this.data.how_long.split(':')[1]));
    time.setHours(time.getHours() + parseInt(this.data.how_long.split(':')[0]));

    this.setData({
      start_time: e.detail.value,
      end_time: Util.checkTime(time.getHours()) + ':' + Util.checkTime(time.getMinutes())
    });

  },
  bindEndTime: function(e) {
    let how_long = Util.calculateHowLong(this.data.start_time, e.detail.value);

    this.setData({
      end_time: e.detail.value,
      how_long: how_long
    });
  },
  bindHowLong: function(e) {
    let time = new Date(this.data.date + ' ' + this.data.start_time);
    time.setMinutes(time.getMinutes() + parseInt(e.detail.value.split(':')[1]));
    time.setHours(time.getHours() + parseInt(e.detail.value.split(':')[0]));
    this.setData({
      how_long: e.detail.value,
      end_time: Util.checkTime(time.getHours()) + ':' + Util.checkTime(time.getMinutes())
    });
  },
  bindDestinationInput: function(e) {
    let that = this;
    let keywords = e.detail.value;
    let myAmapFun = new amapFile.AMapWX({
      key: Config.key.AMapWX
    });

    myAmapFun.getInputtips({
      keywords: keywords,
      location: '',
      success: function(data) {
        if (data && data.tips) {
          let tips = data.tips;
          that.setData({
            tips: tips.filter(tip => tip.location.length > 0)
          });
        }

      }
    })
  },

  bindMapSelection: function (e) {
    console.log('hello world');
    wx.chooseLocation({
      success: (res) => {
        console.log(res)
        let mapObj = {};
        // let buff = elem.location.split(',');
        mapObj.longitude = res.longitude;
        mapObj.latitude = res.latitude;
        mapObj.markers = [];
        let marker = {
          iconPath: "../../../../img/marker.png",
          longitude: res.longitude,
          latitude: res.latitude,
          width: 20,
          height: 30
        };
        mapObj.markers.push(marker);

        this.setData({
          tips: [],
          destination: res.name,
          mapObj: mapObj
        });

      }
    })
  },
  
  bindSearch: function(e) {
    let id = e.target.dataset.id;
    let elem = this.data.tips.find(s => s.id === id);
    let mapObj = elem;
    let buff = elem.location.split(',');
    mapObj.longitude = buff[0];
    mapObj.latitude = buff[1];
    mapObj.markers = [];
    let marker = {
      
      iconPath: "../../../../img/marker.png",
      longitude: buff[0],
      latitude: buff[1],
      width: 20,
      height: 28
    };
    mapObj.markers.push(marker);
    if (elem && elem.name) {
      this.setData({
        tips: [],
        destination: elem.name,
        mapObj: mapObj,
      });
    }

  },
  getDateList: function(y, mon) {
    var vm = this;
    //如果是否闰年，则2月是29日
    var daysCountArr = this.data.daysCountArr;
    if (y % 4 == 0 && y % 100 != 0) {
      this.data.daysCountArr[1] = 29;
      this.setData({
        daysCountArr: daysCountArr
      });
    }
    var dateList = [];
    dateList[0] = [];
    var weekIndex = 0; //第几个星期
    for (var i = 0; i < vm.data.daysCountArr[mon]; i++) {
      var week = new Date(y + '/' + (mon + 1) + '/' + (i + 1)).getDay();
      dateList[weekIndex].push({
        value: y + '/' + (mon + 1) + '/' + (i + 1),
        date: i + 1,
        week: week
      });
      if (week == 0) {
        weekIndex++;
        dateList[weekIndex] = [];
      }
    }
    vm.setData({
      dateList: dateList
    });
  },
  onDelete: function() {
    if (this.data.loadingUpdate || this.data.loadingDelete) {
      return false;
    }
    let id = this.data.id;
    let that = this;
    wx.showModal({
      title: '警告',
      content: '你即将删除已发布的活动',
      confirmText: '确认',
      cancelText: '取消',
      showCancel: true,

      success: function(res) {
        if (res.confirm) {
          that.setData({
            loadingDelete: true
          });
          getApp().getToken().then(token => {
              let options = {
                url: Config.service.deleteEvent,
                method: "post",
                data: {
                  token: token,
                  event_id: id
                },
                login: true,

                success(result) {
                  console.log(result);
                  wx.reLaunch({
                    url: '/pages/meeting/meeting',
                  })
                },
              };
              wx.request(options);
              // TODO: keep send request...
            }),
            console.log('用户点击确定')
        } else if (res.cancel) {
         
          console.log('用户点击取消')
        }
      }
    });
  },
  viewAllMembers: function(e) {
    let showAllMembers = !this.data.showAllMembers;
    if (showAllMembers) {
      this.setData({
        members: this.data.AllMembers,
        showAllText: 'Hide',
        showAllMembers: showAllMembers
      });
    } else {
      let members = [];
      for (let i = 0; i < 7; i++) {
        members.push(this.data.AllMembers[i]);
      }
      this.setData({
        showAllMembers: showAllMembers,
        showAllText: 'Show all',
        members: members
      });
    }
  }
})