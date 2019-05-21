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
const orders = require('../db/models/orders.js')
const users = require('../db/models/users.js')
const payCode = require('../db/models/payCode.js')
const deposits = require('../db/models/deposits.js')
const Decimal = require('decimal.js');
const settings = require('../conf/default');
const merchantController = {
    needQrcode(socket, event) { //商户通知我需要二维码
        return async (ctx, next) => {
            try {
                const data = ctx.request.body

                // 判断参数是否缺少
                await verifyParams(data, 'amount', 'payway', 'appid', 'sign').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '缺少参数'
                        }
                    }
                })

                if (!(data.payway == 1 || data.payway == 2)) {
                    throw {
                        code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                        message: '参数错误'
                    }
                }
                let appsecret, userid;
                await apps.queryApps(data).then(result => {
                    if (result.length > 0) {
                        appsecret = result[0].appsecret;
                        userid = result[0].userid;
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_APPID_NOT_EXIST,
                            message: 'appid 不正确'
                        }
                    }
                })
                let sign = MD5(data.appid + MD5(data.amount) + MD5(appsecret));
                console.info(sign);
                if (sign != data.sign) {
                    throw {
                        code: ErrorCode.ERRORCODE_SIGN_ERROR,
                        message: '签名错误'
                    }
                }
                let orderid = '_' + new Date().getTime() + Math.random().toString().slice(-6);//订单id
                data.userid = userid;
                data.orderid = orderid;
                let lv, balance;
                await users.getUser2(data).then(result => {
                    lv = result.dataValues.lv;
                    balance = result.dataValues.balance;
                    console.info(balance, lv);
                })

                if ((lv < 2 && balance < -10)) {
                    throw {
                        code: ErrorCode.ERRORCODE_USER_NOT_ENOUGH_BALANCE,
                        message: '用户余额不足'
                    }
                }
                let expenses = 0;
                if (lv == 1) { //支付手续费
                    expenses = parseInt(new Decimal(data.amount).mul(new Decimal(0.01)).toNumber());
                    await users.updateBalance({
                        amount: new Decimal(data.amount).mul(new Decimal(0.01)).toString(),
                        action: 'trans',
                        userid
                    })
                }
                if (lv == 0) {//等级v0
                    expenses = parseInt(new Decimal(data.amount).mul(new Decimal(0.05)).toNumber());
                    await users.updateBalance({
                        amount: new Decimal(data.amount).mul(new Decimal(0.05)).toString(),
                        action: 'trans',
                        userid
                    })
                }
                if (expenses > 0) {
                    await deposits.addDeposit({
                        userid: data.userid,
                        orderid,
                        type: 0,
                        amount: expenses,
                        memo: data.memo,
                        status: 1
                    });
                }
                const sendMsg = {
                    appid: data.appid,
                    orderid: orderid,
                    payway: data.payway * 1,//1是支付宝，2是微信
                    amount: data.amount,
                    pay_code: data.pay_code
                };
                if (data.payway == '2') {//微信
                    data.qrcode = await redisCli.getList("pay_code" + data.userid + data.amount);
                    const row = await payCode.getPayCode(data);
                    await redisCli.set('4', orderid, JSON.stringify({
                        qrcode: data.qrcode,
                        orderid: orderid,
                        userid: data.userid,
                        appid: sendMsg.appid,
                        amount: data.amount,
                        payway: 2,
                    }), 5 * 60)
                    if (row) {
                        data.pay_code = row.pay_code;
                        await redisCli.set('4', data.pay_code, orderid, 5 * 60);
                        await redisCli.push("pay_code" + data.userid + data.amount, data.pay_code, 5 * 60);
                        await payCode.addPayCodeNum(row);

                        data.qrcode = row.qrcode;
                        await orders.addOrder(data)
                        returnJson.success(ctx, {qrcode: row.qrcode, orderid});
                    } else {
                        sendMsg.pay_code = "pay_code" + data.userid + data.amount + Math.random().toString().slice(-6);
                        await redisCli.push("pay_code" + data.userid + data.amount, data.pay_code, 5 * 60);
                        data.pay_code = sendMsg.pay_code;
                        await socket.sendMsg(data.userid, JSON.stringify(sendMsg));
                        let qrcode = await new Promise((resolve, reject) => {
                            event.once(orderid, function (arg) {
                                resolve(arg);
                            });
                        })
                        data.qrcode = qrcode;
                        await orders.addOrder(data);
                        returnJson.success(ctx, {qrcode, orderid});
                    }
                } else {
                    let pay_userId = '';
                    await redisCli.set('4', orderid, JSON.stringify({
                        qrcode: data.qrcode,
                        orderid: orderid,
                        userid: data.userid,
                        appid: sendMsg.appid,
                        amount: data.amount,
                        payway: 1,
                    }), 5 * 60)
                    await apps.allApps({userid: data.userid}).then(result => {
                        pay_userId = result[0].pay_userid;
                    });
                    let amo = new Decimal(data.amount).div(new Decimal(100)).toNumber();
                    let qrcode = `alipays://platformapi/startapp?appId=09999988&actionType=toAccount&goBack=NO&amount=${amo}&userId=${pay_userId}&memo=${orderid}`;
                    data.orderid = orderid;
                    await orders.addOrder(data);
                    returnJson.success(ctx, {qrcode, orderid})
                }
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
    test(socket, event) {
        return async (ctx, next) => {
            try {
                const data = JSON.parse(ctx.request.body)
                // 判断参数是否缺少
                await verifyParams(data, 'amount', 'payway').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                let orderid = '_' + new Date().getTime() + Math.random().toString().slice(-6);//订单id
                data.userid = '1';
                data.appid = settings.appid
                data.orderid = orderid;
                if (data.payway == '2') {
                    data.qrcode = await redisCli.getList("pay_code" + data.userid + data.amount);
                    const row = await payCode.getPayCode(data);
                    await redisCli.set('4', orderid, JSON.stringify({
                        qrcode: data.qrcode,
                        orderid: orderid,
                        userid: data.userid,
                        appid: data.appid,
                        amount: data.amount,
                        payway: 2,
                        test: 2
                    }), 10 * 60)
                    if (row) {
                        data.pay_code = row.pay_code;
                        await redisCli.set('4', data.pay_code, orderid, 5 * 60);
                        await redisCli.push("pay_code" + data.userid + data.amount, data.pay_code, 5 * 60);
                        await payCode.addPayCodeNum(row);
                        data.qrcode = row.qrcode;
                        await orders.addOrder(data)
                        returnJson.success(ctx, {qrcode: row.qrcode, orderid});
                    } else {
                        const sendMsg = {
                            appid: data.appid,
                            orderid: orderid,
                            payway: data.payway * 1,//1是支付宝，2是微信
                            amount: data.amount
                        };
                        sendMsg.pay_code = "pay_code" + data.userid + data.amount + Math.random().toString().slice(-6);
                        await redisCli.push("pay_code" + data.userid + data.amount, data.pay_code, 5 * 60);
                        data.pay_code = sendMsg.pay_code;
                        await socket.sendMsg(data.userid, JSON.stringify(sendMsg));
                        let qrcode = await new Promise((resolve, reject) => {
                            event.once(orderid, function (arg) {
                                resolve(arg);
                            });
                        })
                        data.qrcode = qrcode;
                        await orders.addOrder(data);
                        returnJson.success(ctx, {qrcode, orderid});
                    }
                } else {
                    let pay_userId = '';
                    await redisCli.set('4', orderid, JSON.stringify({
                        qrcode: data.qrcode,
                        orderid: orderid,
                        userid: data.userid,
                        appid: data.appid,
                        amount: data.amount,
                        payway: 1,
                        test: 2
                    }), 10 * 60)
                    await apps.allApps({userid: data.userid}).then(result => {
                        pay_userId = result[0].pay_userid;
                    });
                    let amo = new Decimal(data.amount).div(new Decimal(100)).toNumber();
                    let qrcode = `alipays://platformapi/startapp?appId=09999988&actionType=toAccount&goBack=NO&amount=${amo}&userId=${pay_userId}&memo=${orderid}`;
                    data.orderid = orderid;
                    await orders.addOrder(data);
                    returnJson.success(ctx, {qrcode, orderid})
                }
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

    receive(event) {
        return async (ctx, next) => {
            try {
                const data = ctx.query;
                verifyParams(data, "orderid").then(res => {
                    if (!res)
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                        }
                });
                event.emit(data.orderid, true);
                returnJson.success(ctx);
            } catch (err) {
                if (err.code) {
                    returnJson.err(ctx, err.code);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR);
                }
            }
        }
    },

    offical() {
        return async (ctx, next) => {
            await ctx.render('index.html', {})
        }
    }
}

module.exports = merchantController