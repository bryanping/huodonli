// pages/meeting/meeting.js

import cashUtil from '../../utils/cashUtil.js';
import Util from '../../utils/util.js';
import Config from '../../config.js';

Page({
  
  /**
   * 页面的初始数据
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
      dateList : [],
      resultArr: [],
      loader: true,
      options: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { options } = this.data;
    let today = new Date();
    let y = options.y || today.getFullYear();
    let mon = Util.checkTime(options.mon || (today.getMonth() + 1));
    let d = today.getDate();
    let i = today.getDay();


    this.getMeetingsByDate(y, mon).then(resp => {
      this.setData({
        curYear: y,
        curMonth: mon,
        curDate: d,
        selectedDate: y + '/' + mon + '/' + d,
        selectedWeek: this.data.weekArr[i],
        meeting: resp.data.data,
        loader: false
      });

      this.getDateList(y, mon - 1);
      this.mergeResult();
    });
  },
/**var that = this 
var list = wx.getStorageSync('winAwards') || {data:[]}
    var that = this;
    wx.request({
      url: app.globalData.web_url + 'yourApi?open_id=' + wx.getStorageSync('open_id'),
      success: function (res) {
        that.setData({
          cartList: res.data.cartList,
          cartSize: res.data.cartSize,
          totalAmount: res.data.totalAmount
        })
      }
    })*/

 


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  getDateList: function (y, mon) {
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
    var weekIndex = 0;//第几个星期
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
  preMonth:  function() {
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
      curMonth: curMonth
    });


    this.getMeetingsByDate(curYear, curMonth).then(resp => {
      this.setData({
        meeting: resp.data.data,
        loader: false
      });

      this.getDateList(curYear, curMonth - 1);
      this.mergeResult();
    });
  },
  nextMonth:  function () {
    if(this.data.loader){
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

    this.getMeetingsByDate(curYear, curMonth).then(resp => {
      this.setData({
        meeting: resp.data.data,
        loader:false
      });

      this.getDateList(curYear, curMonth - 1);
      this.mergeResult();
    });
  },
  getMeetingsByDate: function (year, month) {
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
  mergeResult: function(){
    let meeting = this.data.meeting;
    let dateList = this.data.dateList;
    let nowDate = new Date();
    console.log(`nowDate=${nowDate}`);
    for (let i = 0; i < meeting.length; i++){
      // console.log(meeting[i].date + ' ' + meeting[i].start_time);
      if (nowDate > new Date(Util.correctDateString(`${meeting[i].date} ${meeting[i].start_time}`))) {
        meeting[i].color = 'e6e6e5';
      }
    }
    for(let arrList of dateList){
      for(let elem of arrList){
           let meetings = meeting.filter((m) => {
             let date = new Date(Util.correctDateString(m.date));
               return date.getDate() === elem.date;
           });
           if(meetings.length > 0){
            elem.meetings = meetings;
           }
      }
    }
    this.setData({
      resultArr: dateList
    }); 
  }
});