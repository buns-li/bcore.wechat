require('../wechat')
    .on('qrcode', 'create', '/cgi-bin/qrcode/create', {
        /**
         * 创建二维码
         * 
         * @param {Number} expires 二维码过期时间
         * @param {String} sceneContent 整数的场景id或场景字符串
         * @param {Boolean} isforever 是否永久性的二维码
         */
        reqPrepare: function(expires, sceneContent, isforever) {

            let bodyData = {
                expire_seconds: expires || 604800,
                action_info: {
                    scene: {}
                }
            }

            if (typeof sceneContent === 'number') {
                bodyData.action_name = isforever ? 'QR_LIMIT_SCENE' : 'QR_SCENE'
                bodyData.action_info.scene.scene_id = sceneContent
            } else {
                bodyData.action_name = isforever ? 'QR_LIMIT_STR_SCENE' : 'QR_STR_SCENE'
                bodyData.action_info.scene.scene_str = sceneContent
            }

            return {
                body: bodyData
            }
        }
    })
    .on('qrcode', 'getImageFile', '/cgi-bin/showqrcode', {
        reqPrepare: function(ticket) {
            return {
                qs: {
                    ticket: encodeURIComponent(ticket)
                },
                method: 'get',
                json: false
            }
        }
    })