const mongoose = require('mongoose')


const AnswerSchema = new mongoose.Schema({
    answers: { type: Array, required: true, default:[] },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
    count: { type: Number, default: 0}
},{ timestamps: true })

module.exports = mongoose.model('Answer', AnswerSchema)