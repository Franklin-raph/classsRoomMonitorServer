const express = require('express')
const router = express.Router();
const { loginStudent, registerStudent, studentLogout, deleteStudentRecord } = require('../../controllers/studentController')


router.post('/login', loginStudent);

router.post('/register', registerStudent)

router.get('/logout', studentLogout)

router.delete('/deleteStuentRecord/:student_id', deleteStudentRecord)


module.exports = router;