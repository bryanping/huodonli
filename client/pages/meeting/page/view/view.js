//pages/meeting/page/view/view.js

import Meeting from '../../../../models/Meeting.js';
import Config from '../../../../config.js';
import Util from '../../../../utils/util.js';
let QRCode = require('../../../../utils/qrCode.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    submit_text: '',
    selectedDate: '',
    selectedWeek: '',
    curYear: '',
    curMonth: '',
    curDate: '',
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    AllMembers: [],
    showAllMembers: false,
    showAllText: 'Show all',
    showSubmit: false,
    loader: true,
    information: '',
    resultArr: [],
    request: false,
    isopen: true,
    state: "关注",
    viewshow: 'none',
    actionSheetHidden: true,
    qrCode: '',
    text: '',
    colorTypeSel: 'colorLight',
    cp_cus: ['#000', '#fff', '#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'],
    cp_color: '',
    loadingDelete: false,
    loadingLeave: false,
    hasLeft: false,  // 新增字段，用于标记用户是否已退出
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
      let isParticipant = obj.is_participating === 1;
      let submit_text = '';
      let isCreator = false;
      let isParticipant = false;
      switch (obj.user) {
        case Meeting.USER_CREATOR:
          submit_text = 'Share';
          isCreator = true;
          break;
        case Meeting.USER_MEMBER:
          submit_text = 'Share';
          isParticipant = true;
          break;
        default:
          submit_text = 'Join';
          hasLeft = true; // 如果用户不再参与活动，标记为已退出
          break;
      }

      // <DEBUG ONLY>
      // let fakeMembers = [];
      // for(let j = 0; j < 50; j++){
      //   fakeMembers.push(obj.members[0]);
      // }
      // obj.members = fakeMembers; 
      // </DEBUG ONLY>

      let members = [];
      if (obj.members.length > 7) {
        for (let i = 0; i < 7; i++) {
          members.push(obj.members[i]);
        }
      } else {
        members = obj.members;
      }

      let startTimeHourse = parseInt(obj.start_time.split(':')[0]);
      let startTimeMinutes = parseInt(obj.start_time.split(':')[1]);

      let endTimeHourse = parseInt(obj.end_time.split(':')[0]);
      let endTimeMinutes = parseInt(obj.end_time.split(':')[1]);

      let differenceHourse = endTimeHourse - startTimeHourse;
      let differenceMinutes = endTimeMinutes - startTimeMinutes;

      if (differenceHourse < 0) {
        differenceHourse = 24 - Math.abs(differenceHourse);
      }

      if (differenceMinutes < 0) {
        differenceMinutes = 60 - Math.abs(differenceMinutes);
        if (differenceHourse == 0) {
          differenceHourse = 24;
        }
        differenceHourse--;
      }

      this.setData({
        id: obj.id,
        title: obj.title,
        color: obj.color,
        date: obj.date,
        how_long: Util.checkTime(differenceHourse) + ":" + Util.checkTime(differenceMinutes),
        start_time: obj.start_time,
        end_time: obj.end_time,
        destination: obj.destination,
        submit_text: submit_text,
        mapObj: obj.mapObj ? JSON.parse(obj.mapObj) : undefined,
        loader: false,
        AllMembers: obj.members,
        members: obj.members,
        isCreator: isCreator, // 设置身份标识
        isParticipant: isParticipant, // 设置身份标识
        hasLeft: hasLeft,
      });
    });
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
  onShow: function () {
    const {
      options
    } = this.data;
    var text = 'pages/share/share?id=' + this.data.id ;
    var today = new Date();
    var y = today.getFullYear();
    var mon = Util.checkTime(today.getMonth() + 1);
    var d = today.getDate();
    var i = today.getDay();
    this.setData({
      curYear: y,
      curMonth: mon,
      curDate: d,
      selectedDate: y + '/' + mon + '/' + d,
      selectedWeek: this.data.weekArr[i],
      actionSheetHidden: this.data.actionSheetHidden || true ,
    });
    console.log(text)
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
  showActionSheet: function() {
    this.setData({
      actionSheetHidden: false
    });
  },

  // 隐藏 action-sheet 的方法
  hideActionSheet: function() {
    this.setData({
      actionSheetHidden: true
    });
  },

  // 处理 action-sheet 中的选项点击事件
  listenerActionSheet: function(event) {
    console.log('Action sheet option selected:', event);
    this.hideActionSheet(); // 隐藏 action-sheet
  },
  actionSheetTap: function () {
    this.setData({
      actionSheetHidden: false
    })

    
    // wx.showActionSheet({
    //   itemList: ['分享給好友', '生成分享卡片'],
    //   success: function (e) {
    //     if (tapIndex == 0) {

    //     console.log('Share');
    //     }

    //     if (tapIndex == 1) {
    //       wx.saveImageToPhotosAlbum({
    //         filePath: res.tempFilePath,
    //       })
    //       wx.showToast({
    //         title: '保存成功',
    //         icon: 'success',
    //         duration: 1500
    //       });
    //     }	
    //   },
    //    fail: function (res) {
    //     console.log(res.errMsg)
    //   }   
    // })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  openActionSheet(e) {
    var self = this;
    self.setData({
      actionSheetHidden: !self.data.actionSheetHidden
    });

  },
  listenerActionSheet: function () {
    var self = this;
    self.setData({
      actionSheetHidden: !self.data.actionSheetHidden
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: "你有一个行程邀请：" + this.data.title,
      path: 'pages/share/share?id=' + this.data.id,
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
    console.log('pages/share/share?id=' + this.data.id)
  },



  bindMaptop: function () {
    // console.log({
    //   longitude: this.data.mapObj.longitude,
    //   latitude: this.data.mapObj.latitude,
    //   name: this.data.destination,
    //   address: this.data.mapObj.address
    // });
    wx.openLocation({
      longitude: Number(this.data.mapObj.longitude),
      latitude: Number(this.data.mapObj.latitude),
      name: this.data.destination,
      address: this.data.mapObj.address
    })
  },

  buttontap: function () {
    if (this.data.isopen) {
      this.setData({
        state: "已关注"
      })
    } else {
      this.setData({
        state: "关注"
      })
    }
    this.data.isopen = !this.data.isopen
  },


  formSubmit: function (e) {
    let id = this.data.id;
    let token = getApp().globalData.token;
    this.setData({
      request: true
    });
    let options = {
      url: Config.service.acceptInvite,
      method: "post",
      data: {
        token: token,
        event_id: id
      },
      login: true,
      success(result) {
        console.log('request success', result);
        this.setData({
          isParticipant: true // 更新状态为已参与
        });
        wx.reLaunch({
          url: '/pages/index/index',
        })
      },
      fail(error) {
        console.log('request fail', error);
      }
    }
    wx.request(options);
  },

  // code() {
  //   let _this = this
  //   _this.data.qrCode = new QRCode('canvas', {
  //     text: url('pages/share/share?id=' + _this.data.id),
  //     width: '200',
  //     height: '200',
  //     colorLight: _this.data.colorLight,
  //     colorDark: _this.data.colorDark,
  //     correctLevel: QRCode.CorrectLevel.H
  //   })
  //   console.log(text);
  // },

  download() {
    this.data.qrCode.exportImage(function (res) {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.qrCode,
        success(ret) {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });
        },
        fail() {
          wx.showToast({
            title: '保存失败',
            duration: 2000
          });
        }
      });
      console.log(qrCode)
    })
  },

  navigateToUpdate: function() {
    const id = this.data.id; // 从 data 中获取活动的 ID
    wx.navigateTo({
      url: `/pages/meeting/page/update/update?id=${id}`,
    });
  },

  onLeaveEvent: function () {
    // 确保正在执行退出操作时不重复触发
    if (this.data.loadingLeave) {
        return;
    }

    this.setData({
        loadingLeave: true
    });

    wx.showModal({
        title: '确认',
        content: '你确定要退出这个活动吗？',
        confirmText: '确认',
        cancelText: '取消',
        showCancel: true,
        success: (res) => {
            if (res.confirm) {
                const id = this.data.id;
                getApp().getToken().then(token => {
                    wx.request({
                        url: Config.service.cancelParticipation,  // 你的API路径
                        method: "POST",
                        data: {
                            token: token,
                            event_id: id
                        },
                        success: (result) => {
                            console.log('退出成功', result);
                            this.setData({
                              isParticipant: false,
                              hasLeft: true,
                              // color: 'transparent',  // 透明背景
                              // border: '2px solid #ccc'  // 边框样式
                            });
                            wx.reLaunch({
                                url: '/pages/meeting/meeting',
                            });
                        },
                        fail: (error) => {
                            console.log('退出失败', error);
                            this.setData({
                                loadingLeave: false
                            });
                        }
                    });
                });
            } else {
                // 用户取消退出
                this.setData({
                    loadingLeave: false
                });
            }
        }
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
    for (let i = 0; i < meeting.length; i++) {
      // If event is outdated
      meeting[i].color = '5eda74';
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

  onDelete: function() {
    // 确保正在执行删除操作时不重复触发
    if (this.data.loadingDelete) {
      return;
    }

    // 设置 loading 状态，防止重复点击
    this.setData({
      loadingDelete: true
    });

    wx.showModal({
      title: '警告',
      content: '你即将删除已发布的活动',
      confirmText: '确认',
      cancelText: '取消',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          // 调用删除操作的接口
          const id = this.data.id;
          getApp().getToken().then(token => {
            wx.request({
              url: Config.service.deleteEvent,
              method: "POST",
              data: {
                token: token,
                event_id: id
              },
              success: (result) => {
                console.log('删除成功', result);
                wx.reLaunch({
                  url: '/pages/meeting/meeting',
                });
              },
              fail: (error) => {
                console.log('删除失败', error);
                this.setData({
                  loadingDelete: false
                });
              }
            });
          });
        } else {
          // 用户取消删除
          this.setData({
            loadingDelete: false
          });
        }
      }
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
  }
})