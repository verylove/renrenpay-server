const nanoid = require('nanoid')
const _ = require('lodash')
const {
    loggerHttp
} = require('../utils/logger.js')
const ErrorCode = require('../utils/errorCode.js')
const returnJson = require('../utils/returnJson.js')
const redisCli = require('../utils/redisClient.js')
const MD5 = require('../utils/md5.js')
const Jwt = require('../utils/jwt.js')
const verifyParams = require('../utils/verifyParams.js')
const verifyToken = require('../utils/verifyToken.js')
const sendSms = require('../utils/sendSms.js')
const sendEmail = require('../utils/sendEmail.js')
const withdraws = require('../db/models/withdraws.js')
const users = require('../db/models/users.js')
const uuidv1 = require('uuid/v1')

const withdrawsController = {
    withdraw() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                data.action = 'withdraw'
                data.uuid = uuidv1()
                data.memo = ''

                // 判断参数是否缺少
                await verifyParams(data, 'type', 'amount', 'memo').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 添加提现记录
                await withdraws.addWithdraw(data).then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_WITHDRAW_FAILED,
                            message: '添加提现记录错误'
                        }
                    }
                })

                // 更新balance
                await users.updateBalance(data).then(result => {
                    if (result[0]) {
                        returnJson.success(ctx)
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }
                })
            } catch (err) {
                console.info(`${ctx.url} -- `,err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_WITHDRAW_FAILED)
                }
            }
        }
    },
}

module.exports = withdrawsController
