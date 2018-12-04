import Meeting from '../../../../models/Meeting.js';
import Config from '../../../../config.js';
import Util from '../../../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    how_long: '',
    destination: '',
    color: '',
    mapObj: undefined,
    tips: [],
    submit_text: '',
    weekArr: '',
    members: [],
    AllMembers: [],
    showAllMembers: false,
    showAllText: 'Show all',
    showSubmit: false,
    loader: true,
    information: '',
    request: false
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
      
      let submit_text = '';
      switch (obj.user) {
        case Meeting.USER_CREATOR:
        case Meeting.USER_MEMBER:
          submit_text = 'Share';
          break;
        default:
          submit_text = 'Join';
          break;
      }

      // <DEBUG ONLY>
      /*let fakeMembers = [];
      for(let j = 0; j < 50; j++){
        fakeMembers.push(obj.members[0]);
      }
      obj.members = fakeMembers; */
      // </DEBUG ONLY>

      let members = [];
      if(obj.members.length > 7){
          for(let i = 0;  i < 7; i++){
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
        members: members
      });
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

  // actionSheetTap: function () {
  //   wx.showActionSheet({
  //     itemList: ['分享給好友', '保存圖片分享朋友圈'],
  //     success: function (e) {
  //       if (tapIndex == 0) {
  //       console.log('Share');
  //       console.log(res);
  //       }
  //       if (tapIndex == 1) {
  //         wx.saveImageToPhotosAlbum({
  //           filePath: res.tempFilePath,
  //         })
  //         wx.showToast({
  //           title: '保存成功',
  //           icon: 'success',
  //           duration: 1500
  //         });
  //       }	

  //     },
  //      fail: function (res) {
  //       console.log(res.errMsg)
  //     }   
  //   })
  // },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

    return {
      title: '分享' + this.data.title,
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

  openActionSheet(e) {
    var self = this;
    self.setData({
      actionSheetHidden: !self.data.actionSheetHidden
    });

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

  listenerActionSheet: function () {
    var self = this;
    self.setData({
      actionSheetHidden: !self.data.actionSheetHidden
      
    })
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
        console.log('request success', result)
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


  viewAllMembers: function (e){
    let showAllMembers = !this.data.showAllMembers;
    if (showAllMembers){
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