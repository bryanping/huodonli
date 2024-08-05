// pages/meeting/meeting.js

import cashUtil from '../../utils/cashUtil.js';
import Util from '../../utils/util.js';
import Config from '../../config.js';

Page({

  /**
   * 页面的初始数据測試測試
   */
  data: {
    meeting: [],
    selectedDate: '',
    selectedWeek: '',
    curYear: '',
    curMonth: '',
    curDate: '',
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    daysCountArr: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    dateList: [],
    resultArr: [],
    loader: true,
    options: null,
    tipe: '',
    viewshow: 'none',
    arrivaltime: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function(options) {
  //   this.setData({
  //     options,
  //   });
  // },

  onLoad: function (options) {
    this.setData({
      options,
    });
    // 打开首页时判断options.id是否存在 用这个值来判断进入首页的来源是否为用户点击了分享的卡片
    // 同时可以通过获取到的id的值跳转导航到对应的分享详情页
    if (options.id) {
      setTimeout(function () {
        wx.navigateTo({
          url: `../share/share?id=${options.id}`
        })
      }, 800)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this
    setTimeout(function () {
      that.setData({
        viewshow: 'block'
      })
    }, 400)
    for (var i = 1; i < 101; i++) {
      that.setData({
        percent: i
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const {
      options
    } = this.data;
    var today = new Date();
    var y = options.y || today.getFullYear();
    var mon = Util.checkTime(options.mon || (today.getMonth() + 1));
    var d = today.getDate();
    var i = today.getDay();
    this.getSelfMeetingsByDate(y, mon).then(resp1 => {
      var selfMeetingData = resp1.data.data;
      this.getInvitedMeetingsByDate(y, mon).then(resp2 => {
        var invitedMeetingsData = resp2.data.data;
        for (var i = 0; i < invitedMeetingsData.length; i++) {
          invitedMeetingsData[i].type = 'invited';
          
        }
        this.setData({
          curYear: y,
          curMonth: mon,
          curDate: d,
          selectedDate: y + '/' + mon + '/' + d,
          selectedWeek: this.data.weekArr[i],
          meeting: selfMeetingData.concat(invitedMeetingsData),
          loader: false,
        }); 

        this.getDateList(y, mon - 1);
        this.mergeResult();
        console.log('print this.data');
        console.log("length" + invitedMeetingsData.length);
        console.log(this.data);
      });
    });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

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

// 上個月
preMonth: function() {
  if (this.data.loader) {
      return false;
  }
  var vm = this;
  var curYear = vm.data.curYear;
  var curMonth = Util.checkTime(vm.data.curMonth, true);
  curYear = curMonth - 1 ? curYear : curYear - 1;
  curMonth = curMonth - 1 ? curMonth - 1 : 12;
  curMonth = Util.checkTime(curMonth);
  this.setData({
      loader: true,
      curYear: curYear,
      curMonth: curMonth,
  });
  var meetings = [];
  this.getSelfMeetingsByDate(curYear, curMonth).then((resp) => {
      if (resp.data.data && Array.isArray(resp.data.data)) {
          resp.data.data.forEach(event => {
              event.type = 'self'; // 自建行程的类型
          });
          meetings.push(...resp.data.data);
      }
      return this.getInvitedMeetingsByDate(curYear, curMonth);
  }).then((resp) => {
      if (resp.data.data && Array.isArray(resp.data.data)) {
          resp.data.data.forEach(event => {
              event.type = 'invited'; // 邀请行程的类型
          });
          meetings.push(...resp.data.data);
      }
      this.setData({
          meeting: meetings,
          loader: false
      });
      this.getDateList(curYear, curMonth - 1);
      this.mergeResult();
  });
},

// 下個月
nextMonth: function() {
  if (this.data.loader) {
      return false;
  }
  var vm = this;
  var curYear = vm.data.curYear;
  var curMonth = Util.checkTime(vm.data.curMonth, true);
  curYear = curMonth + 1 === 13 ? curYear + 1 : curYear;
  curMonth = curMonth + 1 === 13 ? 1 : curMonth + 1;
  curMonth = Util.checkTime(curMonth);
  this.setData({
      loader: true,
      curYear: curYear,
      curMonth: curMonth,
  });
  var meetings = [];
  this.getSelfMeetingsByDate(curYear, curMonth).then((resp) => {
      if (resp.data.data && Array.isArray(resp.data.data)) {
          resp.data.data.forEach(event => {
              event.type = 'self'; // 自建行程的类型
          });
          meetings.push(...resp.data.data);
      }
      return this.getInvitedMeetingsByDate(curYear, curMonth);
  }).then((resp) => {
      if (resp.data.data && Array.isArray(resp.data.data)) {
          resp.data.data.forEach(event => {
              event.type = 'invited'; // 邀请行程的类型
          });
          meetings.push(...resp.data.data);
      }
      this.setData({
          meeting: meetings,
          loader: false
      });
      this.getDateList(curYear, curMonth - 1);
      this.mergeResult();
  });
},

  
  // 顯示自己的行程
  getSelfMeetingsByDate: function(year, month) {
    return new Promise((resolve, reject) => {
      getApp().getToken().then(token => {
        wx.request({
          url: Config.service.getEventList + `?year=${year}&month=${month}&token=${token}`,
          success(result) {
            resolve(result.data)
          },
          fail(error) {
            reject(error);
          }
        })
      });
    });
  },

 // 顯示邀請的行程
 getInvitedMeetingsByDate: function(year, month) {
  return new Promise((resolve, reject) => {
      getApp().getToken().then(token => {
          wx.request({
              url: Config.service.getInvites + `?year=${year}&month=${month}&token=${token}`,
              success(result) {
                  if (Array.isArray(result.data.data)) {
                      // 如果是数组，处理数据
                      result.data.data.forEach(event => {
                          event.type = 'invited';
                          console.log('Invited event:', event);
                      });
                  } else {
                      // 如果不是数组，打印数据内容，便于调试
                  }
                  resolve(result.data);
              },
              fail(error) {
                  reject(error);
              }
          })
      });
  });
},



mergeResult: function() {
    console.log("triggered mergeResult");
    let meeting = this.data.meeting;
    let dateList = this.data.dateList;
    let nowDate = new Date();
    let curYear = parseInt(this.data.curYear);
    let curMonth = parseInt(this.data.curMonth);

    for (let i = 0; i < meeting.length; i++) {
        let meetingDate = new Date(Util.correctDateString(meeting[i].date));
        // console.log(`Meeting date: ${meeting[i].date}, Parsed: ${meetingDate}, Type: ${meeting[i].type}`);

        // 处理过期的活动
        if (nowDate > new Date(Util.correctDateString(`${meeting[i].date} ${meeting[i].start_time}`))) {
            meeting[i].color = 'e6e6e5'; // 过期活动设为灰色
        } else if (meeting[i].is_participating === 0) { // 判断是否未参与
            meeting[i].color = 'rgba(94, 218, 116, 0.5)'; // 未参与的活动透明绿色显示
            meeting[i].border = '2px solid #5eda74'; // 添加绿色外框线
        } else if (meeting[i].type === 'invited') {
            meeting[i].color = '5eda74'; // 邀请的活动用绿色显示
        } else {
            meeting[i].color = 'ff6280'; // 自己创建的活动用蓝色显示
        }
    }

    for (let arrList of dateList) {
        for (let elem of arrList) {
            let meetings = meeting.filter((m) => {
                let date = new Date(Util.correctDateString(m.date));
                // console.log(`Filtering by: ${curYear}-${curMonth}, Meeting date: ${date.getFullYear()}-${date.getMonth() + 1}`);
                // 确保年份和月份匹配
                return date.getFullYear() === curYear && (date.getMonth() + 1) === curMonth && date.getDate() === elem.date;
            });

            // 如果找到了与当前日期匹配的活动，则将其添加到日期对象中
            if (meetings.length > 0) {
                elem.meetings = meetings;
            } else {
                elem.meetings = []; // 确保没有活动时是空数组
            }
        }
    }

    this.setData({
        resultArr: dateList
    });

    console.log("显示dateList");
    console.log(dateList);
}



});