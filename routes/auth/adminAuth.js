const express = require('express')
const router = express.Router();
const { loginAdmin, registerAdmin, adminLogout } = require('../../controllers/adminController')


router.post('/login', loginAdmin);

// router.post('/register', registerAdmin)

router.get('/logout', adminLogout)


module.exports = router;