const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const authMiddleware = require('../middleware/auth');

router.get('/', themeController.getTheme);
router.put('/', 
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  themeController.updateTheme
);

module.exports = router;