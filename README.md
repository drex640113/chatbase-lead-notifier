# AEGIS Lead Notifier

Chatbase lead webhook server，訪客留 Lead 時自動：
1. 抓取留 Lead 前的完整對話紀錄
2. 用 Claude AI 生成一句話意圖摘要
3. 發送 Email + Line Notify 通知

---

## 快速部署

### 1. 安裝
```bash
git clone <your-repo>
cd chatbase-lead-notifier
npm install
```

### 2. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 填入所有 API keys
nano .env
```

### 3. 啟動
```bash
npm start
# 開發模式（自動重啟）
npm run dev
```

---

## Webhook 設定

Server 啟動後，在 Chatbase 後台設定：

- **Webhook URL**：`https://your-server.com/webhook/chatbase-lead`
- **Trigger**：Lead Submitted
- **Method**：POST

---

## 取得各服務的 Key

### Chatbase API Key
Chatbase Dashboard → Settings → API Keys

### Gmail App Password
1. Google 帳號 → 安全性
2. 兩步驟驗證 → 應用程式密碼
3. 建立新密碼（選擇「郵件」）

### Line Notify Token
1. 前往 https://notify-bot.line.me/my/
2. 登入 → 「發行權杖」
3. 選擇要通知的聊天室（個人或群組）

### Anthropic API Key
https://console.anthropic.com/api-keys

---

## 部署到 Vultr / VPS

```bash
# 安裝 PM2 保持後台執行
npm install -g pm2
pm2 start src/server.js --name aegis-lead
pm2 save
pm2 startup

# 查看 log
pm2 logs aegis-lead
```

### Nginx 反向代理（可選）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 通知格式

### Email
- 標題：`🔔 新 Lead：王小明（ming@example.com）`
- 內容：訪客資訊 + AI 摘要 + 完整對話紀錄（HTML 格式）

### Line Notify
- 第一則：訪客資訊 + AI 意圖摘要
- 第二則：對話紀錄（超過 800 字自動截斷，詳見 Email）

---

## 檔案結構

```
chatbase-lead-notifier/
├── src/
│   ├── server.js              # Express 入口
│   ├── routes/
│   │   └── webhook.js         # Webhook 主邏輯
│   └── services/
│       ├── chatbase.js        # 取對話紀錄
│       ├── claude.js          # AI 摘要
│       ├── email.js           # Email 通知
│       └── line.js            # Line Notify
├── .env.example
├── package.json
└── README.md
```
