const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

router.get('/users', 
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminController.getAllUsers
);

router.put('/users/:userId/password', 
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminController.resetUserPassword
);

module.exports = router;