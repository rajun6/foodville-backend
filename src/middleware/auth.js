const jwt = require('jsonwebtoken');
const User = require('../models/User');

// প্রটেক্টেড রুট - ইউজার অবশ্যই লগইন থাকতে হবে
const protect = async (req, res, next) => {
    let token;

    // হেডার থেকে টোকেন চেক
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // অথবা কুকি থেকে
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '❌ লগইন করা হয়নি। প্রথমে লগইন করুন।'
        });
    }

    try {
        // টোকেন ভেরিফাই
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ইউজার খুঁজে বের করা
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '❌ ইউজার পাওয়া যায়নি'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: '❌ টোকেন ভুল বা মেয়াদোত্তীর্ণ'
        });
    }
};

// অ্যাডমিন চেক - শুধু অ্যাডমিন এক্সেস পাবে
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: '⛔ এই ফিচার শুধু অ্যাডমিনের জন্য'
        });
    }
};

module.exports = { protect, adminOnly };
