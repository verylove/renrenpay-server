const appsController = require('./appsController.js')
const depositsController = require('./depositsController.js')
const usersController = require('./usersController.js')
const withdrawsController = require('./withdrawsController.js')
const phoneController = require('./phoneController.js')
const merchantController = require('./merchantController.js')
const tradeController = require('./tradeController.js');
const ordersController = require('./ordersController.js')
const paychecksController = require('./paychecksController.js')
const init = {
    getAllRouters(app, router, socket, event) {
        app.use(router(_ => {
            // 应用相关
            _.post('/api/apps/create', appsController.createApp())
            _.get('/api/apps/list', appsController.getApps()) //查询app
            _.post('/api/apps/update_appinfo', appsController.updateAppInfo()) //修改应用
            _.post('/api/apps/delete_app', appsController.deleteApp()) //删除应用
            _.post('/api/apps/test', appsController.testQrcode(socket, event))//应用


            // 充值相关
            _.post('/api/deposits/deposit', depositsController.deposit())
            _.post('/api/deposits/qrcode', depositsController.qrCode(socket, event)) //获取二维码
            _.get('/api/deposits/list', depositsController.getList())

            // 用户相关
            _.post('/api/users/register', usersController.register()) //注册
            _.get('/api/users/salt', usersController.getSalt()) //获取盐
            _.post('/api/users/login', usersController.login()) //登陆
            _.get('/api/users/logout', usersController.logout()) //登出
            _.get('/api/users/userinfo', usersController.getUserInfo()) //获取用信息
            _.post('/api/users/update_userinfo', usersController.updateUserInfo()) //修改用户信息
            _.post('/api/users/recharge_membership', usersController.rechargeMembership()) //购买会员
            _.get('/api/users/sms', usersController.sendSms1())
            _.get('/api/users/email', usersController.sendEmail1())
            _.post('/api/users/update_pwd', usersController.updatePwd())
            _.post('/api/users/forget', usersController.forgetPassword())

            // 会员应用相关
            _.post('/api/trade/create', tradeController.addTrade()); //添加会员策略
            _.post('/api/trade/modify', tradeController.modifyTrade()); // 修改会员策略
            _.get('/api/trade/delete', tradeController.deleteTrade()); // 删除会员策略
            _.get('/api/trade/list', tradeController.tradeList());  //购买会员列表
            _.get('/api/trade/info', tradeController.tradeInfo());  //查询制定id的会员策略

            // 提现相关
            // _.post('/api/withdraws/withdraw', withdrawsController.withdraw())
            // 订单相关
            _.get('/api/orders/list', ordersController.getList());//订单查询
            _.get('/api/orders/detail', ordersController.getDetail());//订单详情
            _.get('/api/paychecks/list', paychecksController.getList());//收钱来源
            _.get('/api/paychecks/statistic', paychecksController.statistic());
            // 支付记录相关

            //手机端相关
            _.post('/api2/phone/login', phoneController.login2());//app端登陆
            _.post('/api2/phone/get_qrcode', phoneController.sendQrcode(socket, event));//告诉我生成的二维码
            _.post('/api2/phone/query_app', phoneController.queryApp());//获取app列表
            _.post('/api2/phone/pay_success', phoneController.paySuccess(socket, event));//通知我支付成功
            _.get('/api2/phone/paychecks_list', phoneController.paychecks_list());
            _.post('/api2/phone/clear_wx', phoneController.clear_wx());
            _.post('/api2/phone/set_logs', phoneController.setLogs())
            _.post('/api2/phone/query_logs', phoneController.queryLogs())

            //商户相关
            _.post('/api3/needQrcode', merchantController.needQrcode(socket, event));//通知我需要生成二维码
            _.post('/api3/test', merchantController.test(socket, event));//通知我需要生成二维码
            _.post('/api3/receive', merchantController.receive(event)); //商户收到支付成功通知

            _.get('/', merchantController.offical());
        }))
    },
}

module.exports = init
