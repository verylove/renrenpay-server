const errorCode = require('./errorCode.js')

const codesAndMessages = [
    // 系统相关
    {
        code: errorCode.ERRORCODE_SERVER_INSIDE_ERROR,
        message: '服务器错误'
    },
    {
        code: errorCode.ERRORCODE_DATABASE,
        message: '数据库操作异常'
    },
    {
        code: errorCode.ERRORCODE_MISSING_PARAMS,
        message: '缺少参数'
    },
    {
        code: errorCode.ERRORCODE_INVALID_PARAMS,
        message: '参数验证失败'
    },
    {
        code: errorCode.ERRORCODE_DATA_STORAGE,
        message: '数据保存失败'
    },
    {
        code: errorCode.ERRORCODE_SEND_SMS_FAIED,
        message: '发送短信失败'
    },
    {
        code: errorCode.ERRORCODE_VERIFY_SMS_FAIED,
        message: '验证短信失败'
    },
    {
        code: errorCode.ERRORCODE_SEND_EMAILCODE_FAIED,
        message: '发送邮箱验证码失败'
    },
    {
        code: errorCode.ERRORCODE_VERIFY_EMAILCODE_FAIED,
        message: '验证邮箱验证码失败'
    },
    // 应用相关
    {
        code: errorCode.ERRORCODE_APP_NOT_EXIST,
        message: '应用不存在'
    },
    {
        code: errorCode.ERRORCODE_APP_ALREADY_EXIST,
        message: '应用已存在'
    },
    {
        code: errorCode.ERRORCODE_APP_CREATE_FAIED,
        message: '应用创建失败'
    },
    {
        code: errorCode.ERRORCODE_APP_OVER_LIMIT,
        message: '应用超过上限'
    },
    {
        code: errorCode.ERRORCODE_APP_NO_CALLBACK,
        message: '应用没有回调函数'
    },
    {
        code: errorCode.ERRORCODE_APP_GET_APPINFO_FAIED,
        message: '应用信息获取失败'
    },
    {
        code: errorCode.ERRORCODE_APP_UPDATE_APPINFO_FAIED,
        message: '应用信息更新失败'
    },
    // 用户相关
    {
        code: errorCode.ERRORCODE_USER_NOT_EXIST,
        message: '用户不存在'
    },
    {
        code: errorCode.ERRORCODE_USER_ALREADY_EXIST,
        message: '用户已存在'
    },
    {
        code: errorCode.ERRORCODE_USER_REGISTER_FAIED,
        message: '用户注册失败'
    },
    {
        code: errorCode.ERRORCODE_USER_GET_SALT_FAIED,
        message: '用户取盐失败'
    },
    {
        code: errorCode.ERRORCODE_USER_LOGIN_FAIED,
        message: '用户登录失败'
    },
    {
        code: errorCode.ERRORCODE_USER_LOGOUT_FAIED,
        message: '用户退出失败'
    },
    {
        code: errorCode.ERRORCODE_USER_NOT_ENOUGH_BALANCE,
        message: '用户余额不足'
    },
    {
        code: errorCode.ERRORCODE_USER_INVALID_USERNAME_OR_PASSWORD,
        message: '用户名/邮箱/手机号码或密码不正确'
    },
    {
        code: errorCode.ERRORCODE_USER_INVALID_TOKEN,
        message: '用户Token错误'
    },
    {
        code: errorCode.ERRORCODE_USER_PERMISSION_DENIED,
        message: '用户权限不足'
    },
    {
        code: errorCode.ERRORCODE_USER_INVALID_SIGNATURE,
        message: '用户签名错误'
    },
    {
        code: errorCode.ERRORCODE_USER_GET_USERINFO_FAIED,
        message: '用户信息获取失败'
    },
    {
        code: errorCode.ERRORCODE_USER_UPDATE_USERINFO_FAIED,
        message: '用户信息更新失败'
    },
    {
        code: errorCode.ERRORCODE_USER_DEPOSIT_FAILED,
        message: '用户充值不足'
    },
    {
        code: errorCode.ERRORCODE_USER_WITHDRAW_FAILED,
        message: '用户提现不足'
    },
    {
        code: errorCode.ERRORCODE_USER_RECHARGE_MEMBERSHIP_FAILED,
        message: '用户购买会员失败'
    },
    {
        code:errorCode.ERRORCODE_SIGN_ERROR,
        message:'签名错误'
    },
    {
        code:errorCode.ERRORCODE_APPID_NOT_EXIST,
        message:'appid 不存在'
    },
    {
        code:errorCode.NOT_FIND_PHONE,
        message:'没有发现设备'
    },
    {
        code:errorCode.ERRORCODE_USER_PASSWORD_ERR,
        message:'密码错误'
    },
]

const returnJson = {
    async success(ctx, data) {
        // console.info(`${ctx.url} -- `,data);
        ctx.body = {
            code: 200,
            message: '操作成功',
            data: data,
        }
    },
    err(ctx, code, extra_message, data) {
        let message
        codesAndMessages.filter(item => {
            if (item.code == code) {
                message = item.message
            }
        })
        if (extra_message) {
            message = message + ' (' + extra_message + ')'
        }
        ctx.body = {
            code: code,
            message: message || '',
            data: data || {},
        }
    }
}

module.exports = returnJson
