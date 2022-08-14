const Test = require("../../model/Test")
const User = require("../../model/User")
const Answer = require("../../model/Answer")
const mammoth = require("mammoth");
const wmf2png = require("wmf2png")

class TestController {

    //[POST] /admin/test/category/
    //private
    async category(req, res, next) {
        try {
            const user = req.body.info
            const test = await Test.find({ userId: user.id }).sort({ updatedAt: -1 })
            if (test.length === 0) {
                return res.json({ success: true, message: "không có dữ liệu", data: [] })
            }
            return res.json({ success: true, message: "lấy data thành công", data: test })
        } catch (error) {
            return res.json({ success: false, message: error })
        }
    }
    //[POST] /admin/test/create
    async create(req, res, next) {
        try {
            const test = req.body.test
            const id = req.body.id
            var testNew = await Test.create({
                ...test,
                userId: id,
            })
            const answers = await Answer.create({
                testId: testNew._id,
                userId: id
            })
            testNew.answersId = answers._id
            answers.testId = testNew._id
            testNew = await testNew.save()
            await answers.save()
            return res.json({ success: true, message: "tạo dữ liệu thành công", data: testNew })

        }
        catch (error) {
            return res.json({ success: false, message: error })
        }
    }


    async convertFileToText(req, res, next) {
        try {
            const options = {
                styleMap: [
                    "b => ",
                    "i => ",
                    "u => ",
                    "strike => ",
                    "comment-reference => ",
                    "p => "
                ],
                convertImage: mammoth.images.imgElement(async function (image) {
                    var imageBuffer = await image.read("base64")
                    if (image.contentType !== "image/png" && image.contentType !== "image/jpeg") {
                        const buf = Buffer.from(imageBuffer, "base64")
                        const wmfToPng = new Promise((resolve, reject) => {
                            wmf2png(buf, (err, result) => {
                                if (!err) {
                                    resolve(result.toString("base64"))
                                }
                            })
                        })
                        image.contentType = "image/png"
                        imageBuffer = await wmfToPng
                    }
                    return {
                        src: "data:" + image.contentType + ";base64," + imageBuffer
                    }

                })
            }
            const result = await mammoth.convertToHtml(req.file, options)
            return res.json({ success: true, message: "tạo dữ liệu thành công", text: result.value })
        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: "tạo dữ liệu thất bại", data: error })
        }
    }

    //[PATCH] /admin/test/update
    //private
    async update(req, res, next) {
        try {
            const test = req.body.test
            const testUpdate = await Test.findByIdAndUpdate(test._id, test, { new: true })
            if (!testUpdate) {
                return res.json({ success: false, message: error })
            }
            return res.json({ success: true, message: "cập nhật dữ liệu thành công", data: testUpdate })
        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: error })
        }
    }

    //[POST] /admin/test/get,
    // private
    async test(req, res, next) {
        try {
            const { id, edit, userId, username, settings, displayResult } = req.body.data
            var data = await Test.findById(id)
            if (!data) {
                return res.json({ success: false, message: "Đề thi không tồn tại" })
            }

            if (displayResult && data.settings.displayResult){
                return res.json({ success: true, message: "lấy dữ liệu thành công", data })
            }

            /* if (settings){
                return res.json({ success: true, message: "Lấy dữ liệu thành công", data: { settings: data.settings }})
            } */
            if (edit && userId === data.userId) {
                return res.json({ success: true, message: "lấy dữ liệu thành công", data })
            }
            data.answers = []
            if (data.settings.display === "private" && userId === data.userId) {
                return res.json({ success: true, message: "lấy dữ liệu thành công", data })
            }
            if (data.settings.display === "private" && userId !== data.userId) {
                return res.json({ success: false, message: "Bạn không có quyền truy cập" })
            }
            if (data.settings.displayLimit.length) {
                const displayLimit = [new Date(data.settings.displayLimit[0]), new Date(data.settings.displayLimit[1])]
                if (!(displayLimit[0].getTime() <= Date.now() && displayLimit[1].getTime() >= Date.now())) {
                    return res.json({ success: false, message: "Bạn không có quyền truy cập" })
                }
            }
            if (data.settings.display === "public") {
                data.answers = []
                return res.json({ success: true, message: "lấy dữ liệu thành công", data })
            }
            if (data.settings.display === "assign") {
                if (data.settings.userAccess.find(ele => ele[0] === username))
                    return res.json({ success: true, message: "lấy dữ liệu thành công", data })
            }
            return res.json({ success: false, message: "Bạn không có quyền truy cập" })
        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: "Đề thi không tồn tại" })
        }
    }

    //[POST] /admin/test/response,
    // private
    async response(req, res, next) {
        try {
            const { testId, userId } = req.body.data
            var answer = null
            answer = await Answer.findOne({ testId })
            var response = []
            if (answer) {
                if (userId) {
                    answer.answers.forEach((item) => {
                        if (item.info.id === userId) {
                            response.push(item)
                        }
                    })
                } else {
                    response = answer.answers
                }
            }
            return res.json({ success: true, message: "lấy dữ liệu thành công", data: response })
        } catch (error) {
            return res.json({ success: false, message: error })
        }
    }


    
    
    //[DELETE] /admin/test/delete
    //private
    async delete(req, res, next) {
        try {
            const id = req.body.id
            await Test.deleteOne({ _id: id })
            await Answer.deleteOne({ testId: id })
            return res.json({ success: true, message: "xóa dữ liệu thành công" })
        } catch (error) {
            return res.json({ success: false, message: error })
        }
    }
    //[PATCH] /admin/test/answer 
    async answer(req, res, next) {
        try {
            const { info, answer, testId, startTime, finishTime } = req.body
            const data = await Answer.findOne({ testId }).populate('testId', ['settings', 'answers'])
            data.answers.unshift({
                info,
                answer,
                date: new Date().toISOString(),
                mark: null,
                timePractice: finishTime - startTime,
            
            })
            const { answers } = data.testId
            const answerFromClient = data.answers[0].answer
            const { autoMark, displayResMark, ladderMark, displayLimit, display } = data.testId.settings
            if (displayLimit.length) {
                const displayLimitNew = [new Date(displayLimit[0]), new Date(displayLimit[1])]
                if (!(displayLimitNew[0].getTime() <= Date.now() && displayLimitNew[1].getTime() >= Date.now())) {
                    return res.json({ success: false, message: "Thời hạn nộp bài đã hết" })
                }
            }
            if (autoMark) {
                let answerTrue = 0
                for (let i = 0; i < answerFromClient.length; i++) {
                    if (answerFromClient[i] === answers[i]) {
                        answerTrue++
                    }
                }
                var mark = ladderMark / answerFromClient.length * answerTrue
                if (isNaN(mark)) {
                    mark = 0
                }
                data.answers[0].mark = mark.toFixed(2).toString()
                await data.save()
                if (!displayResMark) {
                    data.answers[0] = null
                }
            }else{
                await data.save()
            }
            return res.json({ success: true, message: "Nộp thành công", data: data.answers[0] })
        } catch (error) {
            console.log(error)
            return res.json({ success: false, message: error })
        }
    }

}

module.exports = new TestController