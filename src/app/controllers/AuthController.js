const User = require('../../model/User');
const jwtUtil = require('../util/jwt');
const argon2 = require('argon2');
const redisDB = require('../../config/redisDB')
const transporter = require("../../config/nodemailer");
var randomId = require('random-id');


class AuthController {

    //[POST] /auth/login
    //Public
    async login(req, res, next) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ username })
            if (!user) {
                return res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' })
            }
            const verify = await argon2.verify(user.password, password)
            if (!verify) {
                return res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' })
            }
            const accessTokenSecret = process.env.secret
            const accessRefreshSecret = process.env.secretRefresh
            const refreshTokenLife = process.env.tokenRefreshLife
            const tokenLife = process.env.tokenLife
            const accessToken = await jwtUtil.generateToken({ username: user.username }, accessTokenSecret, tokenLife)
            const refreshToken = await jwtUtil.generateToken({ username: user.username }, accessRefreshSecret, refreshTokenLife)
            res.cookie('access', accessToken, { signed: true, httpOnly: true, expires: new Date(Date.now() + 2592000000), sameSite: "none", secure: true })
            res.cookie("SSID", user.sessionLoginId, { signed: true, httpOnly: true, expires: new Date(Date.now() + 2592000000), sameSite: "none", secure: true })
            user.refreshToken = refreshToken
            await user.save()
            return res.json({
                success: true,
                message: 'Đăng nhập thành công',
                info: {
                    username: user.username,
                    id: user._id,
                    fullname: user.fullname,
                    mail: user.mail,
                }
            })
        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: "có lỗi xảy ra" })
        }
    }

    async forgotPassword(req, res, next) {
        try {

            const { mail } = req.body
            const user = await User.findOne({ mail })
            if (!user) {
                return res.send(`<div><h3>Hãy kiểm tra email của bạn</h3><a href="${process.env.host}">Trang chủ</a></div>`)

            }
            const token = randomId(20, "aA0")
            user.resetPassToken = token
            user.expiresResetPass = Date.now() + 900000
            await user.save()
            let mainOptions = { // thiết lập đối tượng, nội dung gửi mail
                from: 'infotestmaker55@gmail.com',
                to: mail,
                subject: 'Reset Password',
                text: '',
                html: `<div><h3>Nếu bạn có yêu cầu reset mật khẩu thì hãy nhấn vào link bên dưới, còn không thì hãy bỏ qua</h3><a style="display: block" href="${process.env.myhost}/auth/reset/${user._id}-${token}">Reset password</a><i>Hiệu lực 15 phút</i></div>`
            }
            await transporter.sendMail(mainOptions)
            return res.send(`<div><h3>Hãy kiểm tra email của bạn</h3><a href='${process.env.host}'>Trang chủ</a></div>`)

        } catch (e) {
            console.log(e)
            return res.send(`<div><h3>Hãy kiểm tra email của bạn</h3><a href='${process.env.host}'>Trang chủ</a></div>`)
        }
    }

    async resetPassword(req, res, next) {
        try {
            const token = req.params.token
            const tokenArr = token.split('-')
            const user = await User.findById(tokenArr[0])
            if (user.resetPassToken !== tokenArr[1] || user.expiresResetPass < Date.now()) {
                return res.send("<h3>Có lỗi xãy ra</h3>")
            }
            const htmlPageReset = `
                <div style="width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center">
                    <form method="post" action="">
                        <input style="display:block; padding: 10px; margin:20px 0px; height: 40px; width: 70vw; border:2px solid black;" type="text" name="password" placeholder="Đặt mật khẩu mới"/>
                        <button style="height: 35px; width: 100px; background-color: #4285f4; color: white; border: none" type="submit">Xác nhận</button>
                    </form>
                </div>
            `
            res.send(htmlPageReset)

        } catch (e) {
            console.log(e)
            return res.send("<h3>Có lỗi xãy ra</h3>")
        }
    }

    async resetPasswordPost(req, res, next) {
        try {
            const token = req.params.token
            const { password } = req.body
            const tokenArr = token.split('-')
            const user = await User.findById(tokenArr[0])
            if (user.resetPassToken !== tokenArr[1] || user.expiresResetPass < Date.now()) {
                return res.send("<h3>Có lỗi xãy ra</h3>")
            }
            const passwordHash = await argon2.hash(password, {
                type: argon2.argon2id
            })
            user.password = passwordHash
            user.sessionLoginId = await randomId(20, "aA0")
            await user.save()
            return res.send("<h1>Đổi mật khẩu thành công</h1>")
        }
        catch (e) {
            console.log(e)
            return res.send("<h3>Có lỗi xãy ra</h3>")
        }
    }

    //[POST] /auth/signup
    //Public
    async signup(req, res, next) {
        try {

            const { password, mail, username, fullname, key } = req.body
            if (key) {
                const getDataRedis = new Promise((resolve) => {
                    redisDB.get(mail, function (err, result) {
                        if (!result) {
                            resolve(null)
                        } else {
                            resolve(result)
                        }
                    })
                })
                const keyRedis = await getDataRedis
                if (!keyRedis) {
                    return res.json({ success: false, message: 'Mã xác nhận hết hạn' })
                }
                if (keyRedis === key) {
                    const passwordHash = await argon2.hash(password, {
                        type: argon2.argon2id
                    })
                    const sessionLoginId = await randomId(20, "aA0")
                    const userCreate = await User.create({ username, password: passwordHash, mail, fullname, sessionLoginId })
                    if (userCreate) {
                        return res.json({ success: true, message: "Đăng ký thành công" })
                    } else {
                        return res.json({ success: false, message: "Có lỗi xảy ra vui lòng thử lại" })
                    }

                } else {
                    return res.json({ success: false, message: "Mã xác nhận không chính xác" })
                }
            } else {
                if (await User.findOne({ username })) {
                    return res.json({ success: false, message: "Tên đăng nhập đã tồn tại" })
                }
                if (await User.findOne({ mail })) {
                    return res.json({ success: false, message: "Mail đã được đăng ký" })
                }
                const key = await Math.floor(Math.random() * 1000000).toString()
                await redisDB.setex(mail, 180, key)
                let mainOptions = { // thiết lập đối tượng, nội dung gửi mail
                    from: 'infotestmaker55@gmail.com',
                    to: mail,
                    subject: 'Verify account',
                    text: '',
                    html: '<div><h2>Bạn vui lòng không chia sẻ mã xác nhận này cho bất kì ai, Nếu bạn không yêu cầu gửi mã thì hãy bỏ qua</h2><h3>Mã xác nhận của bạn: ' + key + '</h3><i>Có hiệu lực trong 3 phút</i></div>'
                }
                const result = await transporter.sendMail(mainOptions)
                if (result) {
                    return res.json({ success: true, message: "Gửi mã xác nhận thành công kiểm tra email của bạn", data: { username, password, mail, fullname } })
                } else {
                    return res.json({ success: false, message: "Có lỗi xảy ra vui lòng thử lại" })
                }
            }
        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: "Có lỗi xảy ra vui lòng thử lại" })
        }

    }


    //[GET] /auth/logout
    //Public
    async logout(req, res, next) {
        try {
            res.clearCookie("access", { path: '/' })
            res.clearCookie("SSID", { path: '/' })
            return res.json({ success: true, message: "logout thành công" })
        }
        catch (error) {
            console.log(error)
            return res.json({ success: false, message: error })
        }
    }

    //[GET] /auth/change-info
    //Public
    async changeInfo(req, res, next) {
        try {
            const { password, passwordNew, fullname, id } = req.body
            const user = await User.findById(id)
            if (password) {
                const verify = await argon2.verify(user.password, password)
                if (!verify) {
                    return res.json({ success: false, message: 'Sai mật khẩu' })
                }

                if (passwordNew.length < 8 || passwordNew.length > 24 || passwordNew.includes(" ")) {
                    return res.json({ success: false, message: 'Nhập mật khẩu tối thiểu 8 và tối đa 24 kí tự, không có khoảng trắng.' })

                }
                if (verify) {
                    const passwordHash = await argon2.hash(passwordNew, {
                        type: argon2.argon2id
                    })
                    user.password = passwordHash
                    const SSID = await randomId(20, "aA0")
                    user.sessionLoginId = SSID
                    await user.save()
                    res.cookie("SSID", SSID, { signed: true, httpOnly: true, expires: new Date(Date.now() + 2592000000)})
                    return res.json({ success: true, message: 'Đổi mật khẩu thành công' })
                }
            }
            if (fullname) {
                user.fullname = fullname
                await user.save()
                return res.json({ success: true, message: 'Đổi tên thành công' })
            }

        }
        catch (error) {
            console.log(error)
            return res.json({ success: false, message: 'Có lỗi xảy ra vui lòng thử lại' })
        }
    }


    //[GET] /auth
    //public
    async auth(req, res, next) {
        try {
            const accessTokenSecret = process.env.secret
            const accessRefreshSecret = process.env.secretRefresh
            const refreshTokenLife = process.env.tokenRefreshLife
            const tokenLife = process.env.tokenLife
            const tokenFromClient = req.signedCookies['access']
            const SSID = req.signedCookies['SSID']

            if (!tokenFromClient) {
                return res.json({ success: false, message: "không tìm thấy hoặc token không hợp lệ" })
            }
            const expNow = Math.floor(Date.now() / 1000)
            const decoded = await jwtUtil.verifyToken(tokenFromClient, accessTokenSecret, { ignoreExpiration: true })
            const user = await User.findOne({ username: decoded.data.username })
            if (SSID !== user.sessionLoginId) {
                return res.json({ success: false, message: "Đăng nhập không thành công" })
            }
            if (decoded.exp > expNow) {
                return res.json({
                    success: true,
                    message: "đăng nhập thành công",
                    info: {
                        username: user.username,
                        id: user._id,
                        fullname: user.fullname,
                        mail: user.mail
                    }
                })
            }
            await jwtUtil.verifyToken(user.refreshToken, accessRefreshSecret)
            const accessToken = await jwtUtil.generateToken({ username: decoded.data.username }, accessTokenSecret, tokenLife)
            const refreshToken = await jwtUtil.generateToken({ username: decoded.data.username }, accessRefreshSecret, refreshTokenLife)
            res.cookie('access', accessToken, { signed: true, httpOnly: true, expires: new Date(Date.now() + 2592000000) })
            res.cookie('SSID', SSID, { signed: true, httpOnly: true, expires: new Date(Date.now() + 2592000000) })
            user.refreshToken = refreshToken
            await user.save()
            return res.json({
                success: true,
                message: "đăng nhập thành công",
                info: {
                    username: user.username,
                    id: user._id,
                    fullname: user.fullname,
                    mail: user.mail
                }
            })

        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: "không tìm thấy hoặc token không hợp lệ" })
        }
    }
}

module.exports = new AuthController