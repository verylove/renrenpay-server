const Koa = require('koa')
const app = new Koa()
const router = require('koa-simple-router')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa-cors')
const errorHandler = require('./utils/errorHandler.js')
const controllers = require('./controllers/index.js');
let websocket = require('./utils/websocket.js');
const events = require('events'); 
let event = new events.EventEmitter();
require('./utils/statistic.js').scheduleCronstyle()
let socket = new websocket();

require('./db/index.js')
require('./init');
// error handler
onerror(app)

// middlewares
app.use(cors())
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public/dist'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start

  if ((/\/api\/*/).test(ctx.url)){
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    // await next()
    // return
}

})


// error handler
errorHandler.error(app)
// routers
controllers.getAllRouters(app, router,socket,event)

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
