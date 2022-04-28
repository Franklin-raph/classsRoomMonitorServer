const mongoose = require('mongoose')

const StudentSchema = mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email:{
        type: String,
    },
    address:{
        type: String
    },
    password: {
        type: String,
    },
    phoneNum: {
        type: String,
    },
    gender: {
        type: String,
    },
    studentID: {
        type: String,
    },
    github: {
        type: String,
    },
    avatar : {
        type: String,
    },
    cloudinary_id: {
        type: String,
    }
}, {timestamps: true})

module.exports = mongoose.model('student', StudentSchema)

