# AEGIS Lead Notifier — 系統架構說明

## 系統概述

當訪客在任何一個 Chatbase AI 客服 Agent 上填寫聯絡表單（留 Lead）時，系統會自動：

1. 即時接收通知
2. 抓取訪客留 Lead 前的完整對話紀錄
3. 用 AI 分析訪客意圖
4. 發送 Telegram 通知給業務人員

---

## 整體架構

```
訪客在網站 Chatbase Agent 留 Lead
            ↓
Chatbase 觸發 Webhook（leads.submit）
            ↓
Render.com Node.js Server 接收
            ↓
呼叫 Chatbase API 抓對話紀錄
            ↓
MiniMax M2.5 AI 生成意圖摘要
            ↓
發送 Telegram 通知
```

---

## 服務清單

| 服務 | 用途 | 費用 |
|---|---|---|
| Chatbase | AI 客服 Agent + Webhook | 現有方案 |
| Render.com | Node.js Server 主機 | 免費方案 |
| MiniMax M2.5 | AI 意圖摘要生成 | 依用量計費 |
| Telegram Bot | 通知接收 | 免費 |
| GitHub | 程式碼版本管理 | 免費 |

---

## Telegram 通知格式

```
新 Lead 通知
時間：2026/4/21 下午11:11:53
來源：啟端感覺統合
─────────────────
姓名：顏若萍
Email：ping19820424@gmail.com
電話：0987344655

訪客詢問的問題：
我想預約

AI 意圖分析：
訪客想預約課程體驗
```

---

## 已串接的 Chatbase Agent

| # | Agent 名稱 | Agent ID |
|---|---|---|
| 1 | Zeon Pavilion Square | Id8VKSqDV52fwAvuxaeUO |
| 2 | The Conlay | 7C0w-Fa-09mbTSvmz5dMm |
| 3 | Stark Tower | f60d_vFJxvzF3Awy0-2ca |
| 4 | Queens Residences | n214uxtnn59XRn7OWahya |
| 5 | 啟端感覺統合 | DubaoiHvt2A2B2nts8NB9 |
| 6 | 東盈AIXIA智能系統 | bh6LCjHu--9uXxjwkXODc |
| 7 | 精誠機構 | CjWnDRR4xrB1bfrWpIk3M |
| 8 | 約瑟夫智匯 | RMKy80Ma6hv-I7Cu5wX5o |
| 9 | 貳家國際 AI智能助理 | BZob-istj1e2yAwBDNhqW |
| 10 | SFH | J-av8tHTU8_aKQ_2RHUoC |
| 11 | ASE | fNR3c7pjsiLWpOzF7kcIo |
| 12 | LightWater | _ORQ0wGrUFfuigYbZ2Mwd |

---

## 重要設定資訊

### Webhook URL（每個 Agent 都要設定）
```
https://chatbase-lead-notifier.onrender.com/webhook/chatbase-lead
```

### Render 服務 URL
```
https://chatbase-lead-notifier.onrender.com
```

### GitHub Repo
```
https://github.com/drex640113/chatbase-lead-notifier
```

### Telegram Bot
- Bot 名稱：@Chat_base_leads_notice_bot
- 接收通知：Chat ID 6021395487

---

## 檔案結構

```
chatbase-lead-notifier/
├── src/
│   ├── server.js              # Express 主程式，含測試端點
│   ├── routes/
│   │   └── webhook.js         # Webhook 接收與處理邏輯
│   └── services/
│       ├── chatbase.js        # 呼叫 Chatbase API 抓對話紀錄
│       ├── chatbots.js        # 讀取 chatbots.json 對照表
│       ├── claude.js          # MiniMax AI 意圖摘要
│       ├── leads.js           # 抓取 Leads 清單（備用）
│       └── telegram.js        # 發送 Telegram 通知
├── chatbots.json              # Agent ID 對照表（可自行新增）
├── .env.example               # 環境變數範本
└── README.md
```

---

## 環境變數（Render → Environment）

| 變數名稱 | 說明 |
|---|---|
| `CHATBASE_API_KEY` | Chatbase API Key |
| `CHATBASE_CHATBOT_ID` | 主要 Chatbot ID（測試用） |
| `CHATBASE_WEBHOOK_SECRET` | Webhook 簽名驗證 Secret |
| `MINIMAX_API_KEY` | MiniMax API Key |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token |
| `TELEGRAM_CHAT_ID` | Telegram 接收通知的 Chat ID |

---

## 新增 Agent 流程

### Step 1：在 chatbots.json 新增對照
前往 GitHub → chatbots.json → 點編輯圖示，新增一行：
```json
"新AgentID": "Agent顯示名稱",
```
Commit 後 Render 自動 deploy。

### Step 2：在 Chatbase 設定 Webhook
1. 進入該 Agent → Settings → Webhooks
2. 勾選 **Leads submitted**
3. Endpoint 填入 Webhook URL
4. 按 **Create webhook**

---

## 測試端點

| URL | 說明 |
|---|---|
| `/` | 確認服務是否正常運行 |
| `/test/leads` | 查看 Leads API 原始資料 |
| `/test/conversations` | 查看 Conversations API 原始資料 |
| `/test/run` | 模擬完整流程（發 Telegram） |
| `/test/ai` | 單獨測試 MiniMax AI 摘要 |

---

## 注意事項

- Render 免費方案閒置 50 秒後會休眠，有 Lead 進來時需約 50 秒喚醒，通知會延遲但不會遺失
- 建議設定 UptimeRobot 每 5 分鐘 ping 一次保持服務清醒
- MiniMax API Key 請妥善保管，不要公開在 GitHub
- chatbots.json 中若 Agent ID 不在清單內，通知來源會顯示「未知 Agent」

---

*最後更新：2026/04/23 · RefineLab AEGIS System*
