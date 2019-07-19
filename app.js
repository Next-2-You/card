//app.js
App({
  onLaunch: function () {

    wx.cloud.init({
      env: 'xxx',
      traceUser: true
    })
    //通过云函数获取openid
    // this.getOpenId();

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
  },
  globalData: {
    cardInfo: null,
    userInfo: null,
    openId: null,
    saveAddressPageData:null
  },
  getOpenId: function () {
    var that = this;
    return wx.cloud.callFunction({
      name: 'getOpenId'
    }).then(res=>{
      that.globalData.openId = res.result.event.userInfo.openId
    })
  },
})