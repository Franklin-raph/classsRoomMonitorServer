const express = require('express')
const router = express.Router();
const { getAllStudent, getAStudent} = require('../../controllers/adminController');

router.get('/allStudents', getAllStudent)

// route to get a single student
router.get('/:student_id', getAStudent)


module.exports = router;