const nanoid = require('nanoid')
const _ = require('lodash')
const {
    loggerHttp, loggerHttpInfo
} = require('../utils/logger.js')
const ErrorCode = require('../utils/errorCode.js')
const returnJson = require('../utils/returnJson.js')
const redisCli = require('../utils/redisClient.js')
const MD5 = require('../utils/md5.js')
const Jwt = require('../utils/jwt.js')
const verifyParams = require('../utils/verifyParams.js')
const verifyToken = require('../utils/verifyToken.js')
const apps = require('../db/models/apps.js')
const users = require('../db/models/users.js')
const orders = require('../db/models/orders.js')
const paycodes = require('../db/models/payCode.js')
const paychecks = require('../db/models/paychecks.js')
const call = require('../utils/callback.js')
const deposits = require('../db/models/deposits.js')
const logs = require('../db/models/logs.js')
const phoneController = {
    //手机端登陆
    login2() {
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
                    await redisCli.set('3', data.mobile_phone || data.email, token, 365 * 24 * 60 * 60)
                    await redisCli.set('3', token, JSON.stringify(dataValues.rows[0]), 365 * 24 * 60 * 60)
                    // 更新用户登录状态
                    data.userid = dataValues.rows[0].dataValues.id
                    data.status = 1
                    await users.updateStatus(data)
                    dataValues.rows[0].dataValues.userid = dataValues.rows[0].dataValues.id;
                    delete dataValues.rows[0].dataValues.id;
                    data.page = data.page || 1
                    data.page_size = data.page_size || 10
                    let appList = [];
                    await apps.getApps(data).then(result => {
                        appList = result;
                    })
                    dataValues.rows[0].dataValues.lv = dataValues.rows[0].dataValues.membership_expired > new Date().getTime() ? dataValues.rows[0].dataValues.lv : 0;
                    returnJson.success(ctx, _.extend({user: dataValues.rows[0].dataValues, appList}, {token: token}))
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
    //发送二维码
    sendQrcode(socket, event) {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                console.info(data, 'sendQrcode------>')
                data.userid = ctx.state.user.id
                await verifyParams(data, 'qrcode', 'orderid', 'appid', 'amount', "pay_code", "userid").then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                let name, lv, balance;
                await users.getUser2(data).then(result => {
                    name = result.dataValues.mobile_phone;
                })

                await orders.update({qrcode: data.qrcode, orderid: data.orderid})
                const order = await orders.findOne(data);
                await paycodes.addPayCode({
                    userid: data.userid,
                    qrcode: data.qrcode,
                    amount: data.amount,
                    pay_code: data.pay_code,
                })
                await redisCli.set('4', data.pay_code, data.orderid, 5 * 60);
                // if (name === 'admin') {
                //     let uid = await redisCli.get('4', 'uu'+data.orderid);
                //     socket.sendMsg(uid, JSON.stringify({qrcode: data.qrcode, step: '1'}))
                // } else {
                event.emit(data.orderid, data.qrcode);
                // }
                returnJson.success(ctx);
            } catch (err) {
                console.error(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    },
    //查询用户的app列表
    queryApp() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id;
                data.page = data.page || 1
                data.page_size = data.page_size || 10

                await apps.getApps(data).then(result => {
                    returnJson.success(ctx, result)
                })

            } catch (error) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    },
    //告诉服务支付成功
    paySuccess(socket, event) {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                data.memo = data.pay_code;
                await verifyParams(data, 'amount', 'payway', 'pay_code').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                let name;
                let order_id
                await users.getUser2(data).then(result => {
                    name = result.dataValues.mobile_phone;
                })
                if (data.payway == '2') {
                    order_id = await redisCli.get('4', data.pay_code);
                } else {
                    order_id = data.pay_code;
                }
                let orderJson = await redisCli.get('4', order_id)
                let order;
                if (orderJson) {
                    order = JSON.parse(orderJson) || '';
                    console.info(order);
                    data.appid = order.appid;
                    data.qrcode = order.qrcode;
                    data.orderid = order_id;
                    await orders.update2({orderid: data.orderid})
                    if (data.payway == 2) {
                        data.transid = data.orderid + data.transid
                    }
                    await paychecks.addPaychecks(data);
                } else {
                    if (data.payway == 2) {
                        data.transid = data.userid + data.transid
                    }
                    await paychecks.addPaychecks(data)
                    throw {
                        code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                        message: '支付已过期'
                    }
                }
                if (order.test == 2) {
                    socket.sendMsg(order_id, JSON.stringify({
                        paySuccess: 1,
                        step: '2',
                        amount: order.amount,
                        payway: data.payway,
                        orderid: order_id
                    }));
                    redisCli.remove("pay_code" + '1' + data.amount, 0, data.pay_code);
                } else if (order.appid === '15c821df1e52' || order.test == 1) {
                    let uid = await redisCli.get('4', 'uu' + order_id);
                    console.info(uid, '-0-uid');
                    if(order.appid === "15c821df1e52") {
                        await users.updateBalance({action: 'deposit', userid: order.userid, amount: order.amount})
                        // ??updateDepositInfo 不知道是什么用的
                        await deposits.updateDepositInfo({status: 1, orderid: data.orderid})
                    }

                    socket.sendMsg(uid, JSON.stringify({
                        paySuccess: 1,
                        step: '2',
                        amount: order.amount,
                        payway: data.payway,
                        orderid: order_id
                    }));
                    redisCli.remove("pay_code" + '1' + data.amount, 0, data.pay_code);
                } else {
                    let callback_url;
                    await apps.queryApps(data).then(result => { //获取商户的回调
                        callback_url = result[0].callback_url;
                        data.appsecret = result[0].appsecret;
                    })
                    data.sign = MD5(data.appid + MD5(data.orderid) + data.appsecret)
                    console.info('data11:', {
                        amount: data.amount,
                        orderid: data.orderid,
                        appid: data.appid,
                        payway: data.payway,
                        sign: data.sign
                    })
                    let success = new Promise((resolve, reject) => {
                        event.once(data.orderid, function (arg) {
                            resolve(arg);
                        });
                    });
                    let count = 0;
                    await setImmediate(function notify() {
                        // console.log("hello")
                        call.callPost(callback_url, {
                            amount: data.amount,
                            orderid: data.orderid,
                            appid: data.appid,
                            payway: data.payway,
                            sign: data.sign
                        });
                        count++;
                        if(!success && count < 5)
                            setTimeout(notify, 2000)
                    });
                    redisCli.remove("pay_code" + data.userid + data.amount, 0, data.pay_code);
                }
                redisCli.del(4, order_id);
                returnJson.success(ctx);
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    },
    paychecks_list() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                data.userid = ctx.state.user.id
                data.page = data.page || 1
                data.page_size = data.page_size || 10
                await verifyParams(data, 'userid').then(result => {//
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                await paychecks.getList(data).then(result => {
                    returnJson.success(ctx, result);
                })
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }

        }
    },
    //收集到的日志
    setLogs() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                console.info('data:', data);
                let list = JSON.parse(data.list);
                data.list = [];
                list.forEach(element => {
                    data.list.push({
                        userid: data.userid,
                        content: element.content,
                        timestamps: element.time
                    })
                });
                await logs.setLogs(data).then(result => {
                    returnJson.success(ctx)
                })
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    },
    //查询日志
    queryLogs() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                data.userid = ctx.state.user.id
                await verifyParams(data, 'userid').then(result => {//
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                await logs.queryLog(data).then(result => {
                    returnJson.success(ctx, result)
                })
            } catch (err) {
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    },

    //clear_wx
    clear_wx() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                await paycodes.deletePayCode(data);
                returnJson.success(ctx);
            } catch (err) {
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    }
}
module.exports = phoneController