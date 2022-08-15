const siteRouter = require('./site')
const authRouter = require('./auth')
const testRouter = require('./test')

function route(app) {

    app.use('/auth', authRouter)

    app.use('/admin/test', testRouter)

    app.use('/', siteRouter)


}

module.exports = route