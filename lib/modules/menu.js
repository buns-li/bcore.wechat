require('../wechat')
    //获取自定义菜单列表
    .on('menu', 'list', '/cgi-bin/menu/get')
    //删除自定义菜单
    .on('menu', 'clear', '/cgi-bin/menu/delete')
    //创建/覆盖自定义菜单
    .on('menu', 'create', '/cgi-bin/menu/create', {
        reqPrepare: function(buttons) {
            return {
                body: { buttons: buttons }
            }
        }
    })
    //获取个性化菜单列表
    .on('menu', 'condtionals', '/cgi-bin/menu/trymatch', {
        reqPrepare: function(userIdentity) {
            return {
                body: { user_id: userIdentity }
            }
        }
    })
    //清除个性化菜单
    .on('menu', 'clearConditional', '/cgi-bin/menu/delconditional', {
        reqPrepare: function(menuId) {
            return {
                body: { menuid: menuId }
            }
        }
    })
    //创建个性化订单
    .on('menu', 'createConditional', '/cgi-bin/menu/addconditional', {
        reqPrepare: function(button, matchrule) {
            return {
                body: {
                    button: button,
                    matchrule: matchrule
                }
            }
        }
    })