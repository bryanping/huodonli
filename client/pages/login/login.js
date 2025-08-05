// pages/scope/scope.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewshow: 'none',
  },

  getUserInfo: function (e) {
    // 检查是否支持wx.getUserProfile
    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，不超过30个字符
        success: (res) => {
          console.log('getUserProfile success', res);
          // 获取到用户信息后，调用app.js中的登录逻辑
          getApp().loginWithUserProfile(res.userInfo);
          wx.reLaunch({
            url: '/pages/meeting/meeting',
          })
        },
        fail: (res) => {
          console.log('getUserProfile fail', res);
          if (res.errMsg === "getUserProfile:fail auth deny") {
            wx.showToast({
              icon: 'none',
              title: '需要授权才能使用'
            })
          }
        }
      })
    } else {
      // 兼容低版本，使用旧的getUserInfo方式
      if (e.detail && e.detail.rawData && e.detail.userInfo) {
        getApp().loginWithUserProfile(e.detail.userInfo);
        wx.reLaunch({
          url: '/pages/meeting/meeting',
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '获取用户信息失败'
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  
})