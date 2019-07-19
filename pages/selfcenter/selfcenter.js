// pages/cardstyle/choicestyle/choicestyle.js
const app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    inputShowed: false,//是否展示
    inputVal: "",//输入的值
    cardInfo: null,
    cardInfoList: null,
    cardId: null
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cid = options.cid;
    this.setData({
      userInfo: app.globalData.userInfo,
      cardId:cid
    });
    this.getCardInfo();

  },

  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    var data = e.detail.value;
    if(data!=''){
      this.search(e.detail.value)
      this.setData({
        inputVal: e.detail.value
      });
    }else{
      this.setData({
        inputShowed: false,
        cardInfoList:null
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //得到个人信息
  getCardInfo: function () {
    const db = wx.cloud.database()
    var that = this;
    db.collection('cardInfo').doc(that.data.cardId).get({
      success: function (res) {
        if (res.data!=null) {
          that.setData({
            cardInfo: res.data
          })
        }
      }
    })
  },
  //更改隐私设置
  changeSet: function (e) {
    var flag=e.detail.value
    var that = this;
    const db = wx.cloud.database()
    db.collection('cardInfo').doc(that.data.cardId).update({
      data: {
        privacy: flag
      },
      success: function (res) {
        console.log("设置成功")
        that.setData({
          ["cardInfo.privacy"]: flag
        })
      },
      fail: function () {
        console.error
      }
    })

  },
  //where privary=true and (name="正则表达式" or company="正则表达式")
  search: function (data) {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('cardInfo').where({
      privacy: true
    }).where(
      _.or([
        {
          name: db.RegExp({
            regexp: data,
            options: 'i',
          })
        },
        {
          company: db.RegExp({
            regexp: data,
            options: 'i',
          })
        }
      ]) 
    ).get({
      success: function (res) {
        that.setData({
          cardInfoList: res.data
        })
      }
    })
  },
  toCollectionPage: function (data) {
    var cid = data.currentTarget.dataset.cid;
    wx.reLaunch({
      url: '/pages/shareinfo/shareinfo?shareUid=' + cid
    })
  },

})