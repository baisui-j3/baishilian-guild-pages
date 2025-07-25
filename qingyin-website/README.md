剑网三浩气《清音》帮会主页



本项目由天鹅坪·清音帮会发起，Deepseek承接开发完成，历时10分钟。感受AI科技！



项目概述



剑网三浩气《清音》帮会主页是一个专为游戏帮会设计的社区平台，允许帮会成员绑定游戏角色、上传个性签名和名片截图，并在主页展示通过审核的内容。管理员拥有审核内容、管理用户和设置网站主题的权限。



功能列表



用户功能



• 用户注册与登录



• 绑定游戏角色（最多3个）



• 上传个性签名（50字以内）



• 上传名片截图



• 修改密码



• 注销账户



角色管理



• 添加/删除游戏角色



• 更新个性签名



• 上传/更新名片截图



• 查看角色状态（审核中/已通过）



管理员功能



• 审核用户上传内容（签名和截图）



• 查找用户并重置密码



• 修改网站主题颜色（7种可选）



• 查看待审核内容列表



展示功能



• 主页展示已审核的名片截图



• 显示游戏ID和个性签名



• 响应式设计，适配不同设备



技术栈



前端



• React 18



• React Router 6



• Axios



• Context API（状态管理）



• CSS（主题系统）



后端



• Node.js



• Express.js



• SQLite（数据库）



• Multer（文件上传）



• JWT（认证）



安装与运行



前置条件



• Node.js (v14+)



• npm (v6+)



安装步骤



1\. 克隆仓库：

git clone https://github.com/your-repo/qingyin-website.git

cd qingyin-website





2\. 安装前端依赖：

cd client

npm install





3\. 安装后端依赖：

cd ../server

npm install





4\. 创建必要目录：

mkdir -p uploads signatures





运行项目



1\. 启动后端服务器：

cd server

npm start





2\. 启动前端应用：

cd client

npm start





3\. 访问应用：

• 前端：http://localhost:3000



• 后端：http://localhost:5000



管理员账户



• 账号：admin



• 密码：admin



项目结构





qingyin-website/

├── client/                      # 前端React应用

│   ├── public/                  # 公共资源

│   ├── src/                     # 源代码

│   │   ├── components/          # 可复用组件

│   │   ├── context/             # 上下文

│   │   ├── pages/               # 页面组件

│   │   ├── services/            # API服务

│   │   ├── styles/              # 样式文件

│   │   ├── App.jsx              # 主应用组件

│   │   └── index.js             # 入口文件

│   └── package.json             # 前端依赖

├── server/                      # 后端Node.js应用

│   ├── config/                  # 配置文件

│   ├── controllers/             # 控制器

│   ├── middleware/              # 中间件

│   ├── models/                  # 数据模型

│   ├── routes/                  # 路由

│   ├── uploads/                 # 上传文件存储

│   ├── signatures/              # 签名文件存储

│   ├── app.js                   # Express应用

│   └── package.json             # 后端依赖

├── database/                    # 数据库文件

│   └── qingyin.db               # SQLite数据库

├── .gitignore                   # Git忽略文件

└── README.md                    # 项目文档





特别鸣谢



本项目由天鹅坪·清音帮会发起，Deepseek承接开发完成，历时10分钟。感受AI科技！



贡献指南



欢迎提交Pull Request！请确保：

1\. 代码符合项目风格

2\. 包含必要的测试

3\. 更新相关文档



许可证



本项目采用 LICENSE。

