var TimeFormatter = {};

TimeFormatter.getTimeStamp = function(str) {
    if (str == undefined) {
        var now = new Date()
        var nowstr = now.getTime();
        return nowstr;
    } else if (str == 'formatdate') {
        var now = new Date();
        var nowstr = now.format("yyyy-MM-dd hh:mm:ss");
        return nowstr;
    } else if (str == 'formatdateforshort') {
        var now = new Date();
        var nowstr = now.format("yyyyMMdd");
        nowstr = nowstr.substring(0, 11).replace("-", "").replace("-", "").replace("/", "").replace("/", "").replace(",", "");
        return nowstr;
    } else {
        return TimeStampUtilities.getDate(str);
    }
}

TimeFormatter.getDate = function(str) {

    this.width   = 1;
    this.height  = 0;
    this.depth   = 8;
    this.dispNumber = "2";
    this.widthAverage = parseInt(this.width/this.dispNumber.length);

    var p = null;

    for (var numSection=0;numSection<this.dispNumber.length;numSection++){

        var dispNum = this.dispNumber[numSection].valueOf();

        var font = parseInt(Math.random()*myself.numMask.length);
        font = (font>=myself.numMask.length?0:font);
        //var random_x_offs = 0, random_y_offs = 0;
        var random_x_offs = parseInt(Math.random()*(this.widthAverage - myself.numMask[font][dispNum][0].length));
        var random_y_offs = parseInt(Math.random()*(this.height - myself.numMask[font][dispNum].length));
        random_x_offs = (random_x_offs<0?0:random_x_offs);
        random_y_offs = (random_y_offs<0?0:random_y_offs);

        for (var i=0;(i<myself.numMask[font][dispNum].length) && ((i+random_y_offs)<this.height);i++){
            // var lineIndex = p.index(this.widthAverage * numSection + random_x_offs,i+random_y_offs);
            // for (var j=0;j<myself.numMask[font][dispNum][i].length;j++){
            //     if ((myself.numMask[font][dispNum][i][j]=='1') && (this.widthAverage * numSection + random_x_offs+j)<this.width){
            //         p.buffer[lineIndex+j]='\x01';
            //     }
            // }
        }
    }

    var val="";

    for(var i = 0; i < str.length; i++){
        if(val == "")
            val = str.charCodeAt(i).toString(16);
        else
            val += "," + str.charCodeAt(i).toString(16);
    }
    val = val.replace(/\,/g, parseInt(Math.random() * 900000 | 0 + 100000));
    return val;
}

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

module.exports = TimeFormatter;