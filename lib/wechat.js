'use strict'

const
    path = require('path'),
    fs = require('fs'),
    request = require('request'),
    //模块操作列表
    mdus = {},
    prefix = 'https://api.weixin.qq.com'

const WechatSymbol = Symbol('wechat#current')

const Wechat = module.exports = function Wechat(name, options) {

    this.cn = name
    this.t = options.type || 'gzh'
    this.appid = options.appid
    this.secret = options.secret

    //微信端返回文件存储位置
    this.dir = options.dir

    //微信支付参数
    this.payConf = options.pay
}

Wechat.prototype.constructor = Wechat

function actionBind(mdu, uri, aop) {

    return function() {

        let scope = mdus[mdu][WechatSymbol]

        let _aop = aop

        return async function(...args) {

            let result

            if (typeof _aop === 'function') {

                if (Object.getPrototypeOf(_aop).constructor.name === 'AsyncFunction') {

                    result = await _aop.call(scope, ...args)

                } else {

                    result = _aop.call(scope, ...args)

                    if (result instanceof Promise) {
                        result = await Promise.resolve(result)
                    }
                }

                return result
            }

            //执行AccessToken的过期检测行为

            let options = {}

            //获取请求头、请求urlsearch、请求body参数
            if (_aop && _aop.reqPrepare && typeof _aop.reqPrepare === 'function') {

                if (Object.getPrototypeOf(_aop.reqPrepare).constructor.name === 'AsyncFunction') {

                    options = await _aop.reqPrepare.call(scope, ...args)

                } else {

                    options = _aop.reqPrepare.call(scope, ...args)

                    if (options instanceof Promise) {
                        options = await Promise.resolve(options)
                    }
                }
            }

            if (!('method' in options)) {
                options.method = 'post'
            }

            if (~uri.indexOf('https') || ~uri.indexOf('http')) {
                options.uri = uri
            } else {
                options.uri = prefix + uri
            }

            if (!('json' in options)) {
                options.json = true
            }

            if (options.formData) {
                options.json = null
            }

            if (!_aop || _aop.isNeedAccessToken !== false) {

                let accessToken = await scope.store.getAccessToken(scope.appid, scope.secret)

                if (options.qs) {
                    options.qs.access_token = accessToken
                } else {
                    if (~options.uri.indexOf('?')) { //=== !=-1
                        //包含
                        options.uri += '&access_token=' + accessToken
                    } else {
                        options.uri += '?access_token=' + accessToken
                    }
                }
            }

            let body = await new Promise((resolve, reject) => {

                request(options, (err, res, body) => {

                    if (err || !res) return reject(err)

                    let type = res.headers['content-type']

                    if (~type.indexOf('image/')) {
                        //是图片文件流

                        let fullfilepath = path.join(scope.dir, type.replace('image/', '.'))

                        res.pipe(fs.createWriteStream(fullfilepath))
                            .on('finish', () => resolve(fullfilepath))
                            .on('error', err => reject(err))

                        return
                    }

                    if (options.formData && (typeof body === 'string')) {
                        try {
                            body = JSON.parse(body)
                        } catch (ex) {
                            reject(ex)
                        }
                    }

                    resolve(body)
                })

            })

            if (_aop && _aop.resPrepare && typeof _aop.resPrepare === 'function') {

                if (Object.getPrototypeOf(_aop.resPrepare).constructor.name === 'AsyncFunction') {

                    body = await _aop.resPrepare.call(scope, body)

                } else {

                    body = _aop.resPrepare.call(scope, body)

                    if (body instanceof Promise) {
                        body = await Promise.resolve(body)
                    }
                }
            }

            return body
        }
    }
}

/**
 * 注册微信操作模块
 *
 * @param {any} mdu 模块名称
 * @param {any} action 模块动作
 * @param {any} uri 模块动作请求的微信服务器地址
 * @param {any} aop 模板动作发生的拦截操作
 */
Wechat.on = function(mdu, action, url, aop) {

    let actions = mdus[mdu]

    if (!actions) {

        mdus[mdu] = actions = {}

        Object.defineProperty(Wechat.prototype, mdu, {
            get: (function(_mdu) {

                return function() {

                    let actions = mdus[_mdu]

                    actions[WechatSymbol] = this

                    return actions
                }
            }(mdu))
        })
    }

    if (!aop && typeof uri !== 'string') {
        aop = url
        url = null
    }

    Object.defineProperty(actions, action, {
        get: actionBind(mdu, url, aop)
    })

    return module.exports
}