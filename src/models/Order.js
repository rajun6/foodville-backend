const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
    addons: [{ name: String, price: Number }],
    image: String
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        area: String,
        phone: String
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'card', 'mobile_banking'],
        default: 'cash_on_delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    subtotal: Number,
    deliveryCharge: { type: Number, default: 40 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: String,
    totalAmount: Number,
    orderNote: String,
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String
}, { timestamps: true });

// ✅ Mongoose 9 compatible
orderSchema.pre('save', async function() {
    this.subtotal = this.orderItems.reduce((total, item) => {
        const addonsTotal = item.addons ? item.addons.reduce((sum, addon) => sum + addon.price, 0) : 0;
        return total + ((item.price + addonsTotal) * item.quantity);
    }, 0);

    this.totalAmount = this.subtotal + this.deliveryCharge + this.tax - this.discount;

    if (this.isModified('orderStatus')) {
        this.statusHistory.push({
            status: this.orderStatus,
            timestamp: new Date(),
            note: `Order ${this.orderStatus}`
        });
    }
});

module.exports = mongoose.model('Order', orderSchema);
