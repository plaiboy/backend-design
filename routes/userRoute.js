const { registerUser, loginUser, logoutUser, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword } = require('../controllers/userController');

const express = require('express');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/logout", logoutUser)
router.get('/getuser', protect, getUser)
router.get("/loggedIn", loginStatus)
router.patch("/updateuser",  protect, updateUser)
router.patch('/changePassword', protect, changePassword);
router.post("/forgotPassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword)

module.exports = router