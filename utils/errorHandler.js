const {
    loggerHttp,
    loggerHttpInfo
} = require('./logger.js')
const verify = require('./verifyToken.js')
const ErrorCode = require('../utils/errorCode.js')
const returnJson = require('../utils/returnJson.js')
const errorHandler = {
    error(app) {
        // 判断Token
        app.use(async (ctx, next) => {
            try {
                if (ctx.url === '/') {
                    await next()
                    return
                }
                if ((/\/api\/users\/sms\?mobile_phone=.*/ ).test(ctx.url)) {
                    await next()
                    return
                }
                if ((/\/api\/users\/email\?email=.*/ ).test(ctx.url)) {
                    await next()
                    return
                }
                if ((/\/api3\/*/).test(ctx.url)){
                    await next()
                    return
                }
                if (ctx.url === '/api/users/register') {
                    await next()
                    return
                }
                if (ctx.url === '/api/users/forget') {
                    await next()
                    return
                }
                if ((/\/api\/users\/salt\?mobile_phone=.*/).test(ctx.url)) {
                    await next()
                    return
                }
                if ((/\/api\/get\/salt\?email=.*/).test(ctx.url)) {
                    await next()
                    return
                }
                if (ctx.url === '/api/users/login' || ctx.url === '/api2/phone/login') {
                    await next()
                    return
                }
                if ((/\/api\/get\/userinfo\?mobile_phone=.*/).test(ctx.url)) {
                    await next()
                    return
                }
                if ((/\/api\/get\/userinfo\?email=.*/).test(ctx.url)) {
                    await next()
                    return
                }
                if ((/\/api2\/.*/).test(ctx.url)) {
                    const result = await verify.verifyToken2(ctx)
                    if(result){
                        await next()
                        return
                    }else{
                        return
                    }
                }
                const result = await verify.verifyToken(ctx)
                if (!result) {
                    return
                }
                await next()
            } catch (err) {
                console.info(`${ctx.url} -- `,err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_INVALID_TOKEN)
                }
            }
        })
        // default
        app.use(async (ctx, next) => {
            try {
                await next()
            } catch (err) {
                loggerHttp.error(err)
                ctx.status = err.status || 500
                ctx.body = 'server inside error'
            }
        })
    }
}

module.exports = errorHandler
