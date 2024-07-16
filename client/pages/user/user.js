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
  uploadImage: function () {
    var that = this;

    wx.chooseImage({
      count: 1,  //最多可以选择的图片总数
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        //启动上传等待中...
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })

        wx.uploadFile({
          url: '192.168.1.1/home/uploadfilenew',
          filePath: tempFilePaths[0],
          name: 'uploadfile_ant',
          formData: {
          },
          header: {
            "Content-Type": "multipart/form-data"
          },
          success: function (res) {
            var data = JSON.parse(res.data);
            //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }
            console.log(data);
          },
          fail: function (res) {
            wx.hideToast();
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) { }
            })
          }
        });
      }
    });
  }
  
})