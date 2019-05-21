const Mailer = require('nodemailer')

// 邮箱服务
const host = '';
const port = 80;
const user = '';
const pass = '';

const sendEmail = async (email, code, type) => {
    const transport = Mailer.createTransport({
        host:host, // 服务
        port:port, // smtp端口
        secureConnection: true, // 使用ssl
        auth: {
            user,
            pass
        }
    })

    try {
        let html1 = `<p>欢迎使用人人收付平台，您本次注册的验证码为</p><p>您的验证码是：<strong style="color: #ff4e2a;">${code}</strong></p><p>请将以上验证码输入注册页面中的验证码输入框内以完成注册；</p><p>如非本人操作，请忽略</p>`;//注册

        transport.sendMail({
            from: user, // 发件邮箱
            to: email, // 收件列表
            subject: '来自人人收付平台的邮件', // 标题
            //  text:'ass',
            html: html1 // html 内容
        }, function (err, data) {
            if (err) {
                console.info(err,'error');
            }
            transport.close(); // 如果没用，关闭连接池
        })

        return true
    } catch (err) {
        console.info(err,'error');
    }
}

module.exports = sendEmail

