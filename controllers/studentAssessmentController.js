const StudentAssessmentModel = require('../models/studentAssessment')
const StudentSolutionModel = require('../models/studentSolution')

// POSTING STUDENT ASSESSMENT QUESTION
const studentAssessment = async (req, res) => {
    const { reference, task } = req.body;

    try {
        const assessment = new StudentAssessmentModel({
            reference, task
        })
    
        await assessment.save()
        res.status(201).json({assessment})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error")
    }
}

// GET STUDENT ASSESSMENT QUESTION
const getStudentAssessment = async (req, res) => {
    try {
        const assessment = await StudentAssessmentModel.find().sort({createdAt: -1})
        res.json(assessment)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("Server Error")
    }
}

// POST STUDENT ASSESSMENT SOLUTION
const poststudentAssessmentSolution = async (req, res) => {

    const { solution, studentID } = req.body

    console.log(solution, studentID)

    try {
        const submittedAssignment = new StudentSolutionModel({
            solution, studentID
        })

        console.log(submittedAssignment)

        await submittedAssignment.save()
        res.status(201).json(submittedAssignment)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

// GET STUDENT SOLUTION
const getStudentAssessmentSolution = async (req, res) => {

    try {
        const studentAssessmentSolution = await StudentSolutionModel.find().sort({createdSt: -1})
        res.status(200).json(studentAssessmentSolution)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
    
}


module.exports = {
    studentAssessment,
    poststudentAssessmentSolution,
    getStudentAssessment,
    getStudentAssessmentSolution
}