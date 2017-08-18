const Should = require('should')

const RedisStore = require('../lib/store/redisStore')
const MongoStore = require('../lib/store/mongoStore')

describe('bcore.core Store BDD', () => {

    let redisStore, mongoStore

    before((done) => {

        redisStore = RedisStore({}, 6000)

        mongoStore = MongoStore({}, 6000)
    })

    it('should have properties `token`,`time`,`expires` of `RedisStore.getAccessToken` ', (done) => {
        redisStore.getAccessToken('', '')
            .then(data => {
                Should(data).have.properties(['token', 'time', 'expires'])
                done()
            })
            .catch(err => {
                done(err)
            })
    })

    it('should have properties `token`,`time`,`expires` of `MongoStore.getAccessToken` ', (done) => {
        mongoStore.getAccessToken('', '')
            .then(data => {
                Should(data).have.properties(['token', 'time', 'expires'])
                done()
            })
            .catch(err => {
                done(err)
            })
    })
})