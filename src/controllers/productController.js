const Product = require('../models/Product');
const Category = require('../models/Category');

// সব প্রোডাক্ট
exports.getProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        let query = { isAvailable: true };

        if (category) {
            const cat = await Category.findOne({ slug: category });
            if (cat) query.category = cat._id;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('category', 'name slug icon');

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            products
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// একটা প্রোডাক্ট
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug icon');

        if (!product) {
            return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
        }

        res.status(200).json({ success: true, product });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// প্রোডাক্ট তৈরি (অ্যাডমিন)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'প্রোডাক্ট তৈরি হয়েছে', product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// প্রোডাক্ট আপডেট
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
        }
        res.status(200).json({ success: true, message: 'প্রোডাক্ট আপডেট হয়েছে', product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// প্রোডাক্ট ডিলিট
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
        }
        res.status(200).json({ success: true, message: 'প্রোডাক্ট ডিলিট হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ক্যাটাগরি তৈরি
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, message: 'ক্যাটাগরি তৈরি হয়েছে', category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// সব ক্যাটাগরি
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
        res.status(200).json({ success: true, total: categories.length, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
