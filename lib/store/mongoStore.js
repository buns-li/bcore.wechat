const Store = require('./store')

const MongoClient = require('mongodb').MongoClient

function generateUrl(options) {

    let url = 'mongodb://'

    if (options.oauth) {
        url += options.oauth.user + ':' + options.oauth.pass + '@'
    }

    url += options.host || '127.0.0.1'

    url += ':' + (options.port || '27017')

    url += '/' + options.database

    return url
}

function getPromiseCb() {

    let cb
    let promise = new Promise((resolve, reject) => {

        cb = function(...args) {

            let err = args.shift()

            if (err) return reject(err)

            resolve(...args)

        }

    })

    return [promise, cb]
}

class MongoStore extends Store {

    constructor(config, expires) {
        super(config, expires)
    }

    async loadFromEngine(appid) {

        let url = generateUrl(this.conf)

        let [cb, promise] = getPromiseCb()

        MongoClient.connect(url, (err, db) => {

            if (err) return cb(err)

            db.collection('tokens')
                .findOne({
                    appid: appid
                }, {
                    fields: { access_token: 1, expires_in: 1, cache_time: 1 }
                }, (err2, doc) => {

                    if (err2) return cb(err2)

                    let tokenInfo = {}

                    tokenInfo.access_token = doc.access_token
                    tokenInfo.expires_in = doc.expires_in
                    tokenInfo.cacheTime = doc.cache_time

                    db.close()

                    return cb(null, tokenInfo)
                })

        })

        return promise
    }

    saveToEngine(appid, tokenInfo) {

        let url = generateUrl(this.conf)

        let [cb, promise] = getPromiseCb()

        MongoClient.connect(url, (err, db) => {

            if (err) return cb(err)

            let col = db.collection('tokens')

            col.findOneAndDelete({ appid: appid }, (err2, r) => {

                if (err2) return cb(err2)

                col.insert({
                    'appid': appid,
                    'access_token': tokenInfo.access_token,
                    'expires_in': tokenInfo.expires_in || 7200,
                    'cache_time': tokenInfo.cacheTime || new Date().getTime()
                }, (err3, r2) => {
                    if (err3) return cb(err3)
                    return cb(null, !!r2.value)
                })
            })
        })

        return promise
    }
}

module.exports = function(...args) {
    return new MongoStore(...args)
}