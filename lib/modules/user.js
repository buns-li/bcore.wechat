/**
 * Refer to <>
 */

require('../wechat')
    //获取公众号用户信息
    .on('user', 'detail', '/cgi-bin/user/info', {
        reqPrepare: function(openid) {
            return {
                qs: {
                    openid: openid,
                    lang: 'zh_CN'
                },
                method: 'get'
            }
        }
    })
    //获取公众号用户列表
    .on('user', 'list', '/cgi-bin/user/get', {
        reqPrepare: function(fromOpenID) {
            return {
                qs: {
                    'next_openid': fromOpenID
                },
                method: 'get'
            }
        }
    })
    //获取用户标签
    .on('user', 'tags', '/cgi-bin/tags/getidlist', {
        reqPrepare: function(openid) {
            return {
                body: {
                    openid: openid
                }
            }
        }
    })
    .on('user', 'ofTag', '/cgi-bin/user/tag/get', {
        reqPrepare: function(tagid, fromOpenId) {
            return {
                body: {
                    tagid: tagid,
                    'next_openid': fromOpenId
                },
                method: 'get'
            }
        }
    })
    .on('user', 'rmTag', '/cgi-bin/tags/members/batchuntagging', {
        reqPrepare: function(tagid, openids) {
            return {
                body: {
                    'openid_list': openids,
                    tagid: tagid
                }
            }
        }
    })
    .on('user', 'addTag', '/cgi-bin/tags/members/batchtagging', {
        reqPrepare: function(tagid, openids) {
            return {
                body: {
                    tagid: tagid,
                    'openid_list': openids
                }
            }
        }
    })
    .on('user', 'addRemark', '/cgi-bin/user/info/updateremark', {
        reqPrepare: function(openid, remark) {
            return {
                body: {
                    openid: openid,
                    remark: remark
                }
            }
        }
    })