/**
 * Refer to : <https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837>
 */
require('../wechat')
    //获取标签列表
    .on('tag', 'list', '/cgi-bin/tags/get')
    //创建标签
    .on('tag', 'create', '/cgi-bin/tags/create', {
        /**
         * @param {String} tagName 标签名称
         */
        reqPrepare: function(tagName) {
            return {
                body: {
                    tag: {
                        name: tagName
                    }
                }
            }
        }
    })
    //编辑标签
    .on('tag', 'update', '/cgi-bin/tags/update', {
        /**
         * @param {String} tagid 标签id
         * @param {String} tagName 标签名称
         */
        reqPrepare: function(tagid, tagName) {
            return {
                body: {
                    tag: {
                        id: tagid,
                        name: tagName
                    }
                }
            }
        }
    })
    //删除标签
    .on('tag', 'del', '/cgi-bin/tags/delete', {
        reqPrepare: function(tagid) {
            return {
                body: {
                    tag: {
                        id: tagid
                    }
                }
            }
        }
    })