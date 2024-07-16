// client/pages/user/page/join/join.js

import Meeting from '../../../../models/Meeting.js';
import Config from '../../../../config.js';
import Util from '../../../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAllMembers: false,
    showAllText: 'Show all',
    showSubmit: false,
    loader: true,
    information: '',
    request: false,
    AllMembers: [],
    members: [],
    color: '',
    date: '',
    destination: '',
    end_time: '',
    id: '',
    mapObj: undefined,
    members: [],
    start_time: '',
    title: '',
    how_long: '',
    selectedDate: '',
    selectedWeek: '',
    curYear: '',
    curMonth: '',
    curDate: '',
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    resultArr: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let obj = Meeting.findById(options.id).then(resp => {
      if (!resp.data || !resp.data.data) {
        wx.showModal({
          title: '',
          content: '活动已取消',
          confirmText: '确认',
          showCancel: false,
          success: function (res) {
            wx.reLaunch({
              url: '/pages/index/index',
            });
          }
        });
      }
      let obj = resp.data.data;
      let members = [];
      this.setData({
        id: obj.id,
        title: obj.title,
        mapObj: obj.mapObj ? JSON.parse(obj.mapObj) : undefined,
        loader: false,
        AllMembers: obj.members,
        members: obj.members
      });
      console.log(obj);
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
  onShareAppMessage: function (res) {

    return {
      title: "你有一个行程邀请：" + this.data.title,
      path: 'pages/user/page/join/join?id=' + this.data.id,
      success: function (res) {
        // Forwarding successful
        console.log("Share successfull");
        console.log(res);
      },
      fail: function (res) {
        // Forwarding failed
        console.log("Share failed");
        console.log(res);
      }
    }
    console.log('pages/user/page/join/join?id=' + this.data.id)
  },

  openActionSheet(e) {
    var self = this;
    self.setData({
      actionSheetHidden: !self.data.actionSheetHidden
    });

  },

  viewAllMembers: function (e) {
    let showAllMembers = !this.data.showAllMembers;
    if (showAllMembers) {
      this.setData({
        members: this.data.AllMembers,
        showAllText: '隐藏',
        showAllMembers: showAllMembers
      });
    } else {
      let members = [];
      for (let i = 0; i < 7; i++) {
        members.push(this.data.AllMembers[i]);
      }
      this.setData({
        showAllMembers: showAllMembers,
        showAllText: '显示全部名单',
        members: members
      });
    }
  },

})