const fs = require('fs')
const path = require('path')
const MIME = require('../MIME')

require('../wechat')
    //获取客服列表
    .on('kf', 'list', '/cgi-bin/customservice/getkflist')
    //获取在线客服列表
    .on('kf', 'onlines', '/cgi-bin/customservice/getonlinekflist')
    //添加客服
    .on('kf', 'create', '/customservice/kfaccount/add', {
        reqPrepare: function(account, nickname, password) {
            return {
                body: {
                    'kf_account': account,
                    'nickname': nickname,
                    'password': password
                }
            }
        }
    })
    //更新客服
    .on('kf', 'update', '/customservice/kfaccount/update', {
        reqPrepare: function(account, nickname, password) {
            return {
                body: {
                    'kf_account': account,
                    'nickname': nickname,
                    'password': password
                }
            }
        }
    })
    //删除客服
    .on('kf', 'del', '/customservice/kfaccount/del', {
        reqPrepare: function(account, nickname, password) {
            return {
                body: {
                    'kf_account': account,
                    'nickname': nickname,
                    'password': password
                }
            }
        }
    })
    //上传客服头像
    .on('kf', 'uploadHeadimg', '/customservice/kfaccount/uploadheadimg', {
        reqPrepare: function(account, imgPath) {
            return {
                qs: { 'kf_account': account },
                formData: {
                    media: {
                        value: fs.createReadStream(imgPath),
                        options: {
                            filename: path.basename(imgPath),
                            contentType: MIME[path.extname(imgPath)]
                        }
                    }
                }
            }
        }
    })
    //发送客服消息
    .on('kf', 'sendMsg', '/cgi-bin/message/custom/send?', {
        reqPrepare: function(to, msgtype, message, kfAccount) {

            let reqParams = {
                touser: to,
                msgtype: msgtype || 'text'
            }

            if (kfAccount) {
                reqParams.customservice = {
                    'kf_account': kfAccount
                }
            }

            switch (msgtype) {
                case 'image':
                    reqParams.image = { 'media_id': message }
                    break
                case 'voice':
                    reqParams.voice = { 'media_id': message }
                    break
                case 'video':
                    reqParams.video = message
                    break
                case 'music':
                    reqParams.music = message
                    break
                case 'news':
                    reqParams.news = { articles: !Array.isArray(message) ? [message] : message }
                    break
                case 'mpnews':
                    reqParams.mpnews = { 'media_id': message }
                    break
                case 'wxcard':
                    reqParams.wxcard = { 'card_id': message }
                    break
                case 'text':
                default:
                    reqParams.text = { content: message }
                    break
            }

            return {
                body: reqParams
            }
        }
    })
    //获取客服聊天记录
    .on('kf', 'chatRecords', '/customservice/msgrecord/getmsglist', {
        reqPrepare: function(stime, etime, msgid, number) {

            let reqBody = { msgid: msgid }

            number = parseInt(number, 10) || 10000

            reqBody.number = number > 10000 ? 10000 : number

            reqBody.stime = stime instanceof Date ? Math.round(stime.getTime() / 1000) : stime

            reqBody.etime = etime instanceof Date ? Math.round(etime.getTime() / 1000) : etime

            return { body: reqBody }
        }
    })
    //客服绑定微信号
    .on('kf', 'bind', '/customservice/kfaccount/inviteworker', {
        reqPrepare: function(account, inviteWX) {
            return {
                body: {
                    'kf_account': account,
                    'invite_wx': inviteWX
                }
            }
        }
    })