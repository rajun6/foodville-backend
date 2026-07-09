const User = require('../models/User');

// @desc    ইউজার রেজিস্টার
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'এই ইমেইল বা ফোন আগে থেকেই আছে'
            });
        }

        const user = await User.create({ name, email, phone, password });
        const token = user.generateAuthToken();

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.status(201).json({
            success: true,
            message: 'রেজিস্ট্রেশন সফল!',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    ইউজার লগইন
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'ইমেইল ও পাসওয়ার্ড দিন' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড' });
        }

        const token = user.generateAuthToken();

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.status(200).json({
            success: true,
            message: 'লগইন সফল!',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    অ্যাডমিন লগইন (সিক্রেট পাসওয়ার্ড)
// @route   POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
    try {
        const { secretKey } = req.body;

        // 🔑 SECRET ADMIN PASSWORD
        const ADMIN_SECRET = 'admin123';

        if (!secretKey) {
            return res.status(400).json({ success: false, message: 'সিক্রেট কী দিন' });
        }

        if (secretKey !== ADMIN_SECRET) {
            return res.status(401).json({ success: false, message: 'ভুল সিক্রেট কী!' });
        }

        // অ্যাডমিন ইউজার খুঁজে বের করা (না থাকলে তৈরি)
        let adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin',
                email: 'admin@foodville.com',
                phone: '9876543210',
                password: 'Admin@123',
                role: 'admin'
            });
        }

        const token = adminUser.generateAuthToken();

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.status(200).json({
            success: true,
            message: '✅ অ্যাডমিন লগইন সফল!',
            token,
            user: adminUser.toPublicJSON()
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    প্রোফাইল
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user: user.toPublicJSON() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    প্রোফাইল আপডেট
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'প্রোফাইল আপডেট হয়েছে', user: user.toPublicJSON() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    লগআউট
exports.logout = async (req, res) => {
    res.cookie('token', 'none', { httpOnly: true, expires: new Date(Date.now() + 10 * 1000) });
    res.status(200).json({ success: true, message: 'লগআউট সফল' });
};

// @desc    ঠিকানা যোগ
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { label, street, city, area, phone, isDefault } = req.body;

        if (isDefault) user.addresses.forEach(addr => addr.isDefault = false);
        user.addresses.push({ label, street, city, area, phone, isDefault });
        await user.save();

        res.status(200).json({ success: true, message: 'ঠিকানা যোগ হয়েছে', addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
