const xml2js = require('xml2js')

exports.dateToLong = function(date) {
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
exports.generateTimeStamp = function() {
    return parseInt(+new Date() / 1000, 10) + ''
}

/**
 *
 * 构建随机字符串
 *
 * @param {any} length 长度 (目前微信的文档中是最多32位)
 * @returns {String} noce_str 随机字符串
 */
exports.generateNonceStr = function(length) {
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
exports.sortQueryString = function(qsObj) {
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
exports.getSign = function(alg, sortedQSString, partnerKey) {

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
exports.generateUnifiedParams = function(order, appid, payConf) {

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

    kv.nonce_str = exports.generateNonceStr()

    if (kv.sign) {
        delete kv.sign
    }

    kv.appid = appid
    kv.mch_id = payConf.mchid
    kv.notify_url = payConf.notifyUrl

    kv.sign = exports.getSign(kv.sign_type, exports.sortQueryString(order), payConf.partnerKey)

    return kv
}


/**
 * 将json数据转换成xml类型数据
 *
 * @param {any} obj 带转换的json数据
 * @returns {Object} 转换后的xml数据
 */
exports.buildXml = function(obj) {

    let builder = new xml2js.Builder({
        allowSurrogateChars: true
    })

    return builder.buildObject({
        xml: obj
    })
}


const { URL } = require('url')

exports.removeURLHash = function(url) {
    if (!url) {
        url = new URL(url)
    }

    return `${url.origin}${url.pathname}${url.search}`
}

exports.getJSSDKSign = function(kv) {

    let keys = Object.keys(kv).sort()

    let newArgs = {}

    keys.forEach(key => {
        newArgs[key.toLowerCase()] = kv[key]
    })

    let str = Object
        .keys(newArgs)
        .map((key) => key + '=' + newArgs[key])
        .join('&')

    return crypto.createHash('sha1').update(str).digest('hex')
}