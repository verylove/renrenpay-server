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
const payCode = require('../db/models/payCode.js')
const orders = require('../db/models/orders.js')
const Decimal = require('decimal.js')
const appsController = {
    createApp() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                const uuidv1 = require('uuid/v1')
                data.appid = uuidv1();
                data.appsecret = MD5(data.appid + Date.now()).toUpperCase()

                // 判断参数是否缺少
                await verifyParams(data, 'userid', 'name', 'appid', 'appsecret','pay_userid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 判断应用是否存在
                await apps.chkAppExist(data).then(result => {
                    if (result.count > 0) {
                        throw {
                            code: ErrorCode.ERRORCODE_APP_ALREADY_EXIST
                        }
                    }
                })

                // 获取应用数量
                await apps.getAppCount(data).then(result => {
                    if (result.count > 10) {
                        throw {
                            code: ErrorCode.ERRORCODE_APP_OVER_LIMIT
                        }
                    }
                })

                // 添加应用
                await apps.addApplication(data).then(result => {
                    if (result) {
                        returnJson.success(ctx, result)
                    }
                })
            } catch (err) {
                console.info(`${ctx.url} -- `,err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_APP_CREATE_FAIED)
                }
            }
        }
    },

    getApps() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                data.userid = ctx.state.user.id
                data.page = data.page || 1
                data.page_size = data.page_size || 10
                // 判断参数是否缺少
                await verifyParams(data, 'userid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                // 获取应用列表
                await apps.getApps(data).then(result => {
                    returnJson.success(ctx, result)
                })
            } catch (err) {
                console.info(`${ctx.url} -- `,err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    console.log(err);
                    returnJson.err(ctx, ErrorCode.ERRORCODE_APP_GET_APPINFO_FAIED)
                }
            }
        }
    },

    updateAppInfo() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id

                // 判断参数是否缺少
                await verifyParams(data, 'userid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                
                // 判断应用是否存在
                await apps.chkAppExist2(data).then(result => {
                    if (result.count > 0) {
                        throw {
                            code: ErrorCode.ERRORCODE_APP_ALREADY_EXIST
                        }
                    }
                })
                // 更新应用
                await apps.updateAppInfo(data).then(result => {
                    if (result[0]) {
                        returnJson.success(ctx)
                    } else {
                        throw {
                            code: ErrorCode.ERRORCODE_APP_NAME_REPEAT,
                        }
                    }
                })
            } catch (err) {
                console.info(`${ctx.url} -- `,err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_APP_UPDATE_APPINFO_FAIED)
                }
            }
        }
    },

    deleteApp() {
        return async (ctx, next) => {
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id

                // 判断参数是否缺少
                await verifyParams(data, 'id').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                await apps.deleteApp(data).then(result => {
                    console.info('result', result);
                    returnJson.success(ctx)
                })
            } catch (error) {
                console.info(`${ctx.url} -- `,error)
                if (error.code) {
                    returnJson.err(ctx, error.code, error.message)
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_APP_UPDATE_APPINFO_FAIED)
                }
            }
        }
    },

    //测试成二维码
    testQrcode(socket,event){
        return async (ctx,next)=>{
            try {
                const data = ctx.request.body
                data.userid = ctx.state.user.id
                // 判断参数是否缺少
                await verifyParams(data, 'appid','payway','amount').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })
                await apps.isMeApp(data).then(result=>{
                    if(result.length==0){
                        throw {
                            code: ErrorCode.ERRORCODE_APP_NOT_ME,
                            message: '应用不是本人'
                        }
                    }
                })
                data.amount = parseInt(data.amount * 1);
                let orderid = '_' + new Date().getTime() + Math.random().toString().slice(-6); //订单id
                await redisCli.set('4', 'uu'+orderid, '_' + data.userid, 6 * 60);
                data.orderid = orderid;
                if(data.payway == '2'){
                    
                    data.qrcode = await redisCli.getList("pay_code" + data.userid + data.amount);
                    const row = await payCode.getPayCode(data);
                    await redisCli.set('4', orderid, JSON.stringify({
                        orderid: orderid,
                        userid: data.userid,
                        appid: data.appid,
                        amount:data.amount,
                        payway: 2,
                        test:1
                    }), 5 * 60)
                    if(row){
                        data.pay_code = row.pay_code;
                        data.qrcode = row.qrcode;
                        await redisCli.set('4', data.pay_code, orderid, 5 * 60);
                        await redisCli.push("pay_code" + data.userid + data.amount, data.pay_code, 5 * 60);
                        await payCode.addPayCodeNum(row);
                        await orders.addOrder(data)
                        returnJson.success(ctx, {qrcode:row.qrcode,orderid});
                    }else{
                        let sendMsg = {
                            appid: data.appid,
                            orderid: orderid,
                            payway: data.payway * 1,//1是支付宝，2是微信
                            amount: data.amount,
                        }
                        sendMsg.pay_code = "pay_code" + data.userid + data.amount + Math.random().toString().slice(-8);
                        await redisCli.push("pay_code" + data.userid + data.amount, data.pay_code, 5 * 60);
                        data.pay_code = sendMsg.pay_code;
                        await socket.sendMsg(data.userid, JSON.stringify(sendMsg));
                        let qrcode = await new Promise((resolve,reject)=>{
                            event.once(orderid, function(arg) {
                                resolve(arg);
                            });
                        })
                        data.qrcode = qrcode;
                        await orders.addOrder(data);
                        returnJson.success(ctx, {qrcode,orderid});
                    }
                }else{
                    let pay_userId = '';
                    await redisCli.set('4', orderid, JSON.stringify({
                        orderid: orderid,
                        userid: data.userid,
                        appid: data.appid,
                        amount:data.amount,
                        payway: 1,
                        test:1
                    }), 5 * 60)
                    await apps.allApps({ userid: data.userid}).then(result => {
                        pay_userId = result[0].pay_userid;
                    });
                    let amo = new Decimal(data.amount).div(new Decimal(100)).toNumber();
                    let qrcode = `alipays://platformapi/startapp?appId=09999988&actionType=toAccount&goBack=NO&amount=${amo}&userId=${pay_userId}&memo=${orderid}`;
                    data.qrcode = qrcode;
                    await orders.addOrder(data);
                    returnJson.success(ctx,{qrcode,orderid})
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
    }
}

module.exports = appsController
