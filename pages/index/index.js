//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    cardInfo: null,
    userInfo: null,
    popularityNum: 0,
    collectionNum: 0
  },
  onLoad: function () {
    this.getCardInfo()
  },
  getCardInfo:function(){
    var that=this;
    const db = wx.cloud.database()
    db.collection('cardInfo').where({
      _openid: app.globalData.openId
    }).get({
      success: function (res) {
        if(res.data.length>0){
          that.setData({ cardInfo: res.data[0] })
          app.globalData.cardInfo=res.data[0]
          //人气
          that.getPopularityNum();
          //收藏
          that.getCollectionNum();
        }
      }
    })
  },
  //人气数量
  getPopularityNum: function () {
    var that = this;
    const db = wx.cloud.database()
    db.collection('visit').where({
      visitedId: app.globalData.openId
    }).count({
      success: function (res) {
        that.setData({ popularityNum: res.total })
      }
    })

  },
  //收藏数量
  getCollectionNum: function () {
    const db = wx.cloud.database()
    var that = this;
    db.collection('collection').where({
      _openid: app.globalData.openId
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          that.setData({ collectionNum: res.data[0].collections.length })
        }
      }
    })
  },
  //去我的名片夹页面
  toCardClip: function () {
    console.log("---去我的名片夹页面---")
    wx.navigateTo({
      url: '/pages/cardclip/cardclip',
    })
  },
  //去编辑名片页面
  toEditCard: function () {
    wx.navigateTo({
      url: '/pages/editorcreatecard/editorcreatecard',
    })
  },
  //去名片样式页面
  toCardStyle: function () {
    wx.navigateTo({
      url: '/pages/cardstyle/choicestyle/choicestyle',
    })
  },
  //去名片码页面
  toCardCode: function () {
    wx.navigateTo({
      url: '/pages/sharecode/sharecode',
    })
  },
  onShareAppMessage: function (res) {
    var that = this
    var id = app.globalData.cardInfo._id
    return {
      title: '笔直走别拐弯', // 转发后 所显示的title
      path: '/pages/shareinfo/shareinfo?shareUid=' + id, // 相对的路径
      success: (res) => { // 成功后要做的事情
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: (res) => {
            that.setData({
              isShow: true
            })
          },
          fail: function (res) { console.log(res) },
          complete: function (res) { console.log(res) }
        })
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    }
  },

  //去设置页面
  toSetUpPage:function(e){
    var cid=e.currentTarget.dataset.cid;
    wx.navigateTo({
      url: '/pages/selfcenter/selfcenter?cid='+cid,
    })
  }
  
})
