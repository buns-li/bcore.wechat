const fs = require('fs')
const path = require('path')
const MIME = require('../MIME')

require('../wechat')
    //创建临时素材
    .on('media', 'createTemp', '/cgi-bin/media/upload', {
        reqPrepare: function(type, filepath) {
            let reqOpts = {
                qs: { type: type },
                formData: {
                    media: {
                        value: fs.createReadStream(filepath),
                        options: {
                            filename: path.basename(filepath),
                            contentType: MIME[path.extname(filepath)]
                        }
                    }
                }
            }

            return reqOpts
        }
    })
    //获取临时素材
    .on('media', 'getTemp', '/cgi-bin/media/get', {
        reqPrepare: function(mediaID) {
            return {
                qs: {
                    'media_id': mediaID
                },
                method: 'get'
            }
        }
    })
    //上传图文消息中的图片,并得到该图片在微信服务器的地址
    .on('media', 'uploadArticleImage', '/cgi-bin/media/uploadimg', {
        reqPrepare: function(filepath) {
            return {
                formData: {
                    media: {
                        value: fs.createReadStream(filepath),
                        options: {
                            filename: path.basename(filepath),
                            contentType: MIME[path.extname(filepath)]
                        }
                    }
                }
            }
        }
    })
    //创建永久图文素材
    .on('media', 'createArticles', '/cgi-bin/material/add_news', {
        reqPrepare: function(articles) {
            return {
                body: {
                    articles: articles
                }
            }
        }
    })
    //新增其他类型的永久素材(非图文类的)
    .on('media', 'create', '/cgi-bin/material/add_material', {
        reqPrepare: function(type, filepath) {
            return {
                qs: {
                    type: type
                },
                formData: {
                    media: {
                        value: fs.createReadStream(filepath),
                        options: {
                            filename: path.basename(filepath),
                            contentType: MIME[path.extname(filepath)]
                        }
                    }
                }
            }
        }
    })
    //修改永久素材
    .on('media', 'update', '/cgi-bin/material/update_news', {
        reqPrepare: function(mediaID, articles, position) {
            return {
                body: {
                    'media_id': mediaID,
                    articles: articles,
                    position: position
                }
            }
        }
    })
    //删除永久素材
    .on('media', 'del', '/cgi-bin/material/del_material', {
        reqPrepare: function(mediaID) {
            return {
                body: {
                    'media_id': mediaID
                }
            }
        }
    })
    //获取永久素材
    .on('media', 'get', '/cgi-bin/material/get_material', {
        reqPrepare: function(mediaID) {
            return {
                body: {
                    'media_id': mediaID
                }
            }
        }
    })
    //永久素材总数
    .on('media', 'totalCount', '/cgi-bin/material/get_materialcount', {
        reqPrepare: function() { return { method: 'get' } }
    })
    //永久素材列表
    .on('media', 'list', '/cgi-bin/material/batchget_material', {
        reqPrepare: function(type, offset, count) {
            let reqQS = { type: type, offset: offset }

            count = parseInt(count, 10)

            reqQS.count = count > 20 ? 20 : (count < 1 ? 1 : count)

            return { body: reqQS }
        }
    })
    .on('media', 'uploadVideo', '/cgi-bin/media/uploadvideo', {
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