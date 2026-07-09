const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    adminLogin,
    getProfile,
    updateProfile,
    logout,
    addAddress
} = require('../controllers/authController');

// পাবলিক রুট
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);

// প্রটেক্টেড রুট
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.post('/address', protect, addAddress);

module.exports = router;
