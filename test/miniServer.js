const MiniServer = require('bcore/lib/mini-server-center')

const fs = require('fs')
const path = require('path')

module.exports = function(obj) {
    return MiniServer.load('testApp', 'wechat', {
        oauths: [{
            name: 'testGZH',
            type: 'gzh',
            appid: 'appid',
            secret: '秘钥',
            pay: {

                mchId: '商铺id',

                partnerKey: '商铺秘钥', //

                pfx: './apiclient_cert.p12', //商铺支付证书地址

                notifyUrl: 'https://xxxxxx/wxpay/notify' //产品支付后的回调
            }
        }, {
            name: 'test',
            type: 'gzh',
            appid: 'appid',
            secret: '秘钥'
        }]
    }).then(() => {
        MiniServer.injection('testApp', obj)
    })
}