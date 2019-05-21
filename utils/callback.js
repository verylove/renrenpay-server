let request = require('request')

let callback = (callurl,data)=>{
    return new Promise((resolve,reject)=>{
        request.get({url: callurl+`?orderid=${data.orderid}&appid=${data.appid}&amount=${data.amount}&sign=${data.sign}`},(err, _, body)=>{
            if(err){
                reject();
            }else{
                resolve()
            }
        })
    })
}
let callPost = (callurl,data)=>{
    var options = {
        method: 'POST',
        url: callurl,
        form: {
            sign: data.sign,
            appid:data.appid,
            orderid:data.orderid,
            payway:data.payway,
            amount:data.amount
        },
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        },
        timeout: 50000
    };
    return new Promise((resolve,reject)=>{
        request.post(options,(err, response, body)=>{
            if(err){
                reject();
            }else{
                resolve()
            }
        })
    })
}

module.exports={
    callPost,
    callback
}