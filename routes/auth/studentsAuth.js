const express = require('express')
const router = express.Router();
const { loginStudent, registerStudent, studentLogout } = require('../../controllers/studentController')


router.post('/login', loginStudent);

router.post('/register', registerStudent)

router.get('/logout', studentLogout)


module.exports = router;