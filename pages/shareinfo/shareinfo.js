// pages/sharecard/shardcard.js
const app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo: null,
    openId: null,
    flag: false, //用来改变收藏样式
    isRegister: false, //是否注册过
    selfData: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var cid = options.shareUid;
    var that = this;
    this.setData({
      openId: app.globalData.openId
    })
    that.getShareData(cid);
  },
  getShareData: function(cid) {
    const db = wx.cloud.database()
    var that = this;
    db.collection('cardInfo').where({
      _id: cid
    }).get({
      success: function(res) {
        if (res.data.length > 0) {
          that.setData({
            cardInfo: res.data[0]
          })
          if (that.data.openId != res.data[0]._openid) {
            that.getSelfData(); //查看自己是否已经注册
          }else{
            that.setData({ isRegister:true})
          }
        } else {
          wx.showToast({
            title: '无效分享',
            icon: 'none'
          })
        }
      }
    })
  },
  isShowRed: function() {
    const db = wx.cloud.database()
    var that = this;
    db.collection('collection').where({ //收藏样式是否显红
      _openid: that.data.openId
    }).get({
      success: function(d) {
        if (d.data.length > 0) {
          for (var i = 0; i < d.data[0].collections.length; i++) {
            var index = d.data[0].collections.findIndex((element) => (element.cardId == that.data.cardInfo._id))
            if (index > -1) {
              console.log("进来了")
              that.setData({
                flag: true
              })
              break;
            }
          }
        }
      }
    })
  },
  getSelfData: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection('cardInfo').where({
      _openid: that.data.openId
    }).get({
      success: function(res) {
        if (res.data.length > 0) {
          that.setData({
            isRegister: true,
            selfData: res.data[0]
          })
          that.addVisit(); //添加访问记录
          that.isShowRed(); //是否显示红色收藏
        }
      }
    })
  },
  //是否已经注册过
  isRegister: function() {
    if (this.data.isRegister == false) {
      wx.navigateTo({
        url: '/pages/tip/tip'
      })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    return {
      title: '名片',
      imageUrl: '',
      path: 'pages/shareinfo/shareinfo'
    }
  },
  //添加访问记录
  addVisit: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection('visit').add({
      data: {
        name: that.data.selfData.name,
        date: util.formatTime(new Date()),
        headicon: that.data.selfData.headicon,
        visitedId: that.data.cardInfo._openid,
        cardId: that.data.selfData._id
      },
      success: function(res) {
        console.log("addvisit....")
      },
      fail: console.error
    })
  },
  getObject: function() {
    var that = this;
    var date = util.formatDate(new Date());
    var obj = {
      name: that.data.cardInfo.name,
      date: date,
      headicon: that.data.cardInfo.headicon,
      cardId: that.data.cardInfo._id
    }
    return obj;
  },
  //收藏还是取消收藏
  chooseCollectionType: function() {
    this.isRegister(); //是否已经有账户，没有就跳转到创建页面
    if (this.data.isRegister ==true) {
      var that = this;
      if (that.data.openId != that.data.cardInfo._openid) { //不是同个人
        console.log("不是同一个人")
        const db = wx.cloud.database()
        db.collection('collection').where({
          _openid: that.data.openId
        }).get({
          success: function(res) {
            if (res.data.length > 0) { //收藏或者取消收藏
              console.log("收藏或者取消收藏")
              var flag = true;
              for (var i = 0; i < res.data[0].collections.length; i++) {
                var index = res.data[0].collections.findIndex((element) => (element.cardId == that.data.cardInfo._id))
                if (index > -1) {
                  //取消收藏
                  console.log("取消收藏")
                  that.removeCollection(res, index);
                  flag = false;
                  break;
                }
              }
              if (flag) { //通过更新进行收藏
                console.log("通过更新进行收藏")
                that.addCollectionByUpdateOpt(res);
              }
            } else { //通过添加进行收藏
              console.log("通过添加进行收藏")
              that.addCollectionByAddOpt(res);
            }
          }
        })

      } else {
        wx.showToast({
          title: '不能收藏自己',
          icon: 'none'
        })
      }
    }
  },
  //通过添加操作进行收藏
  addCollectionByAddOpt: function(res) {
    var that = this;
    const db = wx.cloud.database()
    var obj = this.getObject();
    res.data.push(obj)
    db.collection('collection').add({
      data: {
        collections: res.data
      },
      success: function(res) {
        that.setData({
          flag: true
        })
        wx.showToast({
          title: '收藏成功',
          icon: 'none'
        })
      },
      fail: console.error
    })

  },
  //通过更新操作进行收藏
  addCollectionByUpdateOpt: function(res) {
    var that = this;
    const db = wx.cloud.database()
    var obj = that.getObject();
    res.data[0].collections.unshift(obj)
    db.collection('collection').doc(res.data[0]._id).update({
      data: {
        collections: res.data[0].collections
      },
      success: function() {
        console.log("success")
        that.setData({
          flag: true
        })
        wx.showToast({
          title: '收藏成功',
          icon: 'none'
        })
      },
      fail: console.error
    })
  },
  //取消收藏
  removeCollection: function(res, index) {
    var that = this;
    const db = wx.cloud.database()
    res.data[0].collections.splice(index, 1) //在下标1处开始删除,删除一位
    db.collection('collection').doc(res.data[0]._id).update({
      data: {
        collections: res.data[0].collections
      },
      success: function() {
        that.setData({
          flag: false
        })
        wx.showToast({
          title: '取消收藏',
          icon: 'none'
        })
      },
      fail: console.error
    })
  },
  toMyCard: function() {
    this.isRegister(); //是否已经有账户，没有就跳转到创建页面
    wx.redirectTo({
      url: '/pages/index/index',
    })
  }
})