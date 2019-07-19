// pages/cardstyle/choicestyle/choicestyle.js
const app = getApp();
var util = require('../../utils/util.js');
var QQMapWX = require('../../qqmap/qqmap-wx/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    inputShowed: false,//是否展示
    inputVal: "",//输入的值
    key: 'xxx',
    address: '',
    input_address: ''
    // doorNumber:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      userInfo: app.globalData.userInfo,
      cardInfo: app.globalData.saveAddressPageData     
    });
    if (app.globalData.saveAddressPageData!=null){
      this.setData({ input_address: app.globalData.saveAddressPageData.address, address: app.globalData.saveAddressPageData.address})
    }
  },
  getaddress: function () {
    //map
    var latitude = '';
    var longitude = '';
    var self = this;
    qqmapsdk = new QQMapWX({
      key: self.data.key
    });
    wx.chooseLocation({
      success: function (res) {
        latitude = res.latitude;
        longitude = res.longitude;
        self.setData({
          address: res.address,
          input_address: res.address
        })
      },
      fail: function (res) {

      }
    })
  },
  addressvalue: function () {
    var that=this;
    that.setData({ ["cardInfo.address"]: that.data.input_address})
    app.globalData.saveAddressPageData=that.data.cardInfo
    wx.navigateBack()
  }
})