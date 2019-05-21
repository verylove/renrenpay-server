const ErrorCode = require('../utils/errorCode.js')
const returnJson = require('../utils/returnJson.js')
const trades = require('../db/models/trades');
const verifyParams = require('../utils/verifyParams.js')

const tradeController = {
    // 添加系统商品（会员相关）
    addTrade() {
        return async (ctx, next) => {
            try {
                const data = ctx.query;
                const user = ctx.state.user;
                data.userid = user.id;
                if (user.lv < 10) {
                    throw {code: ErrorCode.ERRORCODE_PERMISSIONS_DENIED, message: "权限不足"}
                }
                await verifyParams(data, 'amount', 'day', 'lv', 'userid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                });
                if (data.lv > 3) {
                    throw {code: ErrorCode.ERRORCODE_OVER_LOAD_LIMIT, message: "级别错误"}
                }
                await trades.addTrades(data).then(result => {
                    returnJson.success(ctx, {
                        name: result.name,
                        amount: result.amount,
                        desc: result.desc,
                        day: result.day,
                        tradeid: result.id,
                        lv: result.lv
                    });
                })
            } catch (err) {
                if (err.code) {
                    console.log(err);
                    returnJson.err(ctx, err.code, err);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR);
                }
            }
        }
    },
    // 修改系统商品（会员相关）
    modifyTrade() {
        return async (ctx, next) => {
            try {
                const data = ctx.query;
                const user = ctx.state.user;
                if (user.lv < 10) {
                    throw {code: ErrorCode.ERRORCODE_PERMISSIONS_DENIED, message: "权限不足"}
                }
                await verifyParams(data, 'amount', 'day', 'lv', 'tradeid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                });
                if (data.lv > 3) {
                    throw {code: ErrorCode.ERRORCODE_OVER_LOAD_LIMIT, message: "级别错误"}
                }
                await trades.modifyTrades(data).then(result => {
                    returnJson.success(ctx, result);
                })
            } catch (err) {
                if (err.code) {
                    console.log(err);
                    returnJson.err(ctx, err.code, err);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR);
                }
            }
        }
    },
    // 删除会员商品
    deleteTrade() {
        return async (ctx, next) => {
            try {
                const data = ctx.query;
                const user = ctx.state.user;
                if (user.lv < 10) {
                    throw {code: ErrorCode.ERRORCODE_PERMISSIONS_DENIED, message: "权限不足"}
                }
                await verifyParams(data, 'tradeid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                });
                await trades.deleteTrades(data).then(result => {
                    returnJson.success(ctx, result);
                })
            } catch (err) {
                if (err.code) {
                    console.log(err);
                    returnJson.err(ctx, err.code, err);
                } else {
                    returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR);
                }
            }
        }
    },
    // 查询会员商品列表
    tradeList() {
        return async (ctx, next) => {
            try {
                const data = ctx.query;
                data.page = data.page ? data.page : 1;
                data.page_size = data.page_size ? data.page_size : 10;
                data.start = (data.page - 1) * data.page_size;
                await trades.getTrades(data).then(result => {
                    return returnJson.success(ctx, result);
                })
            } catch (err) {
                console.log(err)
                returnJson.err(ctx, ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR);
            }
        }
    },
    // 制定的会员策略
    tradeInfo() {
        return async (ctx, next) => {
            try {
                const data = ctx.query;
                await verifyParams(data, 'tradeid').then(result => {
                    if (!result) {
                        throw {
                            code: ErrorCode.ERRORCODE_MISSING_PARAMS,
                            message: '或者参数错误'
                        }
                    }
                });
                await trades.getTrades(data).then(result => {
                    returnJson.success(ctx, result);
                })
            } catch (err) {
                if (err.code) {
                    returnJson.err(ctx, err.code, err.message);
                } else {
                    returnJson.err(ctx, err.ERRORCODE_SERVER_INSIDE_ERROR)
                }
            }
        }
    }
};

const md5 = info => {
    const md5 = crypto.createHash('md5')
    md5.update(info)
    return md5.digest('hex')
}

module.exports = tradeController;
