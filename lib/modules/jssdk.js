const util = require('../util')

require('../wechat')
    .on('jssdk', 'getToken', '/sns/oauth2/access_token', {
        reqPrepare: function(code, grantType = 'authorization_code') {
            return {
                qs: {
                    'appid': this.appid,
                    'secret': this.secret,
                    'code': code,
                    'grant_type': grantType || 'authorization_code'
                },
                method: 'get'
            }
        }
    })
    .on('jssdk', 'refreshToken', '/sns/oauth2/refresh_token', {
        reqPrepare: function(refreshToken, grantType = 'refresh_token') {
            return {
                qs: {
                    'appid': this.appid,
                    'refresh_token': refreshToken,
                    'grant_type': grantType || 'refresh_token'
                }
            }
        }
    })
    .on('jssdk', 'getUserInfo', '/sns/userinfo', {
        reqPrepare: function(openID, lang = 'zh_CN') {
            return {
                qs: {
                    'openid': openID,
                    'lang': lang || 'zh_CN',
                    'access_token': this.store.getJSSDKToken(this.appid, this.secret)
                },
                method: 'get'
            }
        }
    })
    .on('jssdk', 'getTicket', '/cgi-bin/ticket/getticket', {
        reqPrepare: function(accessToken, type = 'jsapi') {
            return {
                method: 'get',
                qs: {
                    'access_token': accessToken || this.store.getJSSDKToken(this.appid, this.secret),
                    'type': 'jsapi'
                }
            }
        }
    })
    .on('jssdk', 'getConfig', async function(url, jsApiList, ticket, debug = false) {

        url = util.removeURLHash(url)

        if (!ticket) {
            ticket = await this.jssdk.getTicket()
        }

        let kv = {
            'timestamp': util.generateTimeStamp(),
            'nonceStr': util.generateNonceStr(),
            'url': url,
            'jsapi_ticket': ticket
        }

        kv.signature = util.getJSSDKSign(kv)

        kv.appId = this.appid
        kv.debug = !!debug
        kv.jsApiList = Array.isArray(jsApiList) ? jsApiList : [jsApiList]

        return kv
    })