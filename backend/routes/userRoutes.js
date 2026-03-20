import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { verifyAccessToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyAccessToken);

// Get profile
router.get('/profile', getUserProfile);

// Update profile
router.put('/profile', updateUserProfile);

export default router;