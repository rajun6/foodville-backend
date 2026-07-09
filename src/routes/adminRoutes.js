const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getDashboard,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    toggleUserActive
} = require('../controllers/adminController');
const {
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory
} = require('../controllers/productController');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/categories', createCategory);

module.exports = router;
