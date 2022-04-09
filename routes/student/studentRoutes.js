const express = require('express')
const router = express.Router();
const { getAllStudent, getAStudent, studentProfileUpdate, uploadProfilePic, forgotPassword, getStudentPasswordResetRoute, updateStudentPassword } = require('../../controllers/studentController');
const { studentAssessment, poststudentAssessmentSolution, getStudentAssessment, getStudentAssessmentSolution, } = require('../../controllers/studentAssessmentController');
const { requireAuth, checkStudent } = require('../../middlewares/auth');
const upload = require('../../controllers/multer');

// router.route()

router.get('/', getAllStudent)

// admin posting assessment
router.post('/task', studentAssessment)

// student getting the assessment
router.get('/getAssessment', getStudentAssessment)

// student posting solution
router.post('/solution', poststudentAssessmentSolution)

// admin getting the student solution
router.get('/studentSolution', getStudentAssessmentSolution)


// router.get('/:student_id', requireAuth, checkStudent, getAStudent)

router.get('/:student_id', getAStudent)

router.patch('/uploadprofilepic/:student_id', upload.single('image'), uploadProfilePic)

// router.patch('/:student_id', requireAuth, checkStudent, studentProfileUpdate)

router.patch('/:student_id', studentProfileUpdate)

// router.route('/:student_id', requireAuth, checkStudent).get(getAStudent).put(studentProfileUpdate)

// post route to get password reset link
router.post('/forgotpassword', forgotPassword)

// get route to the resetpassword page
router.get('/resetpassword/:student_id/:token', getStudentPasswordResetRoute)

// update route for student password reset
router.put('/resetpassword/:student_id/:token', updateStudentPassword)


module.exports = router;