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


const registerAdmin =  async (req, res) => {
    try {
        const { name, email, password, phoneNum, gender, address, github } = req.body
        // const result = await cloudinary.uploader.upload(req.file.path)

        let admin = await admin.findOne({name})
        let adminEmail = await admin.findOne({email})

        if(admin) return res.status(400).json({ msg:"Username alraedy exists" })

        if(adminEmail) return res.status(400).json({ msg: "Email already exists"})

        // const admin_id = `TN-${uuidv4()}`;

        admin = new Admin({
            name, email, password, phoneNum, gender, address, github, avatar:"" , cloudinary_id:""
        })

        console.log(admin)

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt)
        await admin.save();

             // Code for sending email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.TEST_GMAIL,
                pass: process.env.TEST_GMAIL_PASSWORD,
            }
        });
        
        const mailOptions = {
            from: process.env.TEST_GMAIL,
            to: admin.email,
            subject: 'Sending Email From Class Monitor App',
            html: `Thank you for registering with Technobs Digital Solutions via the class monitor app.<br />
            Your admin id is <span style:'font-weight:bold'>${admin_id}</span>
            `,
        };
        
        transporter.sendMail(mailOptions, (error, info)=>{
            if (error) {
            console.log(error + "Error here");
            } else {
            console.log('Email sent: ' + info.response);
            console.log(info)
            }
        });

        const createToken = (id) => {
            return jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: 60*60*1000*24*3
            })
        }

        const token = createToken(admin._id)
        res.cookie('myToken', token, { httpOnly: true, maxAge: 60*60*1000*24*3})
        const signedInAdmin = _.pick(admin, 'name','email','phoneNum','gender','adminID','github', 'address','avatar');
        console.log(signedInadmin)
        res.status(200).json({signedInAdmin,token})

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
}




module.exports = {
    loginAdmin,
    registerAdmin,
    // getAllStudent,
    // studentLogout,
    // getAStudent,
    // studentProfileUpdate,
    // uploadProfilePic,
    // forgotPassword,
    // getStudentPasswordResetRoute,
    // updateStudentPassword
}