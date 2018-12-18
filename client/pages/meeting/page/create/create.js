// pages/meeting/page/create/create.js
import amapFile from '../../../../libs/amap-wx.js';
import Meeting from '../../../../models/Meeting';
import Util from '../../../../utils/util.js';
import Config from '../../../../config.js';

var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    detail: '',
    how_long: '00:00',
    destination: '',
    color: 'ff6280',
    mapObj: undefined,
    imageList: [],
    tips: [],
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    daysCountArr: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    loading: false,
    sourceTypeIndex: 2,
    sourceType: ['拍照', '相册', '拍照或相册'],
    sizeTypeIndex: 2,
    sizeType: ['压缩', '原图', '压缩或原图'],
    countIndex: 2,
    count: [1, 2, 3,],
    options: null,
    formId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let date = new Date();
    let time = Util.checkTime(date.getHours()) + ':' + Util.checkTime(date.getMinutes());
    this.setData({
      title: '',
      start_time: time,
      end_time: time,
      date: date.getFullYear() + '-' + Util.checkTime(date.getMonth() + 1) + '-' + Util.checkTime(date.getDate()),
      destination: '',
      color: 'ff6280',
      mapObj: false,
      how_long: '00:00',
      imageList: '',
      tips: []
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
    const {
      options
    } = this.data;
    var today = new Date();
    var y = today.getFullYear();
    var mon = Util.checkTime(today.getMonth() + 1);
    var d = today.getDate();
    var i = today.getDay();
  },

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

  bindKeyInput: function (e) {
    let str = e.detail.value;
    this.setData({
      title: str
    })
  },

  bindDateStart: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  // changecolor: function(e) {
  //   let color = e.currentTarget.dataset.color;
  //   this.setData({
  //     color: color
  //   })
  // },
  // getDateList: function (y, mon) {
  //   var vm = this;
  //   //如果是否闰年，则2月是29日
  //   var daysCountArr = this.data.daysCountArr;
  //   if (y % 4 == 0 && y % 100 != 0) {
  //     this.data.daysCountArr[1] = 29;
  //     this.setData({
  //       daysCountArr: daysCountArr
  //     });
  //   }
  //   var dateList = [];
  //   dateList[0] = [];
  //   var weekIndex = 0; //第几个星期
  //   for (var i = 0; i < vm.data.daysCountArr[mon]; i++) {
  //     var week = new Date(y + '/' + (mon + 1) + '/' + (i + 1)).getDay();
  //     dateList[weekIndex].push({
  //       value: y + '/' + (mon + 1) + '/' + (i + 1),
  //       date: i + 1,
  //       week: week
  //     });
  //     if (week == 0) {
  //       weekIndex++;
  //       dateList[weekIndex] = [];
  //     }
  //   }
  //   vm.setData({
  //     dateList: dateList
  //   });
  // },
  
  // getdays: function (day1, day2) {
  //   var that = this;
  //   var d1 = day1;
  //   var d2 = day2;
  //   d1 = d1.replace(/\-/g, "/");
  //   d2 = d2.replace(/\-/g, "/");
  //   var date1 = new Date(d1);
  //   var date2 = new Date(d2);
  //   var days = Math.ceil((date2 - date1) / (24 * 60 * 60 * 1000));
  //   return days;
  // },

  submit: function (e) {
    console.log(e.detail.formId);
  },
  

  formSubmit: function (e) {
    let formId = e.detail.formId;
    this.dealFormIds(formId);
    let type = e.detail.target.dataset.type;
    // 忽略开发者工具里边的formId
    if (formId && formId !== 'the formId is a mock one') {
      wx.request({
        method: 'POST',
        url: '/api/collectFormId', // 该接口只用来收集formId
        data: { formId: formId } // 只传了一个formId，因为openid和当前用户通常会事先在后台做一个关联，看具体业务了
      });
    }
    console.log("推送碼為：" + e.detail.formId)
    if (this.data.loading) {
      return;
    }
    let title = this.data.title;
    let color = this.data.color;
    let date = this.data.date;
    let start_time = this.data.start_time;
    let end_time = this.data.end_time;
    let mapObj = this.data.mapObj;
    let destination = this.data.destination;
    let imageList = this.data.imageList;
    let obj = {
      title: title,
      color: color,
      date: date,
      start_time: start_time,
      end_time: end_time,
      destination: destination,
      mapObj: mapObj,
      imageList: imageList,
      formId,
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
      loading: true
    });
    let that = this;
    meeting.save().then((res) => {
      let date = new Date();
      let time = Util.checkTime(date.getHours()) + ':' + Util.checkTime(date.getMinutes());
      that.setData({
        title: '',
        start_time: time,
        end_time: time,
        date: date.getFullYear() + '-' + Util.checkTime(date.getMonth() + 1) + '-' + Util.checkTime(date.getDate()),
        destination: '',
        color: 'ff6280',
        mapObj: false,
        how_long: '00:00',
        tips: [],
        imageList: [],
        loading: false
      });
      
      wx.navigateTo({
        url: '/pages/meeting/page/update/update?id=' + res.data.data.id,
      })
    });
  },
  dealFormIds: function (formId) {
    let formIds = app.globaData.globaFormIds;
    if (!formIds) formIds = [];
    let data = {
      formId: formId,
      expire: parseInt(new Date().getTime() / 1000) + 604800
    }
    formIds.push(data);
    app.globaData.globaFormIds = formIds;
  },
  
  bindlinechange: function (e) {
    var height = e.detail.height;
    var heightRpx = e.detail.heightRpx;
    var lineCount = e.detail.lineCount;
    this.setData({
      log: "height=" + height + "  |  heightRpx=" + heightRpx + "  |  lineCount=" + lineCount
    })
  },

  bindTime: function (e) {
    let time = new Date(this.data.date + ' ' + e.detail.value);
    time.setMinutes(time.getMinutes() + parseInt(this.data.how_long.split(':')[1]));
    time.setHours(time.getHours() + parseInt(this.data.how_long.split(':')[0]));
    this.setData({
      start_time: e.detail.value,
      end_time: Util.checkTime(time.getHours()) + ':' + Util.checkTime(time.getMinutes())
    });
  },

  bindEndTime: function (e) {
    let how_long = Util.calculateHowLong(this.data.start_time, e.detail.value);
    this.setData({
      end_time: e.detail.value,
      how_long: how_long
    });
  },

  bindHowLong: function (e) {
    let time = new Date(this.data.date + ' ' + this.data.start_time);
    time.setMinutes(time.getMinutes() + parseInt(e.detail.value.split(':')[1]));
    time.setHours(time.getHours() + parseInt(e.detail.value.split(':')[0]));
    this.setData({
      how_long: e.detail.value,
      end_time: Util.checkTime(time.getHours()) + ':' + Util.checkTime(time.getMinutes())
    });
  },


  // bindDestinationInput: function (e) {
  //   let that = this;
  //   let keywords = e.detail.value;
  //   let myAmapFun = new amapFile.AMapWX({
  //     key: Config.key.AMapWX
  //   });
  //   myAmapFun.getInputtips({
  //     keywords: keywords,
  //     location: '',
  //     success: function (data) {
  //       if (data && data.tips) {
  //         let tips = data.tips;
  //         that.setData({
  //           tips: tips.filter(tip => tip.location.length > 0)
  //         });
  //       }

  //     }
  //   })
  // },

  bindMapSelection: function (e) {
    console.log('hello world');
    var that = this
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        let mapObj = {};
        console.log(mapObj);
        // let buff = elem.location.split(',');
        mapObj.longitude = res.longitude;
        mapObj.latitude = res.latitude;
        mapObj.address = res.address;
        mapObj.markers = [];
        let marker = {
          iconPath: "../../../../img/marker.png",
          longitude: res.longitude,
          latitude: res.latitude,
          width: 20,
          height: 30
        };
        mapObj.markers.push(marker);
        console.log(mapObj);
        that.setData({
          tips: [],
          hasLocation: true,
          destination: res.name + ' - ' +res.address,
          mapObj: mapObj
        });

      }
    })
  },

  mapEvent: function (e) {
    console.log(e);
  },
  bindSearch: function (e) {
    let id = e.target.dataset.id;
    let elem = this.data.tips.find(s => s.id === id);
    console.log(elem);
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
      height: 30
    };
    mapObj.markers.push(marker);
    if (elem && elem.name) {
      this.setData({
        tips: [],
        destination: elem.name,
        mapObj: mapObj
      });
    }
  },
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      count: this.data.count[this.data.countIndex],
      success: function (res) {
        console.log(res)
        that.setData({
          imageList: res.tempFilePaths
        })
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src

    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  }
})