const mongoose = require('mongoose')

const StudentSolutionSchema = mongoose.Schema({
    solution : {
        type: String,
    },
    studentID : {
        type:String,
    }

}, {timestamps: true})

module.exports = mongoose.model('studentSolution', StudentSolutionSchema);