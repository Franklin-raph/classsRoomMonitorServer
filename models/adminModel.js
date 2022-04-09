const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({
    name: {
        type: String
    },
    password: {
        type: String
    },
    phoneNum: {
        type: String
    },
    email: {
        type: String
    },
    adminID: {
        type: String
    },
    address: {
        type: String
    },
    avatar : {
        type: String,
    },
    cloudinary_id: {
        type: String,
    }
},{timestamps: true})

module.exports = mongoose.model('admin', AdminSchema)