const jwtUtil = require('../jwt')

module.exports = async function verifyAuth(req, res, next) {
    try {
        const accessToken = req.signedCookies['access']
        await jwtUtil.verifyToken(accessToken, process.env.secret)
        next()
    }catch(err){
        return res.json({ success: false, message: "Xác thực không thành công"})
    }

}