const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    mail: { type: String, trim: true, unique: true, required: true},
    username: { type: String, trim: true, unique: true, required: true},
    password: { type: String, required: true, trim: true},
    fullname: { type: String, required: true },
    refreshToken: { type: String, default: ''},
    resetPassToken: { type: String },
    expiresResetPass: { type: Date },
    sessionLoginId: { type: String, required: true}
},{ timestamps: true})

module.exports = mongoose.model('User', UserSchema)