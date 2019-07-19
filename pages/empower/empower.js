const app = getApp();
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false
  },

  onLoad: function () {
    var that = this;
    
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
              app.globalData.userInfo = res.userInfo;
              //选择跳转页面
              that.choose()
            }
          });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          that.setData({
            isHide: true
          });
        }
      }
    });
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      app.globalData.userInfo = e.detail.userInfo;
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
      //选择跳转页面
      that.choose()
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  choose:function(){
    var that=this;
    if (app.globalData.openId==null){
      app.getOpenId().then(res => {
        if (app.globalData.openId != null){
          that.choosePageTo()
        }else{
          that.choose();
        }  
      });
    }else{
      that.choosePageTo()
    }
  },
  choosePageTo:function(){
    const db = wx.cloud.database()
    db.collection('cardInfo').where({
      _openid: app.globalData.openId
    }).get({
      success: function (res) {
        var str = '';
        if (res.data.length > 0) {//进入个人主页
          app.globalData.cardInfo = res.data[0];
          str = '/pages/index/index';
          //str ='/pages/shareinfo/shareinfo';
        } else {//进入提示页
          str = '/pages/tip/tip';
        }
        wx.redirectTo({
          url: str
        })
      }
    })
  }
})