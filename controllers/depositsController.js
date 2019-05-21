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
const deposits = require('../db/models/deposits.js')
const users = require('../db/models/users.js')
const orders = require('../db/models/orders.js')
const uuidv1 = require('uuid/v1')
const Decimal = require('decimal.js');
const apps = require('../db/models/apps');
const payCode = require('../db/models/payCode');
const settings = require('../conf/default')
const depositsController = {
    deposit() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                data.action = 'deposit'
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

                // 添加充值记录
                await deposits.addDeposit(data).then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_USER_DEPOSIT_FAILED,
                            message: '添加充值记录错误'
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
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_USER_DEPOSIT_FAILED)
                }
            }
        }
    },
    //通知客户端获取二维码
    qrCode(socket,event) {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id

                // 判断参数是否缺少
                await verifyParams(data, 'payway', 'amount').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                data.amount = parseInt(data.amount * 1);
                let orderid = '_' + new Date().getTime() + Math.random().toString().slice(-6); //订单id
                const sendMsg = {
                    appid: '15c821df1e52',
                    orderid: orderid,
                    payway: parseInt(data.payway), //1是支付宝，2是微信
                    amount: data.amount,
                    order_userid: data.userid
                };
                await redisCli.set('4', 'uu'+orderid, '_' + data.userid, 10 * 60);
                data.orderid = orderid;
                if (data.payway == '2') {
                    data.type = 2;
                    data.qrcode = await redisCli.getList("pay_code" + '1' + data.amount);
                    const row = await payCode.getPayCode({userid:1,amount:data.amount,qrcode:data.qrcode});
                    let order = {
                        qrcode: data.qrcode || '',
                        orderid: orderid,
                        userid: data.userid,
                        appid: sendMsg.appid,
                        amount:data.amount,
                        payway: 2,
                    };
                    await redisCli.set('4', orderid, JSON.stringify(order), 5 * 60)
                    if (row) {
                        data.qrcode = row.qrcode;
                        data.pay_code = row.pay_code;
                        await redisCli.set('4', data.pay_code, orderid, 5 * 60);
                        await redisCli.push("pay_code" + '1' + data.amount, data.pay_code, 5 * 60);
                        await payCode.addPayCodeNum(row);
                        await deposits.addDeposit(data);
                        await orders.addOrder({userid:1,appid:settings.appid,orderid,amount:data.amount,payway:data.payway,qrcode:data.qrcode,pay_code:data.pay_code}).then(result => {
                            returnJson.success(ctx,{qrcode:data.qrcode,orderid})
                        })
                    } else {
                        sendMsg.pay_code = "pay_code" + data.userid + data.amount + Math.random().toString().slice(-6);
                        data.pay_code = sendMsg.pay_code;
                        let c = await redisCli.push("pay_code" + '1' + data.amount, data.pay_code, 5 * 60);
                        await socket.sendMsg('1', JSON.stringify(sendMsg));
                        let qrcode = await new Promise((resolve,reject)=>{
                            return event.once(orderid, function(arg) {
                                resolve(arg);
                            });
                        })
                        data.qrcode = qrcode
                        await deposits.addDeposit(data);
                        await orders.addOrder({userid:1,appid:settings.appid,orderid,amount:data.amount,payway:data.payway,qrcode:data.qrcode,pay_code:data.pay_code}).then(result => {
                            returnJson.success(ctx,{qrcode,orderid})
                        })
                    }
                } else {
                    data.type = 1;
                    let pay_userId = '';
                    let appId = '';
                    await redisCli.set('4', orderid, JSON.stringify({
                        qrcode: data.qrcode,
                        orderid: orderid,
                        userid: data.userid,
                        appid: sendMsg.appid,
                        amount:data.amount,
                        payway: 1,
                    }), 5 * 60)
                    await apps.allApps({ userid: 1}).then(result => {
                        pay_userId = result[0].pay_userid;
                        appId = result[0].appid;
                    });
                    let amo = new Decimal(data.amount).div(new Decimal(100)).toNumber();
                    let qrcode = `alipays://platformapi/startapp?appId=09999988&actionType=toAccount&goBack=NO&amount=${amo}&userId=${pay_userId}&memo=${orderid}`;
                    data.qrcode = qrcode;
                    data.orderid = orderid;
                    await deposits.addDeposit(data);
                    
                    await orders.addOrder({userid:1,appid:settings.appid,orderid,amount:data.amount,payway:data.payway,qrcode:data.qrcode,pay_code:data.pay_code}).then(result => {
                        returnJson.success(ctx,{qrcode:data.qrcode,orderid})
                    })
                    
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
    // 充值，消费记录
    getList() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                data.userid = ctx.state.user.id
                data.page = data.page || 1
                data.page_size = data.page_size || 10
                await verifyParams(data, 'userid').then(result => {//state:状态 1充值，2购买会员，3手续费
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                await deposits.getDepositList(data).then(result => {
                    returnJson.success(ctx, result);
                })
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if(err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    },
    //充值成功回调
    verbCall(socket){
        return async (ctx, next)=>{
            try {
                const data = ctx.query;
                console.info(data,'data1');
                let appid,appsecret;
                await apps.queryApps({userid:'1'}).then(result => { //获取管理员的appid，私钥
                    appid = result[0].appid;
                    appsecret = result[0].appsecret;
                })
                let sign = MD5(appid + data.orderid + MD5(appsecret));
                if(sign != data.sign){
                    throw {
                        code: ErrorCode.ERRORCODE_SIGN_ERROR,
                        message: '签名错误'
                    }
                }
                let uid = await redisCli.get('5', data.orderid);
                await users.updateBalance({action: 'deposit', userid: order.userid, amount: order.amount})
                socket.sendMsg(uid, JSON.stringify({paySuccess: 1, step: '2'}));
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    }
}

module.exports = depositsController
