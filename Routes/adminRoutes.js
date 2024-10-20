import express from 'express';
import { adminLogin } from '../Controllers/adminController.js';
import { blockandUnblock, getallUser } from '../Controllers/adminUserController.js';
const router = express.Router();

// Admin Login
router.post('/login', adminLogin)

// Get all users 
router.get('/users', getallUser);

// Block or Unblock a user
router.patch('/users/:id/block', blockandUnblock);


export default router;