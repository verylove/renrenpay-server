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
const uuidv1 = require('uuid/v1')
const paychecks = require('../db/models/paychecks.js')
const statistic = require('../db/models/statistic.js')


const paychecksController = {
    getList() {//查询收钱列表
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

    statistic() {
        return async (ctx, next) => {
            try {
                const data = ctx.query
                data.userid = ctx.state.user.id
                await verifyParams(data, 'userid', 'startDate', 'endDate').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                })

                let now = new Date();
                data.day = parseInt((now - new Date(now.getFullYear().toString())) / (24 * 60 * 60 * 1000)) + 1;
                data.now = now.format("yyyy-MM-dd");
                let row = {
                    total_count: 0,
                    total_amount: 0,
                    week_list: []
                }
                if (data.endDate >= data.now) {
                    let results = await paychecks.totalAmount(data);
                    let result = {
                        date: data.now,
                        w_count: 0,//微信订单数量
                        p_count: 0,//支付宝订单数量
                        w_total1: 0,//微信已知来源金额总量
                        p_total1: 0,//支付宝已知来源金额总量
                        w_total2: 0,//微信未知来源金额总量
                        p_total2: 0//支付宝未知来源金额总量
                    }
                    results.forEach(item => {
                        if (item.appid && item.payway == '2') {
                            result.w_count++;
                            result.w_total1 += item.amount;
                        }
                        if (item.appid && item.payway == '1') {
                            result.p_count++;
                            result.p_total1 += item.amount;
                        }
                        if (!item.appid && item.payway == '2') {
                            result.w_total2 += item.amount;
                        }
                        if (!item.appid && item.payway == '1') {
                            result.p_total2 += item.amount;
                        }
                    });
                    row.total_count = result.w_count + result.p_count;
                    row.total_amount = result.w_total1 + result.p_total1 + result.w_total2 + result.p_total2;
                    if (data.endDate == data.startDate) {
                        row.week_list.push(result);
                        returnJson.success(ctx, row)
                    } else {
                        let week_list = await statistic.getWeek(data);
                        week_list.forEach(item => {//w_total1,p_total1,w_total2,p_total2
                            row.total_count = row.total_count + item.w_count + item.p_count
                            row.total_amount = row.total_amount + item.w_total1 + item.p_total1 + item.w_total2 + item.p_total2
                            row.week_list.push(item)
                        })
                        row.week_list.push(result);
                        returnJson.success(ctx, row)
                    }
                } else {
                    let week_list = await statistic.getWeek(data);
                    week_list.forEach(item => {//w_total1,p_total1,w_total2,p_total2
                        row.total_count = row.total_count + item.w_count + item.p_count
                        row.total_amount = row.total_amount + item.w_total1 + item.p_total1 + item.w_total2 + item.p_total2
                        row.week_list.push(item)
                    })
                    returnJson.success(ctx, row)
                }
            } catch (err) {
                console.info(`${ctx.url} -- `, err)
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    }
}

module.exports = paychecksController;