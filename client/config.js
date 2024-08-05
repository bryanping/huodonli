/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名


//var host = 'https://5ltt3g1i.qcloud.la';
//var host = 'https://j94yvuoy.qcloud.la';
var host = 'https://95278436.huodonli.cn';


var config = {
    // key: {
    //   AMapWX: 'f5616a0f61367f752138a4191a20ac54'
    // },
    // 下面的地址配合云端 Demo 工作
    service: {
        host,
        
        // 登录地址，用于建立会话
      loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
      requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
      tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
      uploadUrl: `${host}/weapp/upload`,

      addUserUrl: `${host}/weapp/user/auth`,

      getProfileUrl: `${host}/weapp/user/profile`,

      getUserByID: `${host}/weapp/user`,

      getEventList: `${host}/weapp/event/getListByOpenId`,

      getEventById: `${host}/weapp/event`,
        
      getInvites: `${host}/weapp/event/getInvites`,

      updateEvent: `${host}/weapp/event/updateEvent`,

      createEvent: `${host}/weapp/event/addEvent`,
        
      acceptInvite: `${host}/weapp/event/acceptInvite`,

      deleteEvent: `${host}/weapp/event/deleteEvent`,

      cancelParticipation: `${host}/weapp/event/cancelParticipation`
    }
};

module.exports = config;
