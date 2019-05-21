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
const users = require('../db/models/users.js')
const trades = require('../db/models/trades.js')
const deposits = require('../db/models/deposits.js')
const Decimal = require('decimal.js');
const Sequelize = require('sequelize');
const mysequelize = require('../db/index').sequelize;
const usersController = {
    register() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                if (data.hasOwnProperty('mobile_phone') && data.mobile_phone == '') {
                    delete data.mobile_phone
                }
                if (data.hasOwnProperty('email') && data.email == '') {
                    delete data.email
                }

                // 判断参数是否缺少
                await verifyParams(data, 'mobile_phone_or_email', 'password', 'code').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 判断用户是否存在
                await users.chkUserExist(data).then(result => {
                    if (result.count > 0) {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_ALREADY_EXIST
                        }
                    }
                })

                if (data.mobile_phone !== undefined && data.mobile_phone !== null) {
                    // 验证短信验证码
                    let redis_code = await redisCli.get('1', data.mobile_phone)

                    if (redis_code && redis_code === data.code) {
                        //data.password = MD5(data.password)

                        // 添加用户
                        await users.addUser(data).then(result => {
                            if (result) {
                                returnJson.success(ctx, result)
                            }
                        })
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_VERIFY_SMS_FAIED
                        }
                    }
                } else {
                    // 验证邮箱验证码
                    let redis_code = await redisCli.get('1', data.email)

                    if (redis_code && redis_code === data.code) {
                        // data.password = MD5(data.password)

                        // 添加用户
                        await users.addUser(data).then(result => {
                            if (result) {
                                returnJson.success(ctx, result)
                            }
                        })
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_VERIFY_EMAILCODE_FAIED
                        }
                    }
                }
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_REGISTER_FAIED)
                }
            }
        }
    },

    getSalt() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                const salt = MD5(Math.floor(Math.random() * 10000).toString())
                data.salt = salt

                // 判断参数是否缺少
                await verifyParams(data, 'mobile_phone_or_email').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 更新salt
                await users.updateSalt(data).then(result => {
                    if (result[0]) {
                        returnJson.success(ctx, {salt: salt})
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }
                })
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_GET_SALT_FAIED)
                }
            }
        }
    },

    login() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                if (data.hasOwnProperty('mobile_phone') && data.mobile_phone == '') {
                    delete data.mobile_phone
                }
                if (data.hasOwnProperty('email') && data.email == '') {
                    delete data.email
                }
                let dataValues

                // 判断参数是否缺少
                await verifyParams(data, 'mobile_phone_or_email', 'password').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 判断用户是否存在
                await users.chkUserExist(data).then(result => {
                    if (result.count <= 0) {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }

                    dataValues = result
                })
                // 生成临时密码
                const password_salt = MD5(dataValues.rows[0].dataValues.password + dataValues.rows[0].dataValues.salt)
                console.info('password_salt', password_salt);
                delete dataValues.rows[0].dataValues.password
                delete dataValues.rows[0].dataValues.salt


                if (password_salt === data.password) {
                    // 生成Token
                    let jwt = new Jwt(dataValues.rows[0].dataValues)
                    let token = jwt.generateToken()

                    // 缓存Redis
                    await redisCli.set('0', data.mobile_phone || data.email, token, 86400)
                    await redisCli.set('0', token, JSON.stringify(dataValues.rows[0]), 86400)
                    // 更新用户登录状态
                    data.userid = dataValues.rows[0].dataValues.id
                    data.status = 1
                    await users.updateStatus(data)
                    dataValues.rows[0].dataValues.lv = dataValues.rows[0].dataValues.membership_expired > new Date().getTime() ? dataValues.rows[0].dataValues.lv : 0;
                    returnJson.success(ctx, _.extend({user: dataValues.rows[0].dataValues}, {token: token}))
                } else {
                    throw {
                        code: ErrorCode.ERRORCODE_USER_INVALID_USERNAME_OR_PASSWORD
                    }
                }
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_LOGIN_FAIED)
                }
            }
        }
    },

    logout() {
        return async (ctx, next) => {
            try {
                const data = ctx.query || {}
                data.userid = ctx.state.user.id

                // 获取user
                await users.getUserById(data).then(result => {
                    if (result) {
                        data.mobile_phone = result.dataValues.mobile_phone
                        data.email = result.dataValues.email
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }
                })

                if (data.userid > 0) {
                    // 移除缓存Redis
                    await redisCli.del('0', data.mobile_phone || data.email)
                    await redisCli.del('0', ctx.request.header.token)
                }

                returnJson.success(ctx)
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_LOGOUT_FAIED)
                }
            }
        }
    },

    getUserInfo() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                // console.info(ctx.state.user);
                data.mobile_phone = ctx.state.user.mobile_phone;
                data.email = ctx.state.user.email;

                // 获取user
                await users.getUser(data).then(result => {
                    if (result) {
                        result.lv = new Date().getTime() > result.membership_expired ? 0 : result.lv;
                        returnJson.success(ctx, {user: result})
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }
                })
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_GET_USERINFO_FAIED)
                }
            }
        }
    },

    updateUserInfo() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                if (data.hasOwnProperty('mobile_phone') && data.mobile_phone == '') {
                    delete data.mobile_phone
                }
                if (data.hasOwnProperty('email') && data.email == '') {
                    delete data.email
                }
                data.userid = ctx.state.user.id

                // 更新user
                await users.updateUserBasicInfo(data).then(result => {
                    if (result[0]) {
                        returnJson.success(ctx)
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }
                })
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_UPDATE_USERINFO_FAIED)
                }
            }
        }
    },

    rechargeMembership() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                // 判断参数是否缺少
                await verifyParams(data, 'tradeid', 'userid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                });
                const user = await users.getUserById(data);
                const trade = await trades.findTradeById(data.tradeid);
                if (user.balance - trade.amount < 0) {
                    throw {
                        code: ErrorCode.ERRORCODE_USER_BALANCE_NOT_ENOUGH,
                        message: "账户余额不足"
                    }
                }

                await deposits.addDeposit({
                    type: 3,
                    userid: data.userid,
                    orderid: new Date().getTime() + Math.random().toString().slice(-6), //订单id
                    amount: trade.amount,
                    tradeid: data.tradeid,
                    memo: trade.name
                });
                await deposits.updateDepositInfo({status: 1});
                // await users.updateMembership({action: 'deposit', userid: order.userid, amount: order.amount})
                const isOutTime = Date.now() > user.membership_expired;
                let recharges_time = isOutTime ? Date.now() : user.membership_expired;
                let newLv = isOutTime ? trade.lv : (trade.lv > user.lv ? trade.lv : user.lv);
                recharges_time = 1000 * 60 * 60 * 24 * trade.day + recharges_time;
                const balance = user.balance - trade.amount;
                await users.updateMembership({
                    membership_expired: recharges_time,
                    lv: newLv,
                    balance: balance,
                    userid: data.userid
                })
                await users.getUserById(data).then(result => {
                    returnJson.success(ctx, result)
                })
            } catch (err) {
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    console.log(err);
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_RECHARGE_MEMBERSHIP_FAILED)
                }
            }
        }
    },

    sendSms1() {
        return async (ctx, next) => {
            try {
                const data = ctx.query

                let mobile_phone = data.mobile_phone
                let code = '000000'
                // let code = Math.random().toString().slice(-6);
                // 判断参数是否缺少
                await verifyParams(data, 'mobile_phone').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 发送短信
                await sendSms(mobile_phone, code, 0).then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_SEND_SMS_FAIED
                        }
                    }
                })

                // 缓存redis
                redisCli.set('1', mobile_phone, code, 60)

                returnJson.success(ctx)

            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SEND_SMS_FAIED)
                }
            }
        }
    },

    sendEmail1() {
        return async (ctx, next) => {
            try {
                const data = ctx.query

                let email = data.email
                let code = '000000'
                // let code = Math.random().toString().slice(-6);
                // 判断参数是否缺少
                await verifyParams(data, 'email').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 发送邮箱
                await sendEmail(email, code, 0).then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_SEND_EMAILCODE_FAIED
                        }
                    }

                    // 缓存redis
                    // redisCli.set('1', email, code, 60)
                })

                // 缓存redis
                redisCli.set('1', email, code, 60)

                returnJson.success(ctx)

            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SEND_EMAILCODE_FAIED)
                }
            }
        }
    },
    //修改密码
    updatePwd() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                // 判断参数是否缺少
                await verifyParams(data, 'old_password', 'new_password').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                let dataValues
                // 判断用户是否存在
                await users.getUserById(data).then(result => {
                    dataValues = result.dataValues;
                    // console.info(result.dataValues);
                })
                if (data.old_password === dataValues.password) {
                    await users.updatePwd(data).then(res => {
                        console.info(res, 'res')
                        if (res[0] > 0) {
                            returnJson.success(ctx)
                        }

                    })
                } else {
                    throw {
                        code: ErrorCode.ERRORCODE_USER_PASSWORD_ERR,
                        message: '密码错误'
                    }
                }
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_LOGIN_FAIED)
                }
            }
        }
    },

    forgetPassword() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                if (data.hasOwnProperty('mobile_phone') && data.mobile_phone == '') {
                    delete data.mobile_phone
                }
                if (data.hasOwnProperty('email') && data.email == '') {
                    delete data.email
                }

                // 判断参数是否缺少
                await verifyParams(data, 'mobile_phone_or_email', 'new_password', 'code').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 判断用户是否存在
                await users.chkUserExist(data).then(result => {
                    if (result.count == 0) {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_NOT_EXIST
                        }
                    }
                })

                if (data.mobile_phone !== undefined && data.mobile_phone !== null) {
                    // 验证短信验证码
                    let redis_code = await redisCli.get('1', data.mobile_phone)

                    if (redis_code && redis_code === data.code) {
                        //data.password = MD5(data.password)

                        // 更新用户
                        await users.updatePwd(data).then(result => {
                            if (result) {
                                returnJson.success(ctx, result)
                            }
                        })
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_VERIFY_SMS_FAIED
                        }
                    }
                } else {
                    // 验证邮箱验证码
                    let redis_code = await redisCli.get('1', data.email)

                    if (redis_code && redis_code === data.code) {
                        // data.password = MD5(data.password)

                        // 更新用户
                        await users.updatePwd(data).then(result => {
                            if (result) {
                                returnJson.success(ctx, result)
                            }
                        })
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_VERIFY_EMAILCODE_FAIED
                        }
                    }
                }
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_REGISTER_FAIED)
                }
            }
        }
    }

}

module.exports = usersController
