const mongoose = require('mongoose')
const TestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String },
    questions: { type: Array, default: [] },
    answers: { type: Array, default: [] },
    answersId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer", },
    settings: {
        type: Object,
        default: {
            autoMark: false,
            displayResMark: false,
            ladderMark: 10,
            limitResponse: false,
            limitTime: 0,
            display: "public",
            displayLimit: [],
            randomExam: false,
            userAccess: [],
            displayResult: false,
            webcam: false
        }
    }
}, { timestamps: true })

module.exports = mongoose.model('Test', TestSchema)

