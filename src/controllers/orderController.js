const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// কার্টে যোগ
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, addons = [] } = req.body;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                addons,
                price: product.discountPrice || product.price
            });
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price discountPrice images');

        res.status(200).json({ success: true, message: 'কার্টে যোগ হয়েছে', cart: populatedCart });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// কার্ট দেখা
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price discountPrice images isAvailable');

        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [], totalItems: 0, totalPrice: 0 } });
        }

        res.status(200).json({ success: true, cart });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// কার্ট থেকে রিমুভ
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'কার্ট পাওয়া যায়নি' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price discountPrice images');

        res.status(200).json({ success: true, message: 'কার্ট থেকে রিমুভ হয়েছে', cart: populatedCart });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// অর্ডার প্লেস
exports.placeOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, orderNote } = req.body;
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'কার্ট খালি' });
        }

        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            addons: item.addons,
            image: item.product.images?.[0]
        }));

        const order = await Order.create({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'cash_on_delivery',
            orderNote,
            subtotal: cart.totalPrice,
            totalAmount: cart.totalPrice + 40
        });

        cart.items = [];
        await cart.save();

        const populatedOrder = await Order.findById(order._id).populate('user', 'name phone email');

        res.status(201).json({ success: true, message: 'অর্ডার প্লেস হয়েছে!', order: populatedOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// আমার অর্ডার
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, total: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// অর্ডার ডিটেইল
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name phone email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
        }

        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
