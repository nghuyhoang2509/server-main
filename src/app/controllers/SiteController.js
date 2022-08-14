const jwtUtil = require('../util/jwt')
class SiteController{

    //[GET] /
    async index(req,res,next){
            return res.json({hello:"hole"}) 
    }


}

module.exports = new SiteController