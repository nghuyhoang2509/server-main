const redis = require("redis")
const redisDB = redis.createClient({
  url: 'redis://default:8f6oBHWPxShPpHNELeUT@containers-us-west-57.railway.app:6750'
});

module.exports = redisDB
