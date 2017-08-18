const Should = require('should')

const miniServer = require('./miniServer')

const WechatProcessor = require('./wechat-processor')

let obj = new WechatProcessor()

require('../index')

describe('bcore.wechat BDD Test', () => {

    before((done) => {
        miniServer(obj).then(() => {
            done()
        })
    })

    it('should have property `user`、`pay`、`tag`', (done) => {

        let kv = obj.getSrvInst()

        Should(kv).have.properties(['user', 'pay', 'tag'])

        done()
    })

    it('should return have `tags` property and `tags` have `id`,`name`,`count` property ', done => {

        obj.getTags()
            .then(data => {

                Should(data).have.property('tags')

                data.tags[0].should.have.properties(['id', 'name', 'count'])

                done()
            })
            .catch(err => {
                done(err)
            })
    })

    it.skip('should return 200 OK for user.list ', done => {
        obj.getUsers()
            .then(data => {

                console.log('data:', data)

                Should(data).have.properties(['total', 'count', 'data', 'next_openid'])

                data.data.should.have.property('openid')

                done()
            })
            .catch(err => {
                done(err)
            })
    })

    it.skip('should return 200 OK for changeWechat.user.list ', done => {
        obj.changeWechatGetUsers()
            .then(data => {

                console.log('test.data:', data)

                Should(data).have.properties(['total', 'count', 'data', 'next_openid'])

                data.data.should.have.property('openid')

                done()
            })
            .catch(err => {
                done(err)
            })
    })
})