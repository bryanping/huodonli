import cashUtil from '../../utils/cashUtil.js';
import Util from '../../utils/util.js';
import Config from '../../config.js';

Page({
  data: {
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
    meeting: [],
    loader: true,
    options: null,
  },

  preMonth: function () {
    var vm = this;
    var curYear = vm.data.curYear;
    var curMonth = Util.checkTime(vm.data.curMonth, true);
    curYear = curMonth - 1 ? curYear : curYear - 1;
    curMonth = curMonth - 1 ? curMonth - 1 : 12;
    curMonth = Util.checkTime(curMonth);

    this.getMeetingsByDate(curYear, curMonth).then(resp => {
      this.setData({
        curYear: curYear,
        curMonth: curMonth,
        meeting: resp.data.data
      });

      this.getDateList(curYear, curMonth - 1);
      this.mergeResult();
    });
  },
  nextMonth: function () {
    var vm = this;
    var curYear = vm.data.curYear;
    var curMonth = Util.checkTime(vm.data.curMonth, true);

    curYear = curMonth + 1 === 13 ? curYear + 1 : curYear;
    curMonth = curMonth + 1 === 13 ? 1 : curMonth + 1;
    curMonth = Util.checkTime(curMonth);

    this.getMeetingsByDate(curYear, curMonth).then(resp => {
      this.setData({
        curYear: curYear,
        curMonth: curMonth,
        meeting: resp.data.data
      });

      this.getDateList(curYear, curMonth - 1);
      this.mergeResult();
    });
  },

  onShow: function () {
     const { options } = this.data;
    var today = new Date();
    var y = today.getFullYear();
    var mon = Util.checkTime(today.getMonth() + 1);

    var d = today.getDate();
    var i = today.getDay();

    this.getMeetingsByDate().then((meeting) => {
      this.setData({
        curYear: y,
        curMonth: mon,
        curDate: d,
        selectedDate: y + '/' + mon + '/' + d,
        selectedWeek: this.data.weekArr[i],
        meeting: meeting.data.data,
        loader:false
      });

      //this.getDateList(y, mon - 1);
      console.log(meeting.data.data)
      this.mergeResult();
    });

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
  
  getMeetingsByDate: function (year, month) {
    return new Promise((resolve, reject) => {
      getApp().getToken().then(token => {
        wx.request({
          url: Config.service.getInvites + `?year=${year}&month=${month}&token=${token}`,
          success(result) {
            console.log(result);
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
    this.setData({
      empty: meeting.length === 0
    });
      //控制顯示內容
    for(let i = 0; i < meeting.length; i++){
      // If event is outdated
      if (nowDate > new Date(Util.correctDateString(`${meeting[i].date} ${meeting[i].start_time}`))) {
        meeting[i].color = 'e6e6e5';
      } else {
        //console.log(meeting[i]);
      }
      console.log(meeting[i]);

      meeting[i].date = Util.shatterDate(meeting[i].date);
      let Y = meeting[i].date.Y;
      let monthDay = meeting[i].date.M + '.' + meeting[i].date.D;
      if (!resultArr[Y]){
        resultArr[Y] = {};
      }
      if (!resultArr[Y][monthDay]){
        resultArr[Y][monthDay] = [];
      }
      resultArr[Y][monthDay].push(meeting[i]);
    }
    console.log(resultArr);
    this.setData({
      resultArr: resultArr
    }); 
  }
})
