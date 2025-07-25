const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const db = require('../models');
const { validationResult } = require('express-validator');

// 创建签名文件存储目录（根目录下的signatures文件夹）
const signaturesDir = path.join(__dirname, '../../signatures');
if (!fs.existsSync(signaturesDir)) {
  mkdirp.sync(signaturesDir, { recursive: true });
}

// 限制每个用户最多绑定3个角色
const MAX_CHARACTERS_PER_USER = 3;

// 允许的图片文件类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 添加新角色
exports.addCharacter = async (req, res) => {
  try {
    const userId = req.userId;
    const { gameId } = req.body;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // 检查用户是否已存在该游戏ID
    const existingCharacter = await db.Character.findOne({ 
      where: { 
        userId, 
        gameId 
      } 
    });
    
    if (existingCharacter) {
      return res.status(400).json({ error: '该游戏角色已绑定' });
    }
    
    // 检查用户是否已达到角色上限
    const userCharacters = await db.Character.count({ 
      where: { userId } 
    });
    
    if (userCharacters >= MAX_CHARACTERS_PER_USER) {
      return res.status(400).json({ error: `每个账号最多绑定${MAX_CHARACTERS_PER_USER}个角色` });
    }
    
    // 创建新角色（未经审核）
    const newCharacter = await db.Character.create({
      userId,
      gameId,
      signature: null,
      screenshotPath: null,
      isApproved: false
    });
    
    res.status(201).json({ 
      message: '角色绑定成功！签名和名片截图等待上传', 
      character: newCharacter 
    });
    
  } catch (error) {
    console.error('添加角色失败:', error);
    res.status(500).json({ error: '添加角色失败' });
  }
};

// 更新角色签名
exports.updateSignature = async (req, res) => {
  try {
    const { characterId } = req.params;
    const { signature } = req.body;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // 后端验证签名长度
    if (signature && signature.length > 50) {
      return res.status(400).json({ error: '个性签名不能超过50字' });
    }
    
    // 查找角色
    const character = await db.Character.findOne({ 
      where: { id: characterId, userId: req.userId } 
    });
    
    if (!character) {
      return res.status(404).json({ error: '角色不存在或没有权限' });
    }
    
    // 创建签名文件路径
    const signatureFileName = `signature-${characterId}.txt`;
    const signaturePath = path.join(signaturesDir, signatureFileName);
    
    // 写入签名内容
    fs.writeFileSync(signaturePath, signature);
    
    // 更新角色签名信息（重置审核状态）
    character.signature = signaturePath;
    character.isApproved = false;
    await character.save();
    
    res.status(200).json({ 
      message: '签名更新成功，等待审核！',
      character 
    });
    
  } catch (error) {
    console.error('更新签名失败:', error);
    res.status(500).json({ error: '更新签名失败' });
  }
};

// 上传角色截图
exports.uploadScreenshot = async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: '未上传截图' });
    }
    
    // 验证文件类型
    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      // 删除无效文件
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: '只允许上传图片文件 (JPEG, PNG, GIF, WebP)' });
    }
    
    // 查找角色
    const character = await db.Character.findOne({ 
      where: { id: characterId, userId: req.userId } 
    });
    
    if (!character) {
      // 删除上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: '角色不存在或没有权限' });
    }
    
    // 如果有旧截图，先删除
    if (character.screenshotPath) {
      const oldPath = path.join(__dirname, '../../uploads', character.screenshotPath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // 更新角色截图信息（重置审核状态）
    character.screenshotPath = req.file.filename;
    character.isApproved = false;
    await character.save();
    
    res.status(200).json({ 
      message: '名片截图上传成功，等待审核！',
      character 
    });
    
  } catch (error) {
    console.error('上传截图失败:', error);
    res.status(500).json({ error: '上传截图失败' });
  }
};

// 获取用户所有角色
exports.getUserCharacters = async (req, res) => {
  try {
    const userId = req.userId;
    
    const characters = await db.Character.findAll({
      where: { userId },
      attributes: ['id', 'gameId', 'signature', 'screenshotPath', 'isApproved', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    // 对于签名，读取文件内容
    const charactersWithSignatures = await Promise.all(
      characters.map(async (char) => {
        if (char.signature) {
          try {
            const content = fs.readFileSync(char.signature, 'utf8');
            return { ...char.dataValues, signature: content };
          } catch (e) {
            console.error(`读取签名文件 ${char.signature} 失败`, e);
            return { ...char.dataValues, signature: '' };
          }
        }
        return char.dataValues;
      })
    );
    
    res.status(200).json(charactersWithSignatures);
    
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({ error: '获取角色列表失败' });
  }
};

// 删除角色
exports.deleteCharacter = async (req, res) => {
  try {
    const { characterId } = req.params;
    
    const character = await db.Character.findOne({ 
      where: { id: characterId, userId: req.userId } 
    });
    
    if (!character) {
      return res.status(404).json({ error: '角色不存在或没有权限' });
    }
    
    // 删除签名文件（如果存在）
    if (character.signature) {
      try {
        fs.unlinkSync(character.signature);
      } catch (e) {
        console.error(`删除签名文件失败: ${character.signature}`, e);
      }
    }
    
    // 删除截图文件（如果存在）
    if (character.screenshotPath) {
      const screenshotPath = path.join(__dirname, '../../uploads', character.screenshotPath);
      if (fs.existsSync(screenshotPath)) {
        try {
          fs.unlinkSync(screenshotPath);
        } catch (e) {
          console.error(`删除截图文件失败: ${screenshotPath}`, e);
        }
      }
    }
    
    // 删除角色
    await character.destroy();
    
    res.status(200).json({ message: '角色删除成功' });
    
  } catch (error) {
    console.error('删除角色失败:', error);
    res.status(500).json({ error: '删除角色失败' });
  }
};

// 获取待审核角色（管理员）
exports.getPendingApprovals = async (req, res) => {
  try {
    const characters = await db.Character.findAll({
      where: { isApproved: false },
      include: [
        {
          model: db.User,
          attributes: ['id', 'username'],
          as: 'user'
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // 对于签名，读取文件内容
    const charactersWithSignatures = await Promise.all(
      characters.map(async (char) => {
        if (char.signature) {
          try {
            const content = fs.readFileSync(char.signature, 'utf8');
            return { 
              ...char.dataValues, 
              signature: content,
              signaturePath: char.signature,
              user: char.user ? char.user.dataValues : null
            };
          } catch (e) {
            console.error(`读取签名文件 ${char.signature} 失败`, e);
            return { 
              ...char.dataValues, 
              signature: '',
              user: char.user ? char.user.dataValues : null
            };
          }
        }
        return { 
          ...char.dataValues, 
          user: char.user ? char.user.dataValues : null 
        };
      })
    );
    
    res.status(200).json(charactersWithSignatures);
    
  } catch (error) {
    console.error('获取待审核角色失败:', error);
    res.status(500).json({ error: '获取待审核角色失败' });
  }
};

// 处理审核（管理员）
exports.handleApproval = async (req, res) => {
  try {
    const { characterId } = req.params;
    const { approve } = req.body;
    
    // 查找角色
    const character = await db.Character.findByPk(characterId, {
      include: {
        model: db.User,
        attributes: ['id'],
        as: 'user'
      }
    });
    
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }
    
    // 更新审核状态
    if (approve) {
      character.isApproved = true;
      await character.save();
      
      res.status(200).json({ message: '角色审核通过' });
    } else {
      // 拒绝审核（只是标记为不通过）
      await character.update({ isApproved: false });
      
      res.status(200).json({ message: '角色审核未通过' });
    }
    
  } catch (error) {
    console.error('处理审核失败:', error);
    res.status(500).json({ error: '处理审核失败' });
  }
};

// 获取所有已审核角色（用于主页展示）
exports.getAllApprovedCharacters = async (req, res) => {
  try {
    const characters = await db.Character.findAll({
      where: { isApproved: true },
      include: [
        {
          model: db.User,
          attributes: ['username'],
          as: 'user'
        }
      ],
      attributes: ['id', 'gameId', 'signature', 'screenshotPath', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 50 // 限制返回数量
    });
    
    // 对于签名，读取文件内容
    const charactersWithSignatures = await Promise.all(
      characters.map(async (char) => {
        if (char.signature) {
          try {
            const content = fs.readFileSync(char.signature, 'utf8');
            return { 
              ...char.dataValues, 
              signature: content,
              user: char.user ? char.user.dataValues : null
            };
          } catch (e) {
            console.error(`读取签名文件 ${char.signature} 失败`, e);
            return { 
              ...char.dataValues, 
              signature: '',
              user: char.user ? char.user.dataValues : null
            };
          }
        }
        return { 
          ...char.dataValues, 
          user: char.user ? char.user.dataValues : null 
        };
      })
    );
    
    res.status(200).json(charactersWithSignatures);
    
  } catch (error) {
    console.error('获取已审核角色失败:', error);
    res.status(500).json({ error: '获取已审核角色失败' });
  }
};