// pages/cardstyle/cardstyle3/cardstyle3.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardInfo: Object,
    isChoiceStylePage: Boolean,
    headicon: String,
    isUpload: Boolean
  },

  /**
 * 组件的初始数据
 */
  data: {
    // headicon: '/images/editorcreatecard/tx.png',//默认
  },

  methods: {
    uploadHeadicon: function () {
      if (this.data.isUpload == true) {
        console.log("上传头像")
        this.doChooseImage();
      }
    },
    //选择图片
    doChooseImage: function () {
      var that = this;
      // 选择图片
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          var path = res.tempFilePaths[0];
          that.setData({ headicon: path })
          that.triggerEvent('setHeadiconData', path)
        },
        fail: e => {
          console.error(e)
        }
      })
    },
  }
})
