import cashUtil from '../../utils/cashUtil.js';
import Util from '../../utils/util.js';
import Config from '../../config.js';

Page({
  data: {
    meeting: [],
    request: [],
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
    currentTab: 0,
    viewshow: 'none',
  },

  // 页面首次渲染完毕时执行
  onReady: function () {
    var that = this
    setTimeout(function () {
      that.setData({
        viewshow: 'block'
      })
    }, 200)
    for (var i = 1; i < 101; i++) {
      that.setData({
        percent: i
      })
    }
  },
  // 页面出现在前台时执行
  onShow: function () {
    const {
      options
    } = this.data;
    var today = new Date();
    var y = today.getFullYear();
    var mon = Util.checkTime(today.getMonth() + 1);
    var d = today.getDate();
    var i = today.getDay();
    this.getInvitedMeetingsByDate().then((meeting) => {
      this.setData({
        curYear: y,
        curMonth: mon,
        curDate: d,
        selectedDate: y + '/' + mon + '/' + d,
        selectedWeek: this.data.weekArr[i],
        meeting: meeting.data.data,
        loader: false
      });

      // console.log("this.data.weekArr[i]");
      // console.log(this.data.weekArr[i]);
      //this.getDateList(y, mon - 1);
      this.mergeResult();
    });
  },

  // 页面被用户分享时执行
  onShareAppMessage: function () {
  },

  onLoad: function (options) {
    // 打开首页时判断options.positionId是否存在 用这个值来判断进入首页的来源是否为用户点击了分享的卡片
    // 同时可以通过获取到的positionId的值跳转导航到对应的分享详情页
    if (options.id) {
      setTimeout(function () {
        wx.navigateTo({
          url: '../share/share?id=' + options.id
        })
      }, 800)
    }
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

  getInvitedMeetingsByDate: function (year, month) {
    return new Promise((resolve, reject) => {
      getApp().getToken().then(token => {
        wx.request({
          url: Config.service.getInvites + `?year=${year}&month=${month}&token=${token}`,
          success(result) {
            resolve(result.data)
          },
          fail(error) {
            reject(error);
          }
        })
      });
      console.log("pirit Config");
    });
  },

  getLinsMeetingsByopneid: function (year, month) {
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

  mergeResult: function () {
    let meeting = this.data.meeting;
    let dateList = this.data.dateList;
    let nowDate = new Date().getTime();
    let resultArr = {};

    //印出resultArr得到的東西
    console.log(meeting);

    this.setData({
      empty: meeting.length === 0
    });
    //控制顯示內容
    for (let i = 0; i < meeting.length; i++) {
      // If event is outdated
      meeting[i].color = '5eda74'; //綠色
      meeting[i].date = Util.shatterDate(meeting[i].date);
      let Y = meeting[i].date.Y;
      let monthDay = meeting[i].date.M + '.' + meeting[i].date.D;
      if (!resultArr[Y]) {
        resultArr[Y] = {};
      }
      if (!resultArr[Y][monthDay]) {
        resultArr[Y][monthDay] = [];
      }
      resultArr[Y][monthDay].push(meeting[i]);
    }
    this.setData({
      resultArr: resultArr
    });
  },

  swichNav: function (e) {
    console.log(e);
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },
  swiperChange: function (e) {
    console.log(e);
    this.setData({
      currentTab: e.detail.current,
    })
  }
})