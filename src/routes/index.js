const siteRouter = require('./site')
const authRouter = require('./auth')
const testRouter = require('./test')

function route(app) {
    app.all('/', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next()
      });

    app.use('/auth', authRouter)

    app.use('/admin/test', testRouter)

    app.use('/', siteRouter)


}

module.exports = route