
const Koa = require('koa');
const app = new Koa();
const debug = require('debug')('koa-weapp-demo');
const response = require('./middlewares/response');
const bodyParser = require('koa-bodyparser');
const config = require('./config');
const port = 5757;

//require('./tools/initdb.js')

// response middle ware
app.use(response);

// parse body
app.use(bodyParser());

const router = require('./routes');
app.use(router.routes());

// 启动程序，监听端口

app.listen(config.port, () => debug(`listening on port ${config.port}`));
