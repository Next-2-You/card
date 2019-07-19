// pages/index2/index2.js
const app = getApp();
var QRcode = '';
var imgUserPath = '';
var filePath = "";
Page({
 

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo: null,
    userInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
   
    that.setData({
      userInfo: app.globalData.userInfo,
      cardInfo: app.globalData.cardInfo
    });
    var scene = decodeURIComponent(options.scene)

    // 生成页面的二维码
    wx.request({
      //注意：下面的access_token值可以不可以直接复制使用，需要自己请求获取
      url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=xxx',
      data: {
        scene: '000',
        page: ""  //这里按照需求设置值和参数   
      },
      method: "POST",
      responseType: 'arraybuffer',  //设置响应类型
      success(res) {       
        QRcode = wx.arrayBufferToBase64(res.data);  //对数据进行转换操作
        
        that.setData({
          QRcode:QRcode
        })
      },
      fail(e) {
        console.log(e)
      }
    });

    //获取云端图片的下载地址
    wx.request({
      //注意：下面的access_token值可以不可以直接复制使用，需要自己请求获取
      url: 'https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=xxx',
      data: {
        "env": "xxx",
        "file_list": [
          {
            "fileid": app.globalData.cardInfo.headicon,
            "max_age": 7200
          }
        ]
      },
      method: "POST",
      success(res) {

        console.log(res.data.file_list[0])
        imgUserPath = res.data.file_list[0].download_url;

        // that.setData({
        //   QRcode: QRcode
        // })
      },
      fail(e) {
        console.log(e)
      }
    });


    //获取当前设备屏幕宽高 在onLoad生命周期里执行
      wx.getSystemInfo({
        success(res) {
          that.setData({
            deviceWidth: res.windowWidth,
            deviceHeight: res.windowHeight
          })
        }
      });
   
  },
 
  //生成图片 
  showImage: function () {
    var that = this;
    const ctx = wx.createCanvasContext('myCanvas');
    var imgPath = '/images/sharecode/bg_code.png';
    var imgUserPath = that.data.userInfo.avatarUrl;
    var code = "data:image/png;base64," + QRcode;
    //绘制图像到画布 x y width height
    ctx.drawImage(imgPath, 0, 0, (that.data.deviceWidth / 750) * 600, (that.data.deviceHeight / 1334) * 500);
    ctx.setFillStyle('white')
    //创建一个矩形
    ctx.fillRect(0, (that.data.deviceHeight / 1334) * 500, (that.data.deviceWidth / 750) * 600, (that.data.deviceHeight / 1334) * 350);
   
    //绘制图像到画布
    ctx.drawImage(imgUserPath, (that.data.deviceWidth / 750) * 30, (that.data.deviceHeight / 1334) * 530, (that.data.deviceWidth / 750) * 120, (that.data.deviceWidth / 750) * 120)

    //创建文字
    ctx.setFontSize((that.data.deviceWidth / 750) * 32)
    ctx.setFillStyle('#333333')
    //文案 x y
    ctx.fillText(that.data.cardInfo.name, (that.data.deviceWidth / 750) * 160, (that.data.deviceHeight / 1334) * 590)

    ctx.setFontSize((that.data.deviceWidth / 750) * 24)
    ctx.setFillStyle('#666666')
    ctx.fillText(that.data.cardInfo.jobInfo, (that.data.deviceWidth / 750) * 160, (that.data.deviceHeight / 1334) * 630)

    ctx.setFontSize((that.data.deviceWidth / 750) * 25)
    ctx.setFillStyle('#999999')
    ctx.fillText('扫一扫上面的二维码图案', (that.data.deviceWidth / 750) * 40, (that.data.deviceHeight / 1334) * 730)
    ctx.fillText('收藏我的名片', (that.data.deviceWidth / 750) * 40, (that.data.deviceHeight / 1334) * 760)

    //绘制图像到画布
    ctx.drawImage(code, (that.data.deviceWidth / 750) * 320, (that.data.deviceHeight / 1334) * 560, (that.data.deviceWidth / 750) * 250, (that.data.deviceWidth / 750) * 250)
    // ctx.setShadow(10 ,'rgba(153,153,153,1)')
    
    //渲染
    ctx.draw();
    this.save();
   
  
  },
  save() {
    var that = this;
    //需要把canvas转成图片后才能保存
    setTimeout(() => {
      //获取临时路径
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 634,
        height: 1960,
        destWidth: 1268,  //2倍关系
        destHeight: 1960, //2倍关系
        canvasId: 'myCanvas',
        success: function (res) {
          // filePath = res.tempFilePath;
          //授权
          that.saveImageToPhotos(res.tempFilePath);

        },
        fail: function (res) {
          console.log(res)
        }
      });
    }, 300);
  },
  // 点击保存图片到相册(授权)
  saveImageToPhotos(filePath) {

    var self = this;
    // 相册授权
    wx.getSetting({
      success(res) {

        // 进行授权检测，未授权则进行弹层授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log(self);
              self.saveImg(filePath);
            },
            // 拒绝授权时，则进入手机设置页面，可进行授权设置
            fail() {
              wx.showModal({
                title: '您已拒绝授权',
                content: '图片无法保存到相册',
                cancelText: '取消',
                confirmText: '去设置',
                confirmColor: '#21e6c1',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击去设置')
                    wx.openSetting({
                      success: function (data) {
                        console.log("openSetting success");
                      },
                      fail: function (data) {
                        console.log("openSetting fail");
                      }
                    });
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              });
            }
          })
        } else {
          console.log(self);
          // 已授权则直接进行保存图片
          self.saveImg(filePath);
        }
      },
      fail(res) {
        console.log(res);
      }
    })
  },

  //保存图片 
  saveImg(filePath) {
    wx.showLoading({
      title: '加载中',
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 2000);
    //保存本地相册 
    wx.saveImageToPhotosAlbum({
      //shareImgSrc为canvas赋值的图片路径
      filePath: filePath,
      success(res) {

        wx.showToast({
          title: '保存成功',
          time: 4000,
          icon: 'success'
        })
        wx.redirectTo({
          url: '/pages/index/index',
        });
      },
      fail: function (res) {
        console.log("---fail----");
        wx.showToast({
          title: '保存失败',
          time: 4000,
          icon: 'fail'
        });
        wx.redirectTo({
          url: '/pages/sharecode/sharecode',
        })

      }
    });
  },


  codetap: function () {
    console.log("识别")
    wx.redirectTo({
      url: '/pages/index/index',
      success: function (res) {
        console.log("识别成功·")
      },
      fail: function (res) {
        console.log("识别失败")
      },
      complete: function (res) {
        console.log("识别完成")
      },
    })
  }
})