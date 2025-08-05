//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
  config: {
    host: 'https://95278436.huodonli.cn' // 这个地方填写你的域名
  },
  onLaunch: function () {
    this.loadUserData();
  },

  loadUserData: function(){
    qcloud.setLoginUrl(config.service.loginUrl)
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.requestCode = res.code;
        // 检查是否已有token，如果有则直接使用
        const token = wx.getStorageSync('token');
        if (token) {
          this.globalData.token = token;
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo) {
            this.globalData.userInfo = userInfo;
          }
        } else {
          // 没有token，跳转到登录页面
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },

  // 新增：使用wx.getUserProfile获取用户信息后的登录方法
  loginWithUserProfile: function(userInfo) {
    wx.login({
      success: res => {
        this.globalData.requestCode = res.code;
        this.globalData.userInfo = userInfo;
        this.addUser(res.code, userInfo);
      },
      fail: error => {
        console.log('wx.login fail', error);
        wx.showToast({
          icon: 'none',
          title: '登录失败，请重试'
        })
      }
    })
  },
  getToken: function() {
    let app = this;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if(app.globalData.token){
          clearInterval(interval);
          resolve(app.globalData.token);
        }
      }, 500);
    });
  },

  addUser : function(code, userInfo) {
    let that = this;
    var options = {
      url: config.service.addUserUrl,
      method: "post",
      data: { code: code, userInfo: userInfo },
      login: true,
      success(result)  {
        console.log('request success', result)
        if (result.data && result.data.data && result.data.data.token) {
          that.globalData.token = result.data.data.token;
          // 保存token和用户信息到本地存储
          wx.setStorageSync('token', result.data.data.token);
          wx.setStorageSync('userInfo', userInfo);
          
          wx.showToast({
            icon: 'success',
            title: '登录成功'
          })
        }
      },
      fail(error) {
        console.log('request fail', error);
        wx.showToast({
          icon: 'none',
          title: '登录失败，请重试'
        })
      }
    }

    wx.request(options);
  },

  globalData: {
    requestCode : null,
    userInfo: null,
    token: undefined
  }
})