const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    area: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'নাম আবশ্যক'],
        trim: true,
        maxlength: [50, 'নাম ৫০ অক্ষরের বেশি নয়']
    },
    email: {
        type: String,
        required: [true, 'ইমেইল আবশ্যক'],
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'ফোন নম্বর আবশ্যক'],
        unique: true,
        validate: {
            validator: function(v) {
                // 🇮🇳 Indian mobile: starts with 6-9, total 10 digits
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'सही फोन नंबर डालें (10 digits, starting with 6-9)'
        }
    },
    password: {
        type: String,
        required: [true, 'पासवर्ड जरूरी है'],
        minlength: [6, 'पासवर्ड कम से कम 6 अक्षर'],
        select: false
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    avatar: { type: String, default: 'default-avatar.png' },
    addresses: [addressSchema],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        role: this.role,
        avatar: this.avatar,
        addresses: this.addresses,
        isActive: this.isActive,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);
