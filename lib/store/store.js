const request = require('request')

const memoryCache = {}

module.exports = class Store {

    constructor(config, expires) {
        this.conf = config
        this.expires = expires
    }

    loadFromEngine(appid) {
        throw new Error('此调用没有找到对应的实现')
    }

    saveToEngine(appid, tokenInfo) {
        throw new Error('此调用没有找到对应的实现')
    }

    _reqAccessTokenFromWechat(appid, appsecret) {
        return new Promise((resolve, reject) => {
            request({
                uri: 'https://api.weixin.qq.com/cgi-bin/token',
                method: 'get',
                qs: {
                    grant_type: 'client_credential',
                    appid: appid,
                    secret: appsecret
                },
                json: true
            }, (err, resp, body) => err ? reject(err) : resolve(body))
        })
    }

    async getAccessToken(appid, appsecret) {

        //尝试存储引擎的数据获取
        let tokenInfo = await this.loadFromEngine(appid)

        if (!tokenInfo.access_token) {

            tokenInfo = await this._reqAccessTokenFromWechat(appid, appsecret)

            if (tokenInfo.access_token) {

                tokenInfo.cacheTime = Date.now()

                this.saveToEngine(appid, memoryCache[appid] = tokenInfo)
            }
        }

        let diffTime = Date.now() - tokenInfo.cacheTime

        //如果缓存存储时间超过配置设置的有效时间,则重新获取
        if (diffTime >= this.expires) {

            tokenInfo = await this._reqAccessTokenFromWechat(appid, appsecret)

            tokenInfo.cacheTime = Date.now()

            this.saveToEngine(appid, memoryCache[appid] = tokenInfo)
        }

        return tokenInfo.access_token
    }

}