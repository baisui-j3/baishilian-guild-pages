const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authMiddleware.validateRegister, authController.register);
router.post('/login', authMiddleware.validateLogin, authController.login);
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);
router.put('/password', 
  authMiddleware.authenticate, 
  authMiddleware.validatePassword, 
  authController.changePassword
);
router.put('/users/:userId/password', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  authController.resetPassword
);
router.delete('/account', 
  authMiddleware.authenticate, 
  authController.deleteAccount
);

module.exports = router;