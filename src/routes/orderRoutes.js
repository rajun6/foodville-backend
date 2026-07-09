const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addToCart,
    getCart,
    removeFromCart,
    placeOrder,
    getMyOrders,
    getOrder
} = require('../controllers/orderController');

router.use(protect);

router.post('/cart/add', addToCart);
router.get('/cart', getCart);
router.delete('/cart/:itemId', removeFromCart);
router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
