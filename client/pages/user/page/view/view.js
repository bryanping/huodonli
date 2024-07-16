import Config from '../../../../config.js';
Page({
  data: {
    avatarUrl:'',
    city: '',
    country: '',
    gender: '',
    nickName: '',
    province: '',
    currentTab: 0,
    loader: true
  },
  onLoad: function (props) {
    let that = this;
    getApp().getToken().then(token => {
      wx.request({
        url: Config.service.getUserByID + `?token=${token}&id=${props.id}`,
        success(result) {
          console.log('request success');
          let user = result.data.data.user;
          let avatarUrl = user.avatarUrl === '' ? '../../../../img/avatar.png' : user.avatarUrl;
          let gender = '';
          if (user.gender) {
            gender = user.gender == 1 ? '男' : '女';
          }

          that.setData({
            avatarUrl: avatarUrl,
            city: user.city,
            country: user.country,
            gender: gender,
            nickName: user.nickName,
            province: user.province,
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
  }
})
