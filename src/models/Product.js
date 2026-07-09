const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name required'],
        trim: true,
        maxlength: [100, 'Max 100 chars']
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
        type: String,
        required: [true, 'Description required'],
        maxlength: [500, 'Max 500 chars']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category required']
    },
    price: {
        type: Number,
        required: [true, 'Price required'],
        min: [0, 'Min 0']
    },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String, default: 'default-product.png' }],
    isVegetarian: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 20 },
    addons: [addonSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    nutritionInfo: {
        calories: Number,
        protein: String,
        carbs: String,
        fat: String
    }
}, { timestamps: true });

// ✅ Mongoose 9 compatible pre-hook
productSchema.pre('save', async function() {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-') + 
            '-' + Math.random().toString(36).substring(2, 7);
    }
});

productSchema.virtual('discountPercentage').get(function() {
    if (this.discountPrice && this.price > 0) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
