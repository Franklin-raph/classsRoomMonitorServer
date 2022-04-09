const Student = require('../models/studentModel');
const cloudinary = require('../config/cloudinary')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer')

const registerStudent =  async (req, res) => {
    try {
        const { name, email, password, phoneNum, gender, address, github } = req.body
        // const result = await cloudinary.uploader.upload(req.file.path)

        let student = await Student.findOne({name})
        let studentEmail = await Student.findOne({email})

        if(student) return res.status(400).json({ msg:"Username alraedy exists" })

        if(studentEmail) return res.status(400).json({ msg: "Email already exists"})

        const student_id = `TN-${uuidv4()}`;

        student = new Student({
            name, email, password, phoneNum, gender, address, studentID:student_id, github, avatar:"" , cloudinary_id:""
        })

        console.log(student)

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(password, salt)
        await student.save();

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
            to: student.email,
            subject: 'Sending Email From Class Monitor App',
            html: `Your student id is ${student_id}`,
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

        const token = createToken(student._id)
        res.cookie('myToken', token, { httpOnly: true, maxAge: 60*60*1000*24*3})
        const signedInStudent = _.pick(student, 'name','email','phoneNum','gender','studentID','github', 'address','avatar');
        console.log(signedInStudent)
        res.status(200).json({signedInStudent,token})

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
}
    


// Login student
const loginStudent = async (req, res) => {

    const { studentID, password } = req.body

    try {
        let student = await Student.findOne({studentID})
        const signedInStudent = _.pick(student, 'name','email','phoneNum','gender','address','studentID','github','avatar');
        if(!student) return res.status(400).json({ msg: "Invalid login credentials"})

        let isMatch = await bcrypt.compare(password, student.password)
        if(!isMatch) return res.status(400).json({ msg: "Invalid login credentials"})

        const createToken = (id) => {
            return jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: 60*60*1000*24*3
            })
        }

        const token = createToken(student._id)
        res.cookie('myToken', token, { httpOnly: true, maxAge: 60*60*1000*24*3})
        return res.status(200).json({signedInStudent, token})

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
}


// Get all students
const getAllStudent = async (req, res) => {
    let student = res.locals.student;
    console.log(student)
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
    let student = res.locals.student;
    console.log(student)
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


// Student sign out
const studentLogout = (req, res) => {
    res.cookie('myToken', '', {maxAge: 1})
    return res.send("Student is signed out")
}


// Student update profile
const studentProfileUpdate = async (req, res) => {

    // the logged in user id
    // let currentStudent = res.locals.student
    // let loggedInStudentId = currentStudent._id.toString()
    // console.log(`The current logged in student id is -> ${loggedInStudentId}`)

    // The id of the user who made the post
    // let profileUpdateStudent = await Student.findOne({_id: req.params.student_id})
    // let profileUpdateStudentId = profileUpdateStudent._id.toString()
    // console.log(`This post was made by this user with an id of -> ${profileUpdateStudentId}`)

    const { name, email, studentID } = req.body
    try {
        // if(loggedInStudentId === profileUpdateStudentId){

            let student = await Student.findOne({name})
            let studentEmail = await Student.findOne({email})

            // let studentId = await Student.findOne({studentID})
            // console.log(typeof studentId)
            // console.log(studentId)

            // if(student) return res.status(400).json({ msg:"Username alraedy exists" })

            if(studentEmail) return res.status(400).json({ msg: "Email already exists"})

            Student.findOne({ studentID: req.params.student_id })
            .then(signedInStudent => {
                signedInStudent.name = req.body.name || student.name;
                signedInStudent.email = req.body.email;
                signedInStudent.phoneNum = req.body.phoneNum;
                signedInStudent.gender = req.body.gender;
                signedInStudent.address = req.body.address;
                signedInStudent.gitHub = req.body.giithub

                signedInStudent.save();
                res.json({ signedInStudent })
            })
        // }
        // else {
        //     return res.status(403).json({msg:"You are not authorized to Edit this profile"})
        // }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error")
    }
}
// avatar:result.secure_url,
const uploadProfilePic = async (req, res) => {

    try {
        const result = await cloudinary.uploader.upload(req.file.path)
        console.log("Hello")
        console.log(result)

        Student.findOne({ studentID: req.params.student_id })
            .then(signedInStudent => {
                console.log(signedInStudent)
                signedInStudent.avatar = result.secure_url || signedInStudent.avatar
                signedInStudent.cloudinary_id = result.public_id || signedInStudent.cloudinary_id 
                signedInStudent.name = signedInStudent.name
                signedInStudent.email = signedInStudent.email;
                signedInStudent.phoneNum = signedInStudent.phoneNum;
                signedInStudent.gender = signedInStudent.gender;
                signedInStudent.address =signedInStudent.address;
                signedInStudent.gitHub = signedInStudent.giithub

                signedInStudent.save();
                res.json({ signedInStudent })
            })
        // res.send(student)
    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
    
}

// Student Forgot password request
const forgotPassword = async (req, res) => {
   
    const { email } = req.body
    const student = await Student.findOne({email})

     // check if email exists
    if(student === null){
        res.status(404).json({msg:"Email does not exist"})
        return
    }

    // User exist and now create a one time reset link valid for 15mins
    const secret = process.env.JWT_SECRET + student.password
    const payload = {
        email: student.email,
        id:student._id
    }

    console.log(payload)

    const token = jwt.sign(payload, secret, {expiresIn: "15h"})
    const link = `https://classmonitor.netlify.app/student/resetpassword/${student.studentID}/${token}`


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
        to: student.email,
        subject: 'Sending Email From Class Monitor App',
        html: link,
      };
      
      transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
          console.log(error + "Error here");
        } else {
          console.log('Email sent: ' + info.response);
          console.log(info)
        }
      });

    res.status(200).json({passwordResetLink:link})
}


// Student password reset get route
const getStudentPasswordResetRoute = async (req, res) => {
    const { student_id, token } = req.params;
    const student = await Student.findOne({studentID : req.params.student_id})

    console.log(student_id)
    console.log(student)

    // check if the studentID exists
    if(student_id !== student.studentID) return res.status(404).send({msg:`Student with id ${student_id} doesn't exist`})

    // verify the token since we have a valid id and a valid user with the id
    // we would use process.env.JWT_SECRET + student.password to verify the token cos that is what i used in signing the token up
    const secret = process.env.JWT_SECRET + student.password
    try {
        const payload = jwt.verify(token, secret)
        return res.status(200).json({student})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: error.message})
    }
}

const updateStudentPassword = async (req, res) => {
    const { student_id, token } = req.params;
    const student = await Student.findOne({studentID : req.params.student_id})

    // check if the studentID exists
    if(student_id !== student.studentID) return res.status(404).send({msg:`Student with id ${student_id} doesn't exist`})

    // verify the token since we have a valid id and a valid user with the id
    // check for the user with this id and update the password field
    const secret = process.env.JWT_SECRET + student.password
    try {
        const payload = jwt.verify(token, secret)
        
        await Student.findOne({ studentID: req.params.student_id })
            .then( async (signedInStudent) => {
                console.log(signedInStudent)
                signedInStudent.avatar = signedInStudent.avatar
                signedInStudent.cloudinary_id = signedInStudent.cloudinary_id 
                signedInStudent.name = signedInStudent.name
                signedInStudent.email = signedInStudent.email;
                signedInStudent.phoneNum = signedInStudent.phoneNum;
                signedInStudent.gender = signedInStudent.gender;
                signedInStudent.address =signedInStudent.address;
                signedInStudent.gitHub = signedInStudent.giithub;
                signedInStudent.studentID = signedInStudent.studentID;

                const salt = await bcrypt.genSalt(10);
                signedInStudent.password = await bcrypt.hash(req.body.password, salt)

                await signedInStudent.save();
                return res.status(200).json({signedInStudent})
            })

        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: error.message})
    }
}


module.exports = {
    loginStudent,
    registerStudent,
    getAllStudent,
    studentLogout,
    getAStudent,
    studentProfileUpdate,
    uploadProfilePic,
    forgotPassword,
    getStudentPasswordResetRoute,
    updateStudentPassword
}