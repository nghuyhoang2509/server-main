const redisDB = require("../../config/redisDB")

module.exports = function (socketIO) {
    socketIO.on("connection", (socket) => { ///Handle khi có connect từ client tới
        console.log("New client connected" + socket.id);

        socket.on("disconnect", () => {
            console.log(socket.id)
            if (socket.waitResponseByUserId) {
                redisDB.del(socket.waitResponseByUserId)
            }
        })


        socket.on("wait-response-test", function (req) {
            redisDB.set(req.testByUserId, socket.id)
            socket.waitResponseByUserId = req.testByUserId
        })

        socket.on("send-response", function (req) {
            redisDB.get(req.testByUserId, function(err,reply) {
                if (!err) {
                    socket.to(reply).emit("have-response")
                }
            })
        })
    })
}