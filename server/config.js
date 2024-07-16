const CONF = {
  port: '5757',
  rootPathname: '/data/release/weapp',

  // 微信小程序 App ID
  appId: 'wxac1f33bcb2f4e746',

  // 微信小程序 App Secret
  appSecret: '6118a502b675673295e56ff6c1be2797',

  // 是否使用腾讯云代理登录小程序
  useQcloudLogin: true,

  /**
   * MySQL 配置，用来存储 session 和用户信息
   * 若使用了腾讯云微信小程序解决方案
   * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
   */
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    db: 'cAuth',
    pass: 'n3i2-CIly-380O',
    char: 'utf8mb4'
  },

  cos: {
    /**
     * 地区简称
     * @查看 https://cloud.tencent.com/document/product/436/6224
     */
    region: 'cn-south',
    // Bucket 名称
    fileBucket: 'qcloudtest',
    // 文件夹
    uploadFolder: ''
  },
  // 微信登录态有效期
  wxLoginExpires: 7200,

  // 其他配置 ...

  serverHost: '95278436.huodonli.cn',
  //以下配置可以留空不填 但是参数一定要有 否则会报错
  tunnelServerUrl: 'http://tunnel.ws.qcloud.la',
  tunnelSignatureKey: '27fb7d1c161b7ca52d73cce0f1d833f9f5b5ec89',
  // 可以注册一个腾讯云账号，获取一下配置。腾讯云相关配置可以查看云 API 秘钥控制台： 
  qcloudAppId: '1256097782',
  qcloudSecretId: 'AKIDe3wjyPXBKEtKZks4XHZ3PiqnEZIorPL2',
  qcloudSecretKey: 'IUXXJrAF7kMm35tS8cvJgutd8aO3gBgx',
  wxMessageToken: 'weixinmsgtoken',
  networkTimeout: 30000

}
module.exports = CONF
