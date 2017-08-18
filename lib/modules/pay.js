const xml2js = require('xml2js')

const util = require('../util')

const URLS = {
    unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    orderquery: 'https://api.mch.weixin.qq.com/pay/orderquery',
    closeorder: 'https://api.mch.weixin.qq.com/pay/closeorder',
    refund: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
    refundquery: 'https://api.mch.weixin.qq.com/pay/refundquery',
    downloadbill: 'https://api.mch.weixin.qq.com/pay/downloadbill',
    payitil: 'https://api.mch.weixin.qq.com/payitil/report',
    billcommentsp: 'https://api.mch.weixin.qq.com/billcommentsp/batchquerycomment'
}

const CLIENT = { 'SELF': 'out_trade_no', 'WX': 'transaction_id', 'SELF_REFUND': 'out_refund_no', 'WX_REFUND': 'refund_id' }

require('../wechat')
    .on('pay', 'getJSBridgePayParams', function(prepayID) {
        let kv = {
            appId: this.appid,
            timeStamp: util.generateTimeStamp(),
            nonceStr: util.generateNonceStr(),
            package: 'prepay_id=' + prepayID,
            signType: 'MD5'
        }

        let sortedString = util.sortQueryString(kv)

        kv.paySign = util.getSign('MD5', sortedString, this.payConf.partnerKey)

        return kv
    })
    .on('pay', 'unifiedOrder', URLS.unifiedorder, {
        isNeedAccessToken: false,
        /*
         *  order需要参数:
         */
        reqPrepare: function(order) {

            let payReqParams = util.generateUnifiedParams(order, this.appid, this.payConf)

            if (payReqParams instanceof Error) {
                return Promise.reject(payReqParams)
            }

            return {
                body: util.buildXml(payReqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })
    .on('pay', 'queryOrder', URLS.orderquery, {
        /**
         * @param {String} orderID 订单id
         * @param {String} client  订单id的来源 自身系统: SELF | 微信分配订单号: WX
         */
        reqPrepare: function(orderID, client = 'SELF') {
            /**
             *  公众账号ID	appid	是	String(32)	wxd678efh567hg6787	微信支付分配的公众账号ID（企业号corpid即为此appId）
             *  商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
             *  微信订单号	transaction_id	二选一	String(32)	1009660380201506130728806387	微信的订单号，建议优先使用
             *  商户订单号	out_trade_no	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
             *  随机字符串	nonce_str	是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	随机字符串，不长于32位。推荐随机数生成算法
             *  签名	sign	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	通过签名算法计算得出的签名值，详见签名生成算法
             *  签名类型	sign_type	否	String(32)	HMAC-SHA256	签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
             */
            let reqParams = {
                'appid': this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'sign_type': 'MD5'
            }

            if (CLIENT[client]) {
                reqParams[CLIENT[client]] = orderID
            }

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })
    .on('pay', 'closeOrder', URLS.closeorder, {
        /**
         * @param {String} orderID 待取消的商户订单id
         */
        reqPrepare: function(orderID) {
            /**
             *  公众账号ID	appid	是	String(32)	wxd678efh567hg6787	微信支付分配的公众账号ID（企业号corpid即为此appId）
             *  商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
             *  商户订单号	out_trade_no	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
             *  随机字符串	nonce_str	是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	随机字符串，不长于32位。推荐随机数生成算法
             *  签名	sign	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	通过签名算法计算得出的签名值，详见签名生成算法
             *  签名类型	sign_type	否	String(32)	HMAC-SHA256	签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
             */
            let reqParams = {
                'appid': this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'out_trade_no': orderID,
                'sign_type': 'MD5'
            }

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })
    .on('pay', 'refund', URLS.refund, {
        /**
         * @param {String} orderID 待取消的商户订单id
         */
        reqPrepare: function(orderID, client, refundInfo) {
            /**
             *  公众账号ID	appid	是	String(32)	wxd678efh567hg6787	微信支付分配的公众账号ID（企业号corpid即为此appId）
             *  商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
             *  商户订单号	out_trade_no	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
             *  随机字符串	nonce_str	是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	随机字符串，不长于32位。推荐随机数生成算法
             *  签名	sign	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	通过签名算法计算得出的签名值，详见签名生成算法
             *  签名类型	sign_type	否	String(32)	HMAC-SHA256	签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
             */
            let reqParams = {
                'appid': this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'sign_type': 'MD5'
            }

            if (CLIENT[client]) {
                reqParams[CLIENT[client]] = orderID
            }

            for (let i in refundInfo) {
                reqParams[i] = refundInfo
            }

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })
    .on('pay', 'queryRefund', URLS.refundquery, {
        /**
         * @param {String} orderID 待取消的商户订单id
         * @param {String} client 订单类型 WX | SELF | SELF_REFOUND | WX_REFUND
         */
        reqPrepare: function(orderID, client) {
            /**
             *  公众账号ID	appid	是	String(32)	wxd678efh567hg6787	微信支付分配的公众账号ID（企业号corpid即为此appId）
             *  商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
             *  商户订单号	out_trade_no	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
             *  随机字符串	nonce_str	是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	随机字符串，不长于32位。推荐随机数生成算法
             *  签名	sign	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	通过签名算法计算得出的签名值，详见签名生成算法
             *  签名类型	sign_type	否	String(32)	HMAC-SHA256	签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
             */
            let reqParams = {
                'appid': this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'sign_type': 'MD5'
            }

            if (CLIENT[client]) {
                reqParams[CLIENT[client]] = orderID
            }

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })
    .on('pay', 'downloadBill', URLS.downloadbill, {
        /**
         * @param {String} billDate 对账单日期
         * @param {String} billType 对账单类型 ALL | SUCCESS | REFUND | RECHARGE_REFUND
         * @param {String} deviceInfo 设备号 
         * @param {String} tarType 压缩方式
         */
        reqPrepare: function(billDate, billType = 'ALL', deviceInfo, tarType) {
            let reqParams = {
                appid: this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'sign_type': 'MD5',
                'bill_date': billDate,
                'bill_type': billType
            }

            deviceInfo && (reqParams.device_info = deviceInfo)
            tarType && (reqParams.tar_type = tarType)

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx,
                json: false
            }
        },
        /**
         * TODO: 处理数据文本流
         * 
         * @todo 处理数据文本流
         */
        resPrepare: function(body) {
            return body
        }
    })
    .on('pay', 'getPayReport', URLS.payitil, {
        reqPrepare: function(orderID) {
            /**
             *  公众账号ID	appid	是	String(32)	wxd678efh567hg6787	微信支付分配的公众账号ID（企业号corpid即为此appId）
             *  商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
             *  商户订单号	out_trade_no	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
             *  随机字符串	nonce_str	是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	随机字符串，不长于32位。推荐随机数生成算法
             *  签名	sign	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	通过签名算法计算得出的签名值，详见签名生成算法
             *  签名类型	sign_type	否	String(32)	HMAC-SHA256	签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
             */
            let reqParams = {
                'appid': this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'out_trade_no': orderID,
                'sign_type': 'MD5'
            }

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })
    .on('pay', 'getTradeComments', URLS.billcommentsp, {
        /**
         * @param {String} orderID 待取消的商户订单id
         */
        reqPrepare: function(stime, etime, offset, limit) {

            let reqParams = {
                'appid': this.appid,
                'mch_id': this.payConf.mchid,
                'nonce_str': util.generateNonceStr(),
                'sign_type': 'MD5'
            }

            reqParams.stime = stime instanceof Date ? util.dateToLong(stime) : stime
            reqParams.etime = etime instanceof Date ? util.dateToLong(etime) : etime

            limit = parseInt(limit, 10) || 200

            reqParams.limit = limit > 200 ? 200 : limit

            reqParams.offset = parseInt(offset, 10)

            reqParams.sign = util.getSign('MD5', util.sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: util.buildXml(reqParams),
                pfx: this.payConf.pfx
            }
        },
        resPrepare: function(body) {
            return new Promise((resolve, reject) => {
                if (body) {
                    xml2js.parseString(body, {
                        trim: true,
                        explicitArray: false
                    }, (err, json) => {
                        if (err) return reject(err)
                        resolve(json ? json.xml : {})
                    })
                } else {
                    resolve(body)
                }
            })
        }
    })