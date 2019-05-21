# 利用xposed框架监听支付宝微信的收付款服务端
安卓端地址：https://github.com/cxyxxx0924/renrenpay-android.git
## 说明
服务端和客户端需要配合使用，不然客户端都无法打开

## 安装步骤
``` 
git clone https://github.com/cxyxxx0924/renrenpay-server.git
cd renrenpay-server
npm i
下载redis
下载mysql
修改./conf/default.js下的user和password为mysql的用户名和密码
添加 数据库：db_renrenpay
运行 bin/www 既可以运行项目
```
