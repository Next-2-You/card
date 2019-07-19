// pages/cardstyle/choicestyle/choicestyle.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cardInfo: app.globalData.cardInfo,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  choiceStyle: function(e) {
    var that=this;
    wx.showModal({
      title: '提示',
      content: '是否选择该样式',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          const db = wx.cloud.database()
          console.log("选择样式")
          var num = e.currentTarget.dataset.style
          db.collection('cardInfo').doc(app.globalData.cardInfo._id).update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 done 字段置为 true
              cardType: parseInt(num)
            },
            success: function() {
              app.globalData.cardInfo.cardType = parseInt(num)
              wx.reLaunch({
                url: '/pages/index/index',
              })
            },
            fail: console.error
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})