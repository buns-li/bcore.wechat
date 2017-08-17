const URLS = {
    'toall': '/cgi-bin/message/mass/sendall',
    'totag': '/cgi-bin/message/mass/sendall',
    'toopenid': '/cgi-bin/message/mass/send',
    'replyrules': '/cgi-bin/get_current_autoreply_info',
    'status': '/cgi-bin/message/mass/get',
    'preview': '/cgi-bin/message/mass/preview',
    'del': '/cgi-bin/message/mass/delete'
}

const fs = require('fs')
const path = require('path')
const MIME = require('../MIME')

require('../wechat')
    //获取自动回复的规则
    .on('msg', 'getReplyRules', URLS.replyrules)
    //群发给平台所有微信用户
    .on('msg', 'sendToAll', URLS.toall, {
        /**
         * @param {String} msgType 消息类型 (default:`text`)
         * @param {any} message 消息内容
         * @param {Boolean} allowReprintSend 是否允许转载内容群发 (default:`0`)
         *
         * @return {Hash} 请求参数对象
         */
        reqPrepare: function(msgType, message, allowReprintSend = 0) {

            let reqBody = {
                'filter': { 'is_to_all': true },
                'msgtype': msgType,
                'send_ignore_reprint': !!allowReprintSend
            }

            switch (msgType) {
                case 'image':
                    reqBody.image = { 'media_id': message }
                    break
                case 'voice':
                    reqBody.voice = { 'media_id': message }
                    break
                case 'mpvideo':
                    reqBody.mpvideo = { 'media_id': message }
                    break
                case 'mpnews':
                    reqBody.mpnews = { 'media_id': message }
                    break
                case 'wxcard':
                    reqBody.wxcard = { 'card_id': message }
                    break
                case 'text':
                default:
                    reqBody.text = { content: message }
                    break
            }

            return {
                body: reqBody
            }
        }
    })
    //通过tag实现群发
    .on('msg', 'sendToTag', URLS.totag, {
        /**
         * @param {String} msgType 消息类型 (default:`text`)
         * @param {String} tagID 标签id
         * @param {any} message 消息内容
         * @param {Boolean} allowReprintSend 是否允许转载内容群发 (default:`0`)
         *
         * @return {Hash} 请求参数对象
         */
        reqPrepare: function(msgType, tagID, message, allowReprintSend = 0) {

            let reqBody = {
                'filter': { 'is_to_all': false, 'tag_id': tagID },
                'msgtype': msgType,
                'send_ignore_reprint': !!allowReprintSend
            }

            switch (msgType) {
                case 'image':
                    reqBody.image = { 'media_id': message }
                    break
                case 'voice':
                    reqBody.voice = { 'media_id': message }
                    break
                case 'mpvideo':
                    reqBody.mpvideo = { 'media_id': message }
                    break
                case 'mpnews':
                    reqBody.mpnews = { 'media_id': message }
                    break
                case 'wxcard':
                    reqBody.wxcard = { 'card_id': message }
                    break
                case 'text':
                default:
                    reqBody.text = { content: message }
                    break
            }

            return {
                body: reqBody
            }
        }
    })
    //通过OPENID消息群发
    .on('msg', 'sendToOpenID', URLS.toopenid, {
        /**
         * @param {String} msgType 消息类型 (default:`text`)
         * @param {String|Array} openids 待接收群发消息的平台用户
         * @param {any} message 消息内容
         * @param {Boolean} allowReprintSend 是否允许转载内容群发 (default:`0`)
         *
         * @return {Hash} 请求参数对象
         */
        reqPrepare: function(msgType, openids, message, allowReprintSend = 0) {

            let reqBody = {
                'touser': Array.isArray(openids) ? openids : [openids],
                'msgtype': msgType,
                'send_ignore_reprint': !!allowReprintSend
            }

            switch (msgType) {
                case 'image':
                    reqBody.image = { 'media_id': message }
                    break
                case 'voice':
                    reqBody.voice = { 'media_id': message }
                    break
                case 'mpvideo':
                    reqBody.mpvideo = { 'media_id': message }
                    break
                case 'mpnews':
                    reqBody.mpnews = { 'media_id': message }
                    break
                case 'wxcard':
                    reqBody.wxcard = { 'card_id': message }
                    break
                case 'text':
                default:
                    reqBody.text = { content: message }
                    break
            }

            return {
                body: reqBody
            }
        }
    })
    //获取群发消息状态
    .on('msg', 'getMassStatus', URLS.status, {
        reqPrepare: function(msgID) {
            return {
                body: { 'msg_id': msgID }
            }
        }
    })
    .on('msg', 'previewMass', URLS.preview, {})
    //删除群发消息
    .on('msg', 'delMass', URLS.del, {
        reqPrepare: function(msgID, articleIndex) {
            return {
                body: { 'msg_id': msgID, 'article_idx': articleIndex }
            }
        }
    })

    /************************简化客户操作方法*************************/
    .on('msg', 'sendText', URLS.toall, {
        reqPrepare: function(content, allowReprintSend = 0) {
            return {
                body: {
                    'filter': { 'is_to_all': true },
                    'msgtype': 'text',
                    'text': {
                        'content': content
                    },
                    'send_ignore_reprint': !!allowReprintSend
                }
            }
        }
    })
    .on('msg', 'sendTextToTag', URLS.totag, {
        reqPrepare: function(content, tagID, allowReprintSend = 0) {
            return {
                body: {
                    'filter': { 'is_to_all': false, 'tag_id': tagID },
                    'msgtype': 'text',
                    'text': {
                        'content': content
                    },
                    'send_ignore_reprint': !!allowReprintSend
                }
            }
        }
    })
    .on('msg', 'sendTextToOpenID', URLS.toopenid, {
        reqPrepare: function(content, openids, allowReprintSend = 0) {
            return {
                body: {
                    'touser': Array.isArray(openids) ? openids : [openids],
                    'msgtype': 'text',
                    'text': {
                        'content': content
                    },
                    'send_ignore_reprint': !!allowReprintSend
                }
            }
        }
    })

    .on('msg', 'upload', 'https://api.weixin.qq.com/cgi-bin/media/uploadvideo', {
        reqPrepare: function(videoUrl) {
            return {
                formData: {
                    media: {
                        value: fs.createReadStream(videoUrl),
                        options: {
                            filename: path.basename(videoUrl),
                            contentType: MIME[path.extname(videoUrl)]
                        }
                    }
                }
            }
        }
    })
    .on('msg', 'sendImage', URLS.toall, {
        reqPrepare: async function(imageFile, allowReprintSend = 0) {
            // return {
            //     body: {
            //         'filter': { 'is_to_all': true },
            //         'msgtype': 'text',
            //         'image': {
            //             'media_id': mediaID
            //         },
            //         'send_ignore_reprint': !!allowReprintSend
            //     }
            // }
        }
    })
    .on('msg', 'sendImageToTag', URLS.totag, {})
    .on('msg', 'sendImageToOpenID', URLS.toopenid, {})

    .on('msg', 'sendVideo', URLS.toall, {})
    .on('msg', 'sendVideoToTag', URLS.totag, {})
    .on('msg', 'sendVideoToOpenID', URLS.toopenid, {})

    .on('msg', 'sendVoice', URLS.toall, {})
    .on('msg', 'sendVoiceToTag', URLS.totag, {})
    .on('msg', 'sendVoiceToOpenID', URLS.toopenid, {})