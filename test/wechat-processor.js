module.exports = class WechatProcessor {

    constructor() {}

    getSrvInst() {

        let wechat = this.msrv.wechat
        return wechat
    }

    async getTags() {
        return await this.msrv.wechat.tag.list()
    }

    async getUsers() {
        return await this.msrv.wechat.user.list()
    }

    async changeWechatGetUsers() {
        return await this.msrv.wechat.of('test').user.list()
    }
}