// const redis = require('redis')
// const bluebird = require('bluebird')
// const config = require('../conf/default.js')
// const {
//     loggerHttp
// } = require('./logger.js')

// const redis_client = redis.createClient(config.redis.port, config.redis.host)

// bluebird.promisifyAll(redis.RedisClient.prototype)
// bluebird.promisifyAll(redis.Multi.prototype)

// redis_client.on('error', err => {
//     loggerHttp.error(`redis -- ${err}`)
// })

// const redis_cli = {

//     async set (db, key, value, expired) {

//         await redis_client.selectAsync(db)

//         await redis_client.setAsync(key, value)

//         return redis_client.expireAsync(key, expired)
//     },

//     async get (db, key) {
//         await redis_client.selectAsync(db)

//         return await redis_client.getAsync(key)
//     },

//     async del(db, key) {
//         await redis_client.selectAsync(db)

//         return await redis_client.delAsync(key)
//     },
//     async push(key, value, expired) {
//         await redis_client.selectAsync(7)
//         await redis_client.lpush(key, value);
//         return await redis_client.expireAsync(key, expired);
//     },
//     async getList(key) {
//         await redis_client.selectAsync(7)
//         return await redis_client.lrange(key, 0, 100);
//     }
// }



const Redis = require('ioredis')
const bluebird = require('bluebird')
const config = require('../conf/default.js')

const redis_client = new Redis({
    port: config.redis.port,          
    host: config.redis.host,   
    family: 4,
    // password:settings.ioredis.password,
    db: 0
});
redis_client.on('connect', function () {
    // console.info('Reids connect success')
});
redis_client.on('end', function () {
    console.error('Redis connect error')
});

const redis_cli = {

    async set (db, key, value, expired) {
        await redis_client.select(db)
        // await redis_client.set(key, value,'EX',expired)
        await redis_client.set(key, value)
        return redis_client.expire(key, expired)
    },

    async get (db, key) {
        await redis_client.select(db)
        return await redis_client.get(key)
    },

    async del(db, key) {
        await redis_client.select(db)
        return await redis_client.del(key)
    },

    async push(key, value, expired) {
        await redis_client.select(4)
        await redis_client.lpush(key, value);
        return await redis_client.expire(key, expired);
    },
    async getList(key) {
        await redis_client.select(4)
        return await redis_client.lrange(key, 0, 100);
    },
    async remove(key,value){
        await redis_client.select(4)
        await redis_client.lrem(key,0,value)
    }

}

module.exports = redis_cli