const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Max 50 chars']
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: [200, 'Max 200 chars'] },
    image: { type: String, default: 'default-category.png' },
    icon: { type: String, default: '🍽️' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Generate slug - fallback to timestamp if empty
categorySchema.pre('save', async function() {
    if (this.isModified('name')) {
        const generatedSlug = this.name
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-')
            .replace(/[^\x00-\x7F]/g, ''); // remove non-ASCII
        
        // If slug is empty (Bengali name), use timestamp
        this.slug = generatedSlug || 'category-' + Date.now();
    }
});

module.exports = mongoose.model('Category', categorySchema);
