//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')

var config = require('./config')

App({
  onLaunch: function() {
    this.loadUserData();
  },

  loadUserData: function(){
    qcloud.setLoginUrl(config.service.loginUrl)
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //this.addUser(res.code);
        this.globalData.requestCode = res.code;
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo;
                  this.addUser(this.globalData.requestCode, this.globalData.userInfo);

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                }
              })
            } else {
              wx.redirectTo({
                url: '/pages/login/login',
              })
            }
          }
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
        that.globalData.token = result.data.data.token;
      },
      fail(error) {
        console.log('request fail', error);
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