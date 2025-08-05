import Config from '../../config.js';


Page({
  data: {
    avatarUrl: '',
    city: '',
    country: '',
    created: '',
    gender: '',
    nickName: '',
    province: '',
    currentTab: 0,
    productInfo: {},
    loader: true
  },
  onLoad: function(options) {
    
  },
  
  onShow: function() {
    let that = this;
    getApp().getToken().then(token => {
      wx.request({
        url: Config.service.getProfileUrl + `?token=${token}`,
        success(result) {
          console.log('request success');
          let user = result.data.data.user;
          let avatarUrl = user.avatarUrl === '' ? '../../img/avatar.png' : user.avatarUrl;
          let gender = '';
          if (user.gender) {
            gender = user.gender == 1 ? '男' : '女';
          }

          that.setData({
            avatarUrl: avatarUrl,
            //city: user.city,
            //country: user.country,
            created: user.created,
            //gender: gender,
            nickName: user.nickName,
            //province: user.province,
            loader: false
          });
        },
        fail(error) {
          console.log('request error');
          console.log(error);
        }
      })
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
  },
  updateUserProfile: function() {
    wx.getUserProfile({
      desc: '用于更新头像和昵称',
      success: (res) => {
        getApp().loginWithUserProfile(res.userInfo);
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        });
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('getUserProfile fail:', err);
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
      }
    });
  }
})