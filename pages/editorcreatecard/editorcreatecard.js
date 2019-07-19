// pages/editorcreatecard/editorcreatecard.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo:null,
    headicon: '/images/editorcreatecard/tx.png',//默认
    cardType:1,//默认
    nameClass:null,
    mobilephoneClass:null,
    mobilephoneStyle:null,
    phoneFocus:false,
    nameFocus:false,
    saveCardInfo:null,
    address:null,
    privacy:false//默认
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var addressData=options.address;
    // this.setData({ address: addressData})
    if (app.globalData.saveAddressPageData!=null){
      this.setData({ cardInfo: app.globalData.saveAddressPageData })
    }else{
      //得到用户信息
      this.getCardInfo();
    }
    
    
  },
  getCardInfo:function(){
    var that=this;
    const db = wx.cloud.database()
    db.collection('cardInfo').where({
      _openid: app.globalData.openId
    }).get({
      success: function (res) {
        if(res.data.length>0){
          // if(that.data.address!=null){
          //   res.data[0].address=that.data.address;
          // }
          that.setData({ cardInfo: res.data[0], headicon: res.data[0].headicon, cardType: res.data[0].cardType, saveCardInfo: res.data[0], privacy: res.data[0].privacy})

        }
      }
    })
  },
  setHeadiconData:function(e){
    this.setData({ headicon: e.detail })
  },
  //上传图片
  doUpload: function () {
    var that = this;
    var headicon=that.data.headicon;
    var cloudPath = that.getUUID() + headicon.match(/\.[^.]+?$/)[0];
    return wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: headicon
    }).then(res=>{
      var fileID = res.fileID;
      that.setData({ headicon: fileID })
      return res;
    })
  },
  getUUID: function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  },
  formSubmit: function (e) {
    var that = this;
    var tempData = e.detail.value;
    var name = tempData.name;
    var mobilephone = tempData.mobilephone;
    if(name!=""){
        if(mobilephone!=""){
          if ((/^1[34578]\d{9}$/.test(mobilephone))){
            if (that.data.cardInfo == null || that.data.headicon != that.data.cardInfo.headicon)
             {
              that.doUpload().then(res => {
                that.setFormData(tempData);
              });
            } else {
              that.setFormData(tempData);
            }
          }else{
            
            wx.vibrateLong({
              success: function (res) {
                wx.showToast({
                  title: '手机号不合法！',
                  icon: 'none'
                })
              },
              fail: function (res) {
              }
            })
            this.setData({
              mobilephoneStyle: "red",
              phoneFocus: true
            })
          }          
        }else{
          wx.vibrateLong({
            success: function (res) {
              wx.showToast({
                title: '请填写手机号！',
                icon: 'none'
              })
            },
            fail: function (res) {
            }
          })
          
          this.setData({
            mobilephoneClass: "redInput",
            phoneFocus: true
          })
        }
    }else{
      wx.vibrateLong({

        success: function (res) {
          wx.showToast({
            title: '请填写姓名！',
            icon: 'none'
          })
        },
        fail: function (res) {
        }
      })
     
      this.setData({
        nameClass: "redInput",
        //nameFocus:true
      })
    }
  },
  setFormData: function (tempData){
    var that = this;
    var tempCardInfo = {
      name: tempData.name,
      jobInfo: tempData.jobInfo,
      headicon: that.data.headicon,//单独取
      company: tempData.company,
      address: tempData.address,
      mobilephone: tempData.mobilephone,
      email: tempData.email,
      url: tempData.url,
      weixin: tempData.weixin,
      telephone: tempData.telephone,
      business: tempData.business,
      cardType: 1, //默认
      privacy: that.data.privacy
    }
    if (that.data.cardInfo._id==null) {//创建    
      //添加操作
      that.addCard(tempCardInfo)

    } else {//编辑
      //更新操作
      tempCardInfo.cardType = that.data.cardInfo.cardType;//卡片类型
      that.updateCard(tempCardInfo, that.data.cardInfo._id)
    }
  },
  //创建名片
  addCard: function (tempCardInfo) {
    const db = wx.cloud.database()
    db.collection('cardInfo').add({
      data: tempCardInfo,
      success: function (res) {
        wx.showToast({
          title: '创建成功',
          icon: 'none'
        })
        app.globalData.cardInfo = tempCardInfo;
        app.globalData.saveAddressPageData = null
        wx.reLaunch({
          url: '/pages/index/index'
        })
      },
      fail: function () {
        console.error
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },
  //更新名片
  updateCard: function (tempCardInfo,cardId){
    const db = wx.cloud.database()
    db.collection('cardInfo').doc(cardId).update({
      data: tempCardInfo,
      success: function(res){
        wx.showToast({
          title: '修改成功',
          icon: 'none'
        })
        app.globalData.cardInfo = tempCardInfo;
        app.globalData.saveAddressPageData=null
        wx.reLaunch({
          url: '/pages/index/index'
        })
      },
      fail: function(){
        console.error
        wx.showToast({
          title: '修改失败',
          icon: 'none'
        })
      }
    })
   
  },
  nameFocus: function (e) {
    this.setData({
      nameClass: null      
    })
  },
  nameBlur: function (e) {
    if(e.detail.value==""){
      this.setData({
        nameClass: "redInput"
      })
    }
  },
  nameInput:function(e){
    this.setData({["cardInfo.name"]:e.detail.value})
  },
  mobilePhoneFocus: function (e) {
    this.setData({
      mobilephoneClass: null,
    })
  },
  mobilePhoneBlur: function (e) {
    if (e.detail.value == "") {
      this.setData({
        mobilephoneClass: "redInput"
      })
    }
  },
   mobilePhoneInput:function(e){
    
     this.setData({
       mobilephoneStyle: null,
       ["cardInfo.mobilephone"]: e.detail.value
     })
   },
   companyInput:function(e){
     this.setData({
       ["cardInfo.company"]: e.detail.value
     })
   },
   jobInfoInput:function(e){
     this.setData({
       ["cardInfo.jobInfo"]: e.detail.value
     })
   },
   urlInput:function(e){
     this.setData({
       ["cardInfo.url"]: e.detail.value
     })
   },
   emailInput:function(e){
     this.setData({
       ["cardInfo.email"]: e.detail.value
     })
   },
  businessInput: function (e) {
    this.setData({
      ["cardInfo.business"]: e.detail.value
    })
  },
  telephoneInput: function (e) {
    this.setData({
      ["cardInfo.telephone"]: e.detail.value
    })
  },
  weixinInput: function (e) {
    this.setData({
      ["cardInfo.weixin"]: e.detail.value
    })
  },
  toGetAddressPage:function(){
    app.globalData.saveAddressPageData=this.data.cardInfo
    wx.navigateTo({
      url: '/pages/address/address',
    })

  },
  onUnload: function () {
    app.globalData.saveAddressPageData =null
   
  },
  onShow: function () {
    if (app.globalData.saveAddressPageData!=null){
      this.setData({ ["cardInfo.address"]: app.globalData.saveAddressPageData.address })
    }
    
  },
  
})