const errorCode = require('./errorCode.js')
const redisClient = require('./redisClient.js')
const returnCodesAndMessages = require('./returnJson.js')
const Jwt = require('./jwt.js')
const {
    loggerHttp
} = require('./logger.js')

const verifyToken = async (ctx, rank = 0) => {
    try {
        const token = ctx.request.header.token

        if (token) {
            // 验证Token
            let jwt = new Jwt(token)
            let result = jwt.verifyToken()
            if (!result || result === 'err') {
                throw {
                    code: errorCode.ERRORCODE_USER_INVALID_TOKEN
                }
            }
            ctx.state.user = result
            // 判断用户等级
            if (rank <= result.lv) {
                return result
            } else {
                throw {
                    code: errorCode.ERRORCODE_USER_PERMISSION_DENIED
                }
            }
        } else {
            throw {
                code: errorCode.ERRORCODE_USER_INVALID_TOKEN
            }
        }
    } catch (err) {
        if (err.code) {
            returnCodesAndMessages.err(ctx, err.code, err.message)
        } else {
            returnCodesAndMessages.err(ctx, errorCode.ERRORCODE_SERVER_INSIDE_ERROR, '')
            loggerHttp.error(`verifyToken -- ${err}`)
        }
    }
}

const verifyToken2 = async (ctx, rank = 0)=>{
    try {
        const token = ctx.request.header.token

        if (token) {
            let result = await redisClient.get('3', token);
            if(result){
                ctx.state.user = JSON.parse(result);
                return JSON.parse(result);
            }else {
                throw {
                    code: errorCode.ERRORCODE_USER_PERMISSION_DENIED
                }
            }
        } else {
            throw {
                code: errorCode.ERRORCODE_USER_INVALID_TOKEN
            }
        }
    } catch (err) {
        if (err.code) {
            returnCodesAndMessages.err(ctx, err.code, err.message)
        } else {
            returnCodesAndMessages.err(ctx, errorCode.ERRORCODE_SERVER_INSIDE_ERROR, '')
            loggerHttp.error(`verifyToken -- ${err}`)
        }
    }
}

module.exports = {
    verifyToken,
    verifyToken2
}
