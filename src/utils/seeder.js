const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📂 Database Connected');

        await Category.deleteMany({});
        console.log('🧹 Old categories cleaned');

        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (adminExists) {
            console.log('ℹ️  Admin already exists');
        } else {
            await User.create({
                name: process.env.ADMIN_NAME || 'Super Admin',
                email: process.env.ADMIN_EMAIL || 'admin@foodville.com',
                phone: process.env.ADMIN_PHONE || '9876543210', // 🇮🇳 Indian number
                password: process.env.ADMIN_PASSWORD || 'Admin@123',
                role: 'admin'
            });
            console.log('✅ Admin created');
            console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
            console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);
        }

        const categories = [
            { name: 'Biryani', slug: 'biryani', icon: '🍛', sortOrder: 1 },
            { name: 'Pizza', slug: 'pizza', icon: '🍕', sortOrder: 2 },
            { name: 'Burger', slug: 'burger', icon: '🍔', sortOrder: 3 },
            { name: 'Kebab', slug: 'kebab', icon: '🥩', sortOrder: 4 },
            { name: 'Dessert', slug: 'dessert', icon: '🍰', sortOrder: 5 },
            { name: 'Drinks', slug: 'drinks', icon: '🥤', sortOrder: 6 }
        ];

        for (const cat of categories) {
            await Category.create(cat);
            console.log(`✅ Category: ${cat.name}`);
        }

        console.log('\n🎉 Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
