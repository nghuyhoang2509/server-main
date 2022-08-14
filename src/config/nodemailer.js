const nodemailer = require("nodemailer");
var transporter =  nodemailer.createTransport({ // config mail server
    host: '192.168.1.5:5000',
    port: 465,
    secure: true,
    service: 'Gmail',
    auth: {
        user: 'infotestmaker55@gmail.com',
        pass: 'HuyHoangVVK2509#'
    }
});

module.exports = transporter