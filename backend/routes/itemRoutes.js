
import express from 'express';
import { createLostItem, createFoundItem, getLostItems, getFoundItems, matchItem, updateItemStatus, deleteItem } from '../controllers/itemController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/lost', protect, createLostItem);
router.post('/found', protect, createFoundItem);
router.get('/lost', getLostItems);
router.get('/found', getFoundItems);
router.get('/match/:itemId', protect, matchItem);
router.put('/:id', protect, updateItemStatus);
router.delete('/:id', protect, deleteItem);

export default router;
