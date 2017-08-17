require('../wechat')
    .on('blacks', 'list', '/cgi-bin/tags/members/getblacklist', {
        reqPrepare: function(begin_openid) {
            return {
                body: {
                    begin_openid: begin_openid
                },
                method: 'post',
                json: true
            }
        }
    })
    .on('blacks', 'add', '/cgi-bin/tags/members/batchblacklist', {
        reqPrepare: function(openids) {
            return {
                body: {
                    openid_list: openids
                },
                method: 'post',
                json: true
            }
        }
    })
    .on('blacks', 'remove', '/cgi-bin/tags/members/batchunblacklist', {
        reqPrepare: function(openids) {
            return {
                body: {
                    openid_list: openids
                },
                method: 'post',
                json: true
            }
        }
    })