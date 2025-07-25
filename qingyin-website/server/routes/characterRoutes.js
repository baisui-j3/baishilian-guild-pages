const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const authMiddleware = require('../middleware/auth');
const { body, param } = require('express-validator');
const multer = require('multer');

// Multer配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `screenshot-${uniqueSuffix}.${ext}`);
  }
});

// 文件过滤器（仅允许图片）
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)'), false);
  }
};

// 创建上传中间件
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 限制5MB
});

// 添加新角色
router.post('/characters', 
  authMiddleware.authenticate,
  [
    body('gameId')
      .notEmpty().withMessage('游戏ID不能为空')
      .trim()
      .isLength({ min: 2, max: 20 }).withMessage('游戏ID长度需在2-20字符之间')
  ],
  characterController.addCharacter
);

// 更新角色签名
router.put('/characters/:characterId/signature', 
  authMiddleware.authenticate,
  [
    param('characterId').isInt().withMessage('无效的角色ID'),
    body('signature')
      .notEmpty().withMessage('个性签名不能为空')
      .trim()
      .isLength({ max: 50 }).withMessage('个性签名不能超过50字')
  ],
  characterController.updateSignature
);

// 上传角色截图
router.post('/characters/:characterId/screenshot', 
  authMiddleware.authenticate,
  upload.single('screenshot'),
  characterController.uploadScreenshot
);

// 获取用户所有角色
router.get('/characters', 
  authMiddleware.authenticate,
  characterController.getUserCharacters
);

// 删除角色
router.delete('/characters/:characterId', 
  authMiddleware.authenticate,
  [param('characterId').isInt().withMessage('无效的角色ID')],
  characterController.deleteCharacter
);

// 获取待审核角色（管理员）
router.get('/admin/approvals', 
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  characterController.getPendingApprovals
);

// 处理审核（管理员）
router.put('/admin/approvals/:characterId', 
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  [
    param('characterId').isInt().withMessage('无效的角色ID'),
    body('approve').isBoolean().withMessage('审核状态无效')
  ],
  characterController.handleApproval
);

// 获取所有已审核角色（主页展示）
router.get('/characters/approved', 
  characterController.getAllApprovedCharacters
);

module.exports = router;