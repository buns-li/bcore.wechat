const Store = require('./store')

const caches = {}

class MemoryStore extends Store {

    constructor(expires) {
        super({}, expires)
    }

    async loadFromEngine(appid) {
        return caches[appid] || {}
    }

    saveToEngine(appid, tokenInfo) {
        caches[appid] = tokenInfo
    }
}

module.exports = function(...args) {
    return new MemoryStore(...args)
}