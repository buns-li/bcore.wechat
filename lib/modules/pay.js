const xml2js = require('xml2js')

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

function dateToLong(date) {
    let arr = []
    arr.push(date.getFullYear())
    arr.push('0' + (date.getMonth() + 1))
    arr.push('0' + date.getDate())
    arr.push('0' + date.getHours())
    arr.push('0' + date.getMinutes())
    arr.push('0' + date.getSeconds())
    for (let i = 1, l = arr.length; i < l; i++) {
        arr[i] = arr[i].substr(arr[i].length - 2)
    }
    return parseInt(arr.join(''), 10)
}

/**
 * 构建时间戳
 *
 * @returns {String} 时间戳字符串
 */
function generateTimeStamp() {
    return parseInt(+new Date() / 1000, 10) + ''
}

/**
 *
 * 构建随机字符串
 *
 * @param {any} length 长度 (目前微信的文档中是最多32位)
 * @returns {String} noce_str 随机字符串
 */
function generateNonceStr(length) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        maxPos = chars.length,
        noceStr = ''

    length = length || 32

    for (let i = 0; i < length; i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return noceStr
}
/**
 * 按ASCII码排序请求数据键值对,得到排序后的字符串
 *  See {@link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3}
 *
 * @example <caption>
 * qsObj: { appid:"123",secret:"11111",ip:"127.0.0.1"}
 * after sorted,will be: "appid=123&ip=127.0.0.1&secret=11111"
 * </caption>
 *
 * @param {any} qsObj 带排序的数据键值对
 * @returns 排序后的字符串
 *
 */
function sortQueryString(qsObj) {
    return Object.keys(qsObj)
        .filter(key => key !== undefined && key !== '')
        .sort()
        .map(prop => prop + '=' + qsObj[prop])
        .join('&')
}

/**
 * 获取参数签名字符串
 * @see https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3
 *
 * @param {any} alg 签名算法(Default:"MD5")
 * @param {any} sortedQSString 已排序的参数字符串(不含sign的)
 * @param {any} partnerKey 微信平台合作商户的秘钥
 * @returns {String} 签名字符串
 */
function getSign(alg, sortedQSString, partnerKey) {

    let str = sortedQSString + '&key=' + partnerKey

    str = crypto.createHash(alg || 'md5').update(str).digest('hex')

    if (!alg || alg === 'MD5' || alg === 'md5') {
        str = str.toUpperCase()
    }

    return str
}

/**
 * 构建统一下单请求的传输参数
 *
 * @param {any} order 订单数据键值对
 *     appid: 公众号id String(32)
 *     mch_id: 微信支付分配的商户号 String(32)
 *     nonce_str: 随机字符串，长度要求在32位以内。String(32)
 *     sign: 签名字符串
 *     sign_type: 签名类型 HMAC-SHA256 | MD5
 *     device_info: 自定义参数，可以为终端设备号(门店号或收银设备ID)，PC网页或公众号内支付可以传"WEB"
 *     body: 商品简单描述
 *     attach: 附加数据，在查询API和支付通知中原样返回,可作为自定义参数使用
 *     out_trade_no: 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一
 *     total_fee: 订单总金额，单位为分
 *     spbill_create_ip: APP和网页支付提交用户端ip，Native支付填调用微信支付API的机器IP
 *     notify_url:异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数
 *     trade_type: 取值如下：JSAPI，NATIVE，APP等
 *     openid: trade_type=JSAPI时（即公众号支付），此参数必传，此参数为微信用户在商户对应appid下的唯一标识。openid如何获取
 *     time_expire: 订单失效时间，格式为yyyyMMddHHmmss，如2009年12月27日9点10分10秒表示为20091227091010。其他详见
 *     product_id: trade_type=NATIVE时（即扫码支付），此参数必传。此参数为二维码中包含的商品ID，商户自行定义
 *
 * @param {any} appid 微信应用id
 * @param {any} payConf 支付配置
 *
 * @returns {Object} 构建完成的传输对象键值对
 */
function generateUnifiedParams(order, appid, payConf) {

    let err

    let kv = Object.assign({}, order)

    kv.trade_type = kv.trade_type || 'JSAPI'

    if (kv.total_fee && kv.total_fee <= 0) {
        err = new Error()
        err.name = 'WechatPay.NoMoneyError'
        err.message = '交易金额必须大于0'
        return err
    }

    switch (kv.trade_type) {
        case 'APP':
            break
        case 'Native':
            if (!kv.product_id) {
                err = new Error()
                err.name = 'WechatPay.MissParamError'
                err.message = '`Native`交易类型的前提下`product_id`不能为空'
                return err
            }
            break
        case 'JSAPI':
        default:
            if (!kv.openid) {
                err = new Error()
                err.name = 'WechatPay.MissParamError'
                err.message = '`JSAPI`交易类型的前提下`openid`不能为空'
                return err
            }

            kv.device_info = 'WEB'

            if (!kv.spbill_create_ip) {
                kv.spbill_create_ip = '127.0.0.1'
            }
            break
    }

    kv.nonce_str = generateNonceStr()

    if (kv.sign) {
        delete kv.sign
    }

    kv.appid = appid
    kv.mch_id = payConf.mchid
    kv.notify_url = payConf.notifyUrl

    kv.sign = getSign(kv.sign_type, sortQueryString(order), payConf.partnerKey)

    return kv
}


/**
 * 将json数据转换成xml类型数据
 *
 * @param {any} obj 带转换的json数据
 * @returns {Object} 转换后的xml数据
 */
function buildXml(obj) {

    let builder = new xml2js.Builder({
        allowSurrogateChars: true
    })

    return builder.buildObject({
        xml: obj
    })
};

require('../wechat')
    .on('pay', 'getJSBridgePayParams', function(prepayID) {
        let kv = {
            appId: this.appid,
            timeStamp: generateTimeStamp(),
            nonceStr: generateNonceStr(),
            package: 'prepay_id=' + prepayID,
            signType: 'MD5'
        }

        let sortedString = sortQueryString(kv)

        kv.paySign = getSign('MD5', sortedString, this.payConf.partnerKey)

        return kv
    })
    .on('pay', 'unifiedOrder', URLS.unifiedorder, {
        isNeedAccessToken: false,
        /*
         *  order需要参数:
         */
        reqPrepare: function(order) {

            let payReqParams = generateUnifiedParams(order, this.appid, this.payConf)

            if (payReqParams instanceof Error) {
                return Promise.reject(payReqParams)
            }

            return {
                body: buildXml(payReqParams),
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
                appid: this.appid,
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                sign_type: 'MD5'
            }

            if (CLIENT[client]) {
                reqParams[CLIENT[client]] = orderID
            }

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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
                appid: this.appid,
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                out_trade_no: orderID,
                sign_type: 'MD5'
            }

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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
                appid: this.appid,
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                sign_type: 'MD5'
            }

            if (CLIENT[client]) {
                reqParams[CLIENT[client]] = orderID
            }

            for (let i in refundInfo) {
                reqParams[i] = refundInfo
            }

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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
                appid: this.appid,
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                sign_type: 'MD5'
            }

            if (CLIENT[client]) {
                reqParams[CLIENT[client]] = orderID
            }

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                sign_type: 'MD5',
                bill_date: billDate,
                bill_type: billType
            }

            deviceInfo && (reqParams.device_info = deviceInfo)
            tarType && (reqParams.tar_type = tarType)

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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
                appid: this.appid,
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                out_trade_no: orderID,
                sign_type: 'MD5'
            }

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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
    .on('pay', 'tradeComment', URLS.billcommentsp, {
        /**
         * @param {String} orderID 待取消的商户订单id
         */
        reqPrepare: function(stime, etime, offset, limit) {

            let reqParams = {
                appid: this.appid,
                mch_id: this.payConf.mchid,
                nonce_str: generateNonceStr(),
                sign_type: 'MD5'
            }

            reqParams.stime = stime instanceof Date ? dateToLong(stime) : stime
            reqParams.etime = etime instanceof Date ? dateToLong(etime) : etime

            limit = parseInt(limit, 10) || 200

            reqParams.limit = limit > 200 ? 200 : limit

            reqParams.offset = parseInt(offset, 10)

            reqParams.sign = getSign('MD5', sortQueryString(reqParams), this.payConf.partnerKey)

            return {
                body: buildXml(reqParams),
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