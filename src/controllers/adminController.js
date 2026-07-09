const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

// ড্যাশবোর্ড
exports.getDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalOrders = await Order.countDocuments();
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalProducts = await Product.countDocuments();
        const pendingOrders = await Order.countDocuments({ 
            orderStatus: { $in: ['pending', 'confirmed', 'preparing'] }
        });

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name phone');

        res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                todayOrders,
                totalUsers,
                totalProducts,
                pendingOrders
            },
            recentOrders
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// সব অর্ডার
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name phone email');

        res.status(200).json({
            success: true,
            total: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// অর্ডার স্ট্যাটাস আপডেট
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
        }

        if (status === 'delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid';
        } else if (status === 'cancelled') {
            order.cancelledAt = Date.now();
        }

        order.orderStatus = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: `অর্ডার ${status} হয়েছে`,
            order
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// সব ইউজার
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, total: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ইউজার অ্যাক্টিভ টগল
exports.toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
        }
        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `ইউজার ${user.isActive ? 'অ্যাক্টিভ' : 'ডিঅ্যাক্টিভ'} হয়েছে`,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
