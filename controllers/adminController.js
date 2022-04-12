const Student = require('../models/studentModel');
const Admin = require('../models/adminModel')
const cloudinary = require('../config/cloudinary')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer')


// Login student
const loginAdmin = async (req, res) => {

    const { email, password } = req.body

    try {
        let admin = await Admin.findOne({email})
        const signedInAdmin = _.pick(admin, 'name','email','phoneNum','gender','address','adminID','github','avatar');
        if(!admin) return res.status(400).json({ msg: "Invalid login credentials"})

        let isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch) return res.status(400).json({ msg: "Invalid login credentials"})

        const createToken = (id) => {
            return jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: 60*60*1000*24*3
            })
        }

        const token = createToken(admin._id)
        res.cookie('myToken', token, { httpOnly: true, maxAge: 60*60*1000*24*3})
        return res.status(200).json({signedInAdmin, token})

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
}


// const registerAdmin =  async (req, res) => {
//     try {
//         const { name, email, password, phoneNum, gender, address, github } = req.body

//         let admin = await Admin.findOne({name})
//         let adminEmail = await Admin.findOne({email})

//         if(admin) return res.status(400).json({ msg:"Username alraedy exists" })

//         if(adminEmail) return res.status(400).json({ msg: "Email already exists"})

//         admin = new Admin({
//             name, email, password, phoneNum, gender, address, github, avatar:"" , cloudinary_id:""
//         })

//         console.log(admin)

//         const salt = await bcrypt.genSalt(10);
//         admin.password = await bcrypt.hash(password, salt)
//         await admin.save();

//              Code for sending email
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.TEST_GMAIL,
//                 pass: process.env.TEST_GMAIL_PASSWORD,
//             }
//         });
        
//         const mailOptions = {
//             from: process.env.TEST_GMAIL,
//             to: admin.email,
//             subject: 'Sending Email From Class Monitor App',
//             html: `Thank you for registering with Technobs Digital Solutions via the class monitor app.<br />
//             Your admin id is <span style:'font-weight:bold'>${admin._id}</span>
//             `,
//         };
        
//         transporter.sendMail(mailOptions, (error, info)=>{
//             if (error) {
//             console.log(error + "Error here");
//             } else {
//             console.log('Email sent: ' + info.response);
//             console.log(info)
//             }
//         });

//         const createToken = (id) => {
//             return jwt.sign({ id }, process.env.JWT_SECRET, {
//                 expiresIn: 60*60*1000*24*3
//             })
//         }

//         const token = createToken(admin._id)
//         res.cookie('myToken', token, { httpOnly: true, maxAge: 60*60*1000*24*3})
//         const signedInAdmin = _.pick(admin, 'name','email','phoneNum','gender','adminID','github', 'address','avatar');
//         console.log(signedInAdmin)
//         res.status(200).json({signedInAdmin,token})

//     } catch (error) {
//         console.log(error)
//         res.status(500).send("Server Error")
//     }
// }


// Admin sign out
const adminLogout = (req, res) => {
    res.cookie('myToken', '', {maxAge: 1})
    return res.send("Adnin is signed out")
}


// Get all students
const getAllStudent = async (req, res) => {
    // let admin = res.locals.student;
    // console.log(student)
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        const allStu = students.map(({name,email,studentID,phoneNum,gender,github, avatar}) => ({name,email,studentID,phoneNum,gender,github, avatar}))
        res.json(allStu);

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
}


// Get a single student
const getAStudent = async (req, res) => {
    // let student = res.locals.student;
    // console.log(student)
    try {
        const student = await Student.findOne({ studentID : req.params.student_id });
        if(!student) return res.status(404).json({msg: `No student with id ${req.params.student_id}`})

        const stdData = _.pick(student, 'name','email','phoneNum','gender','studentID','github','address','avatar');

        return res.status(200).json(stdData);

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
}



module.exports = {
    loginAdmin,
    // registerAdmin,
    getAllStudent,
    adminLogout,
    getAStudent,
    // studentProfileUpdate,
    // uploadProfilePic,
    // forgotPassword,
    // getStudentPasswordResetRoute,
    // updateStudentPassword
}