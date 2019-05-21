const SMS = require('@alicloud/sms-sdk')

/**
 * 短信相关
 * */
const accessKeyId = 'accessKeyId'
const secretAccessKey = 'secretAccessKey'
const sign_name = 'sign_name'

const tp1 = 'tp1' // 注册模板

const sendSms = async (mobile_phone, code, type) => {
    let cli = new SMS({accessKeyId, secretAccessKey})

    try {
        cli.sendSMS({
            PhoneNumbers: mobile_phone, //必填:待发送手机号。支持以逗号分隔的形式进行批量调用，批量上限为1000个手机号码,批量调用相对于单条调用及时性稍有延迟,验证码类型的短信推荐使用单条调用的方式；发送国际/港澳台消息时，接收号码格式为00+国际区号+号码，如“0085200000000”
            SignName: sign_name, //必填:短信签名-可在短信控制台中找到
            TemplateCode: tp1, //必填:短信模板-可在短信控制台中找到，发送国际/港澳台消息时，请使用国际/港澳台短信模版
            TemplateParam: `{"code": "${code}"}` //可选:模板中的变量替换JSON串,如模板内容为"亲爱的${name},您的验证码为${code}"时。
        }).then(res => {
            let {Code} = res
            if (Code === 'OK') {
                return true
            } else {
                return false
            }
        })
        return true
    } catch (err) {
        console.info(err,'error');
    }
}

module.exports = sendSms

