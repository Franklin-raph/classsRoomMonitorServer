const Student = require('../models/studentModel');
const cloudinary = require('../config/cloudinary')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');


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



module.exports = {
    loginStudent,
    registerStudent,
    getAllStudent,
    studentLogout,
    getAStudent,
    studentProfileUpdate,
    uploadProfilePic
}