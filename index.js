'use strict'

const wechats = {}

const bcore = require('bcore'),
    Wechat = require('./lib/wechat'),
    Store = require('./lib/store/store')

require('./lib/wechat-modules')

exports.Store = Store

exports.on = Wechat.on

/**
 * ```js
 *   await this.msrv.wechat.user.getInfo(...args)
 *   await this.msrv.wechat.user.getInfo(...args)
 * ```
 */
bcore.on('wechat', {
    store: {
        type: 'memory'
    },
    expires: 6000,
    //微信端服务器下载下来的文件存放地址
    dir: process.cwd()
}, function() {

    this.__init = function(options) {

        function wechatInstance(options, store) {

            let wechat = wechats[options.name] = new Wechat(options.name, options)

            wechat.store = store

            return wechat
        }

        let store

        if (options.store) {
            if (options.store instanceof Store) {
                store = options.store
            } else {
                switch (options.store.type) {
                    case 'redis':
                        store = require('./lib/store/redisStore')(options.store.opts, options.expires)
                        break
                    case 'mongo':
                        store = require('./lib/store/mongoStore')(options.store.opts, options.expires)
                        break
                    case 'memory':
                    default:
                        store = require('./lib/store/memoryStore')(options.expires)
                        break
                }
            }
        } else {
            store = require('./lib/store/memoryStore')(options.expires)
        }

        if (!options.oauths) {
            throw new Error('bcore.wechat 的初始配置中并未配置`oauths`选项')
        }

        if (Array.isArray(options.oauths)) {

            if (!options.oauths.length) {
                throw new Error('bcore.wechat 的初始配置中并未配置`oauths`选项')
            }

            options.oauths.forEach((oauth, index) => {

                if (!('dir' in oauth) || !oauth.dir) {
                    oauth.dir = options.dir
                }

                let wechat = wechatInstance(oauth, store)

                if (!index) {
                    this.__proto__ = wechat
                }
            })
        } else {
            if (!('dir' in options.oauths) || !options.oauths.dir) {
                options.oauths.dir = options.dir
            }

            this.__proto__ = wechatInstance(options.oauths, store) //强制的调整this的原型链指向
        }
    }

    /**
     * 切换WeChat身份
     */
    this.of = identity => identity === this.cn ? this : wechats[identity]

})