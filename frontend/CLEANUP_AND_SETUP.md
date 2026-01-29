# 🧹 Frontend Setup Commands

## 如果你已经有一个旧的 React 项目

如果你之前创建过一个简单的 React 前端（如最后一张截图所示），你需要先清理：

### Option 1: 完全替换（推荐）

```bash
# 1. 备份旧项目（如果需要）
mv frontend frontend-old-backup

# 2. 使用新的 frontend 文件夹
# 直接使用下载的 frontend/ 目录

# 3. 进入新目录并安装
cd frontend
npm install
cp .env.example .env
# 编辑 .env 设置 API_URL
npm start
```

### Option 2: 仅替换 src 目录

```bash
# 如果你想保留现有的 package.json 和配置

cd your-existing-frontend-project

# 1. 删除旧的 src 目录
rm -rf src

# 2. 复制新的 src 目录
cp -r path/to/downloaded-frontend/src ./

# 3. 复制新的配置文件
cp path/to/downloaded-frontend/package.json ./
cp path/to/downloaded-frontend/tsconfig.json ./
cp path/to/downloaded-frontend/.env.example ./

# 4. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 5. 配置环境变量
cp .env.example .env
nano .env  # 设置你的 API_URL

# 6. 启动
npm start
```

---

## 全新安装（没有旧项目）

```bash
# 1. 确保你在正确的目录
pwd  # 应该显示你的项目根目录

# 2. 使用下载的 frontend 文件夹
cd frontend

# 3. 安装依赖
npm install

# 4. 配置环境变量
cp .env.example .env

# 编辑 .env
echo 'REACT_APP_API_URL=https://your-api-url/dev' > .env
# 或使用编辑器: nano .env

# 5. 启动开发服务器
npm start
```

---

## 验证安装

运行这些命令确保一切正常：

```bash
# 检查 Node.js 版本（需要 18+）
node --version

# 检查 npm 版本
npm --version

# 检查项目结构
ls -la src/

# 应该看到:
# - components/
# - pages/
# - services/
# - types/
# - App.tsx
# - index.tsx
# - index.css
# - App.css

# 检查依赖是否安装
npm list react react-dom react-router-dom axios

# 检查环境变量
cat .env
```

---

## 如果遇到问题

### 端口已被占用

```bash
# 找到占用 3000 端口的进程
lsof -ti:3000

# 杀死该进程
kill -9 $(lsof -ti:3000)

# 或使用不同端口
PORT=3001 npm start
```

### 依赖安装失败

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### TypeScript 错误

```bash
# 确保 TypeScript 已安装
npm install --save-dev typescript @types/react @types/react-dom

# 重启开发服务器
npm start
```

---

## 项目结构检查

运行这个命令确保所有文件都在正确的位置：

```bash
cd frontend
find src -type f | sort
```

应该看到类似这样的输出：
```
src/App.css
src/App.tsx
src/components/layout/Header.tsx
src/components/layout/Layout.tsx
src/components/layout/Navigation.tsx
src/index.css
src/index.tsx
src/pages/AIInsights.tsx
src/pages/Analysis.tsx
src/pages/Dashboard.tsx
src/pages/Login.tsx
src/pages/LogSymptoms.tsx
src/pages/PetProfile.tsx
src/pages/Register.tsx
src/pages/styles/AllPages.css
src/services/api.ts
src/services/authService.ts
src/services/petService.ts
src/services/symptomService.ts
src/types/index.ts
```

---

## 快速测试

```bash
# 1. 启动开发服务器
npm start

# 2. 在浏览器打开
# http://localhost:3000

# 3. 你应该看到登录页面

# 4. 打开浏览器控制台（F12）
# 检查是否有错误

# 5. 尝试导航到 /register
# http://localhost:3000/register
```

---

## 连接后端

确保后端 API 正在运行：

```bash
# 测试后端 API
curl https://your-api-url/dev/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 如果返回 JSON，说明后端正常
```

---

**准备好了吗？运行 `npm start` 开始开发！** 🚀
