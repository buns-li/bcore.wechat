# bcore.wechat

a wechat mini-server of bcore

## 支持的微信公众平台API如下

+ 用户标签 (tag)
  + 标签列表 (list)
  + 创建标签 (create)
  + 编辑标签 (update)
  + 删除标签 (del)

+ 用户 (user)
  + 获取用户基本信息 (detail)
  + 获取用户列表 (list)
  + 获取用户所属标签 (tags)
  + 用户新增标签 (addTag)
  + 用户新增备注 (addRemark)
  + 用户移除标签 (rmTag)
  + 获取标签下的用户列表 (ofTag)

+ 黑名单 (blacks)
  + 黑名单列表 (list)
  + 添加黑名单 (add)
  + 移除黑名单 (del)

+ 客服 (kf)
  + 所有客服列表 (list)
  + 在线客服列表 (onlines)
  + 创建客服 (create)
  + 更新客服 (update)
  + 删除客服 (del)
  + 上传客服头像 (uploadHeadimg)
  + 发送客服消息 (sendMsg)
  + 获取客服聊天记录 (chatRecords)
  + 客服绑定微信号 (bind)

+ 公众号菜单 (menu)
  + 自定义菜单列表 (list)
  + 删除自定义菜单 (clear)
  + 创建自定义菜单 (create)
  + 获取个性化菜单 (conditionals)
  + 清除个性化菜单 (clearConditional)
  + 创建个性化菜单 (createConditional)

+ 素材 (media)
  + 创建临时素材 (createTemp)
  + 获取临时素材 (getTemp)
  + 上传图片消息 (uploadArticleImage)
  + 创建永久图文素材 (createArticles)
  + 创建非图文类型的永久素材 (create)
  + 修改永久素材 (update)
  + 删除永久素材 (del)
  + 获取永久素材 (get)
  + 获取永久素材总数 (totalCount)
  + 获取永久素材列表 (list)
  + 上传视频 (uploadVideo)

+ 消息 (msg)
  + 获取消息自动回复规则 (getReplyRules)
  + 群发消息至平台关联的所有微信用户: 图片、音频、视频、卡券、图文、文本 (sendToAll)
  + 群发至对应tag的用户: 图片、音频、视频、卡券、图文、文本  (sendToTag)
  + 群发至指定的openid用户: 图片、音频、视频、卡券、图文、文本 (sendToOpenID)
  + 获取群发消息的发送状态 (getMassStatus)
  + 群发消息的预览 (previewMass)
  + 删除群发消息 (delMass)
  + 发送文本至所有用户 (sendText)
  + 发送文本至tag对应的用户 (sendTextToTag)
  + 发送文本至openid对应的用户 (sendTextToOpenID)
  + 发送图片至所有用户 (sendImage)
  + 发送图片至tag对应的用户 (sendImageToTag)
  + 发送图片至openid对应的用户 (sendImageToOpenID)
  + 发送视频至所有用户 (sendVideo)
  + 发送视频至tag对应的用户 (sendVideoToTag)
  + 发送视频至openid对应的用户 (sendVideoToOpenID)
  + 发送音频至所有用户 (sendVoice)
  + 发送音频至tag对应的用户 (sendVoiceToTag)
  + 发送音频至openid对应的用户 (sendVoiceToOpenID)

+ 二维码 (qrcode)
  + 创建二维码 (create)
  + 获取二维码文件 (getImageFile)

+ 支付 (pay)
  + 获取JSSDK中发起支付请求的配置 (getJSBridgePayParams)
  + 统一下单 (unifiedOrder)
  + 查询订单 (queryOrder)
  + 关闭订单 (closeOrder)
  + 申请退款 (refund)
  + 查询退款 (queryRefund)
  + 下载对账单 (downloadBill)
  + 交易保障 (getPayReport)
  + 获取订单评论 (getTradeComments)

+ JSSDK (jssdk)
  + 获取accss_token (getToken)
  + 刷新access_token (refreshToken)
  + 获取微信用户信息 (getUserInfo)
  + 获取票据 (getTicket)
  + 获取wx.config的所需配置参数 (getConfig)

## 替换实现

**wechat.on(moduleName,actionName,[url],[aop])**:

替换或者新增微信模块处理

