/*
 * @Author: hechao 
 * @Date: 2019-04-01 16:46:36 
 * @describe: 定时任务，跑统计结果
 */

const {
    sqlTable,sequelize
} = require('../db/index.js')
const Sequelize = require('sequelize')
const schedule = require('node-schedule');

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                    //月份
        "d+": this.getDate(),                         //日
        "h+": this.getHours(),                        //小时
        "m+": this.getMinutes(),                      //分
        "s+": this.getSeconds(),                      //秒
        "q+": Math.floor((this.getMonth() + 3) / 3),  //季度
        "S": this.getMilliseconds()                   //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
//今日统计更新
async function day_statistic(){
    // setInterval(()=>{
            try {
                let now = new Date();
                let date = now.format("yyyy-MM-dd");
                let day =parseInt(( now - new Date(now.getFullYear().toString()))/(24*60*60*1000))+1;
                let result = await sequelize.query(`select * from paychecks where dayofyear(createdAt)=?`,{
                    type: Sequelize.QueryTypes.SELECT,
                    replacements:[day]
                })
                let obj={}
                result.forEach(item => {
                    if(obj[item['userid']] || (obj[item['userid']] = [])) {
                        obj[item['userid']].push(item)
                    }
                });
                console.info(obj)
                for(var p in obj){
                    let w_count=0,p_count=0,w_total1=0,p_total1=0,w_total2=0,p_total2=0;//微信订单数量，支付宝订单数量，微信已知来源收款总额..
                    obj[p].forEach(item=>{
                        if(item.appid && item.payway == 1){
                            p_count++;
                            p_total1+=item.amount;
                        }
                        if(item.appid && item.payway == 2){
                            w_count++;
                            w_total1+=item.amount;
                        }
                        if(!item.appid && item.payway == 1){
                            p_total2+=item.amount;
                        }
                        if(!item.appid && item.payway == 2){
                            w_total2+=item.amount;
                        }
                    })
                    let statistics =  await sequelize.query(`select id from statistic where userid=? and date=?`,{
                        type: Sequelize.QueryTypes.SELECT,
                        replacements:[p,date]
                    })
                    if(statistics.length>0){
                        await sequelize.query(`update statistic set w_count=?,p_count=?,w_total1=?,p_total1=?,
                        w_total2=?,p_total2=? where userid=? and date=?`,{
                            type: Sequelize.QueryTypes.UPDATE,
                            replacements:[w_count,p_count,w_total1,p_total1,w_total2,p_total2,p,date]
                        })
                    }else{
                        await sqlTable.statistic.create({
                            userid:p,
                            w_count,
                            p_count,
                            w_total1,
                            p_total1,
                            w_total2,
                            p_total2,
                            date
                        })
                    }
                }
            } catch (error) {
                console.info('error----->',error)
            }
        
    // },10000)


}

//昨天统计
async function yesterday_statistic(){
    try {
        let now = new Date();
        // let date = now.format("yyyy-MM-dd");
        let yesterday = new Date(now.getTime()-24*60*60*1000);
        let day =parseInt(( yesterday - new Date(yesterday.getFullYear().toString()))/(24*60*60*1000))+1;
        let date= yesterday.format("yyyy-MM-dd")
        let result = await sequelize.query(`select * from paychecks where dayofyear(createdAt)=?`,{
            type: Sequelize.QueryTypes.SELECT,
            replacements:[day]
        })
        let users = await sequelize.query(`select id from users`,{
            type: Sequelize.QueryTypes.SELECT,
        })
        let obj={}
        users.forEach(item=>{
            obj[item['id']]=[]
        })
        result.forEach(item => {
            if(obj[item['userid']] || (obj[item['userid']] = [])) {
                obj[item['userid']].push(item)
            }
        });
        console.info(obj)
        for(var p in obj){
            let w_count=0,p_count=0,w_total1=0,p_total1=0,w_total2=0,p_total2=0;//微信订单数量，支付宝订单数量，微信已知来源收款总额..
            obj[p].forEach(item=>{
                if(item.appid && item.payway == 1){
                    p_count++;
                    p_total1+=item.amount;
                }
                if(item.appid && item.payway == 2){
                    w_count++;
                    w_total1+=item.amount;
                }
                if(!item.appid && item.payway == 1){
                    p_total2+=item.amount;
                }
                if(!item.appid && item.payway == 2){
                    w_total2+=item.amount;
                }
            })
            let statistics =  await sequelize.query(`select id from statistic where userid=? and date=?`,{
                type: Sequelize.QueryTypes.SELECT,
                replacements:[p,date]
            })
            if(statistics.length>0){
                await sequelize.query(`update statistic set w_count=?,p_count=?,w_total1=?,p_total1=?,
                w_total2=?,p_total2=? where userid=? and date=?`,{
                    type: Sequelize.QueryTypes.UPDATE,
                    replacements:[w_count,p_count,w_total1,p_total1,w_total2,p_total2,p,date]
                })
            }else{
                await sqlTable.statistic.create({
                    userid:p,
                    w_count,
                    p_count,
                    w_total1,
                    p_total1,
                    w_total2,
                    p_total2,
                    date
                })
            }
        }
    } catch (error) {
        console.info('err---->=',error)
    }
}


function scheduleCronstyle(){
    // yesterday_statistic();
    // day_statistic()
    schedule.scheduleJob('0 0 10 * * *', yesterday_statistic); 
    // schedule.scheduleJob('0 5 * * * *', day_statistic);
}
module.exports={
    scheduleCronstyle
}