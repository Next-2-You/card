// miniprogram/pages/myCards.js
var util = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    collection: null,
    visit: null,
    collectionId:null,
    startX: 0, //开始坐标
    startY: 0
  },

  //点击切换
  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentTab: '0',
      date: util.formatDate(new Date())
    });
    this.mycollection();
    this.visited();
  },
  mycollection: function (e) {
    var that = this;
    const db = wx.cloud.database();
    db.collection('collection').where({
      _openid: app.globalData.openId,
    }).get({
      success: function (s) {
        if (s.data.length > 0) {
          if (s.data[0].collections.length!=0){
            for (var i = 0; i < s.data[0].collections.length; i++) {
              // s.data[i].isTouchMove = false;
              s.data[0].collections[i].isTouchMove = false
            }
            that.setData({
              collection: s.data[0].collections,
              collectionId: s.data[0]._id
            })
          }    
        }
      },
      fail: function (s) {
        console.log(s)
      }
    });

  },
  visited: function () {
    if (this.data.visit == null) {
      this.getVisitData();
    } else {
      this.getVisitCount();
    }
  },
  getVisitData: function () {
    var that = this;
    const db = wx.cloud.database();
    db.collection('visit').where({
      visitedId: app.globalData.openId
    }).orderBy('date', 'desc').get({
      success: function (res) {
        if (res.data.length > 0) {
          that.setData({
            visit: res.data
          })
        }
      }
    })
  },
  //访问记录没办法被删除
  getVisitCount: function () {
    var that = this;
    const db = wx.cloud.database();
    db.collection('visit').orderBy('time', 'desc').where({
      visitedId: app.globalData.openId
    }).count({
      success: function (res) {
        if (that.data.visit.length < res.data.length) {
          that.getVisitData();
        }
      }
    })
  },
  toCollectionPage: function (data) {
    var cid = data.currentTarget.dataset.cid;
    wx.reLaunch({
      url: '/pages/shareinfo/shareinfo?shareUid=' + cid
    })
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {

    //开始触摸时 重置所有删除

    this.data.collection.forEach(function (v, i) {

      if (v.isTouchMove) //只操作为true的

        v.isTouchMove = false;

    })

    this.setData({

      startX: e.changedTouches[0].clientX,

      startY: e.changedTouches[0].clientY,

      collection: this.data.collection

    })

  },

  //滑动事件处理

  touchmove: function (e) {

    var that = this,

      index = e.currentTarget.dataset.index, //当前索引

      startX = that.data.startX, //开始X坐标

      startY = that.data.startY, //开始Y坐标

      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标

      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标

      //获取滑动角度

      angle = that.angle({
        X: startX,
        Y: startY
      }, {
          X: touchMoveX,
          Y: touchMoveY
        });

    that.data.collection.forEach(function (v, i) {

      v.isTouchMove = false

      //滑动超过30度角 return

      if (Math.abs(angle) > 30) return;

      if (i == index) {

        if (touchMoveX > startX) //右滑

          v.isTouchMove = false

        else //左滑

          v.isTouchMove = true

      }

    })

    //更新数据

    that.setData({

      collection: that.data.collection

    })

  },

  /**
  
  * 计算滑动角度
  
  * @param {Object} start 起点坐标
  
  * @param {Object} end 终点坐标
  
  */

  angle: function (start, end) {

    var _X = end.X - start.X,

      _Y = end.Y - start.Y

    //返回角度 /Math.atan()返回数字的反正切值

    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);

  },

  //删除事件

  del: function (e) {
    var cid = e.currentTarget.dataset.cid;
    var that=this;
    if(cid!=null){
      wx.showModal({
        content: '是否删除收藏？',
        success: function (res) {
          if (res.confirm) {
            that.delCollection(cid);
          }
        }
      });
    }
    
  },
  //删除收藏
  delCollection: function (cid) {
    // var cardId ="f1006ad85d29ae14069bda753117abb9";
    var that = this;
    const db = wx.cloud.database()

    var index = that.data.collection.findIndex((element) => (element.cardId == cid))
    if (index > -1) {
      var tempcollection = that.data.collection;
      tempcollection.splice(index, 1) //在下标1处开始删除,删除一位
      db.collection('collection').doc(that.data.collectionId).update({
        data: {
          collections: tempcollection
        },
        success: function () {
          that.setData({
            collection: tempcollection
          })
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          })
        },
        fail: console.error
      })
      

    }
  }


})