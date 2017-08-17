const redis = require('redis')

const Store = require('./store')

const defaults = {
    host: '127.0.0.1',
    port: 6379,
    connectionName: 'bcore.wechat.store',
    db: 0,
    keepAlive: 1,
    family: 4,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    connectTimeout: 10000,
    autoResubscribe: false,
    autoResendUnfulfilledCommands: true,
    lazyConnect: true,
    keyPrefix: 'wechat:',
    reconnectOnError: function(err) {
        let targetError = 'READONLY'
        if (err.message.slice(0, targetError.length) === targetError) {
            // Only reconnect when the error starts with 'READONLY'
            return true
        }
    },
    // This is the default value of `retryStrategy`
    retryStrategy: function(times) {
        let delay = Math.min(times * 50, 2000)
        return delay
    }
}

class RedisStore extends Store {

    constructor(config, expires) {

        super(config, expires)

        this.conf = Object.assign(defaults, config)
    }

    _connect() {
        this.client = redis.createClient(this.conf)
    }

    loadFromEngine(appid) {

        if (!this.client) this._connect()

        let cols = ['token', 'expires', 'time']

        let cb,
            promise = new Promise((resolve, reject) => {
                cb = (...args) => {
                    let err = args.shift()
                    if (err) return reject(err)

                    let data = {}

                    args[0].forEach((arg, index) => {
                        data[cols[index]] = arg
                    })

                    resolve(data)
                }
            })

        this.client.hmget(appid, cols, cb)

        return promise
    }

    saveToEngine(appid, tokenInfo) {

        if (!this.client) this._connect()

        let cb,
            promise = new Promise((resolve, reject) => {
                cb = (...args) => {
                    let err = args.shift()
                    if (err) return reject(err)
                    resolve(...args)
                }
            })

        this.client.hmset(appid, ['token', tokenInfo.access_token || '', 'expires', tokenInfo.expires_in || '', 'time', tokenInfo.cacheTime], cb)

        return promise
    }
}

module.exports = function(...args) {
    return new RedisStore(...args)
}