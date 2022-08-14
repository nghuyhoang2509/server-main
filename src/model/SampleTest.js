const mongoose = require('mongoose')
const SampleTest = new mongoose.Schema({
    title: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String },
    questions: { type: Array, default: [] },
    answers: { type: Array, default: [] },
}, { timestamps: true })

module.exports = mongoose.model('SampleTest', SampleTest)

