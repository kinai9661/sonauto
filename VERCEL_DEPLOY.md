# 🚀 Vercel 部署指南

本文檔提供 Sonauto API 中轉服務部署到 Vercel 的完整步驟。

## 📋 目錄

- [Vercel vs Cloudflare Workers](#vercel-vs-cloudflare-workers)
- [快速部署](#快速部署)
- [詳細步驟](#詳細步驟)
- [環境變量配置](#環境變量配置)
- [本地開發](#本地開發)
- [故障排除](#故障排除)

---

## 🎯 Vercel vs Cloudflare Workers

| 特性 | Vercel | Cloudflare Workers |
|------|--------|-------------------|
| **冷啟動** | ~100-300ms | <10ms |
| **全球節點** | 70+ | 330+ |
| **執行時間** | 10s (Hobby), 60s (Pro) | 30s (CPU) |
| **免費額度** | 100GB-hours/月 | 100,000 請求/天 |
| **KV 存儲** | Vercel KV (Redis) | Workers KV |
| **部署方式** | Git 集成/CLI | Wrangler CLI / Git |
| **價格** | $20/月 Pro | $5/月 Paid |

**選擇建議:**
- ✅ 選擇 **Vercel**：如果你已經在使用 Next.js 或需要較長執行時間
- ✅ 選擇 **Cloudflare**：如果你需要極低延迟和全球分佈

---

## ⚡ 快速部署

### 方法 1：Vercel 控制台部署（推薦）

1. **訪問** [Vercel Dashboard](https://vercel.com/dashboard)
2. **點擊** "Add New" → "Project"
3. **導入** GitHub 倉庫: `kinai9661/sonauto`
4. **配置環境變量**：
   - `SONAUTO_API_KEY` = 你的 Sonauto API Key
5. **點擊** "Deploy"

✨ **部署完成！**你的 API 現在可在 `https://your-project.vercel.app` 訪問

### 方法 2：Vercel CLI 部署

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登錄
vercel login

# 3. 部署
vercel --prod
```

---

## 🛠️ 詳細步驟

### 步驟 1：克隆倉庫

```bash
# 克隆你的 GitHub 倉庫
git clone https://github.com/kinai9661/sonauto.git
cd sonauto

# 安裝依賴
npm install
```

### 步驟 2：創建 Vercel KV 數據庫

#### 方法 A：Vercel Dashboard

1. 訪問 [Vercel Storage](https://vercel.com/dashboard/stores)
2. 點擊 **Create Database**
3. 選擇 **KV**
4. 輸入名稱：`sonauto-tasks`
5. 選擇區域（建議：`iad1` 或 `hkg1`）
6. 點擊 **Create**

#### 方法 B：Vercel CLI

```bash
# 創建 KV 數據庫
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

### 步驟 3：配置環境變量

#### 方法 A：通過 Dashboard

1. 在 Vercel 項目中點擊 **Settings** → **Environment Variables**
2. 添加以下變量：

| 變量名 | 值 | 環境 |
|---------|-----|------|
| `SONAUTO_API_KEY` | 你的 Sonauto API Key | Production, Preview, Development |
| `KV_REST_API_URL` | 自動生成 | 所有 |
| `KV_REST_API_TOKEN` | 自動生成 | 所有 |

#### 方法 B：通過 CLI

```bash
# 添加 Sonauto API Key
vercel env add SONAUTO_API_KEY
# 輸入你的 API Key，選擇所有環境
```

### 步驟 4：連接 KV 數據庫到項目

1. 在 Vercel 項目設置中
2. 點擊 **Storage** 標籤
3. 點擊 **Connect Store**
4. 選擇你剛創建的 `sonauto-tasks` KV
5. 點擊 **Connect**

### 步驟 5：部署

```bash
# 部署到生產環境
vercel --prod
```

**輸出示例：**
```
🔗  Linked to kinai9661/sonauto (created .vercel)
📡  Deploying to production...
✅  Deployment ready [52s]
https://sonauto.vercel.app
```

---

## 💻 本地開發

### 啟動開發伺服器

```bash
# 使用 Vercel CLI
npm run dev:vercel

# 或直接使用
vercel dev
```

訪問 http://localhost:3000 查看 API 主頁。

### 本地測試 API

```bash
# 測試歌曲生成
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "歡快的生日歌",
    "tags": ["pop", "happy"],
    "num_songs": 1
  }'

# 預期輸出
{
  "task_id": "xxx-yyy-zzz",
  "status": "RECEIVED",
  "message": "任務已創建，正在處理中"
}
```

```bash
# 查詢狀態
curl "http://localhost:3000/api/status?task_id=xxx-yyy-zzz"

# 獲取結果
curl "http://localhost:3000/api/result?task_id=xxx-yyy-zzz"

# 查詢餘額
curl "http://localhost:3000/api/balance"
```

---

## 🔐 環境變量配置

### 必需變量

| 變量名 | 說明 | 獲取方式 |
|---------|------|----------|
| `SONAUTO_API_KEY` | Sonauto API 密鑰 | [Sonauto Developers](https://sonauto.ai/developers) |
| `KV_REST_API_URL` | Vercel KV API URL | 自動生成（連接 KV 後） |
| `KV_REST_API_TOKEN` | Vercel KV API Token | 自動生成（連接 KV 後） |

### 可選變量

| 變量名 | 說明 | 預設值 |
|---------|------|--------|
| `NODE_ENV` | 節點環境 | `production` |
| `LOG_LEVEL` | 日誌級別 | `info` |

---

## 🔧 GitHub Actions 自動部署

Vercel 自動與 GitHub 集成，無需額外配置！

### 已启用功能

- ✅ **自動部署**：推送到 `main` 分支自動部署生產環境
- ✅ **PR 預覽**：每個 Pull Request 自動生成預覽 URL
- ✅ **部署評論**：自動在 PR 中評論預覽鏈接
- ✅ **回滝支持**：一鍵回滝到任意版本

### 查看部署狀態

1. 訪問 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊你的項目
3. 查看 **Deployments** 標籤

---

## 📊 監控和日誌

### 查看實時日誌

```bash
# 使用 Vercel CLI
vercel logs

# 或在 Dashboard 中
# Deployments → 點擊部署 → Runtime Logs
```

### 查看效能指標

1. 訪問 [Vercel Analytics](https://vercel.com/dashboard/analytics)
2. 查看：
   - 請求數
   - 響應時間
   - 錯誤率
   - 地理分佈

### KV 數據查看

```bash
# 使用 Vercel CLI 查看 KV 數據
vercel env ls
```

或在 Dashboard 中：
1. Storage → 點擊 KV 數據庫
2. 查看 Data 標籤

---

## 🔗 自定義域名

### 添加自定義域名

1. 在 Vercel 項目設置中
2. 點擊 **Domains**
3. 點擊 **Add**
4. 輸入你的域名：`api.yourdomain.com`
5. Vercel 會提供 DNS 配置指引
6. 在你的 DNS 提供商添加 CNAME 記錄

**DNS 配置示例：**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

---

## ❓ 故障排除

### 問題 1："Module not found: @vercel/kv"

**原因：**未安裝依賴

**解決：**
```bash
npm install @vercel/kv
git add package.json package-lock.json
git commit -m "Add @vercel/kv dependency"
git push
```

### 問題 2："KV_REST_API_URL is not defined"

**原因：**KV 數據庫未連接到項目

**解決：**
1. 在 Vercel Dashboard 中連接 KV Store
2. 或手動添加環境變量

### 問題 3："Sonauto API error: Unauthorized"

**原因：**API Key 無效或未配置

**解決：**
```bash
# 重新添加 API Key
vercel env rm SONAUTO_API_KEY
vercel env add SONAUTO_API_KEY

# 重新部署
vercel --prod
```

### 問題 4：冷啟動時間過長

**原因：**Serverless Functions 冷啟動

**解決方案：**
1. 升級到 Pro 計劃（減少冷啟動）
2. 使用 Vercel Edge Functions（更快）
3. 或使用 Cloudflare Workers（極低延迟）

### 問題 5：API 請求超時

**原因：**超過 10 秒執行時間限制

**解決：**
- Hobby 計劃：10s 限制
- Pro 計劃：60s 限制
- 建議使用異步輪詢模式

---

## 💰 成本分析

### Vercel Hobby（免費）

- ✅ 100 GB-hours/月 執行時間
- ✅ 100 GB 帶寬
- ✅ 無限請求
- ✅ 1 GB KV 存儲
- ⚠️ 10s 執行時間限制

**適合：**個人項目、測試環境

### Vercel Pro ($20/月)

- ✅ 1000 GB-hours/月
- ✅ 1 TB 帶寬
- ✅ 60s 執行時間
- ✅ 優先支持

**適合：**生產環境、商業項目

---

## 📚 相關資源

- [Vercel 官方文檔](https://vercel.com/docs)
- [Vercel KV 文檔](https://vercel.com/docs/storage/vercel-kv)
- [Sonauto API 文檔](https://sonauto.ai/developers)
- [GitHub 倉庫](https://github.com/kinai9661/sonauto)

---

## ✅ 部署檢查清單

完成以下步驟後，你的 Vercel 部署就完成了：

- [ ] 安裝 Vercel CLI
- [ ] 登錄 Vercel 帳號
- [ ] 創建 Vercel KV 數據庫
- [ ] 連接 KV 到項目
- [ ] 配置 `SONAUTO_API_KEY`
- [ ] 本地測試通過
- [ ] 部署到生產環境
- [ ] API 端點響應正常
- [ ] （可選）綁定自定義域名

---

**✨ 恐喜！你的 Sonauto API 中轉服務已成功部署到 Vercel！**

需要幫助？查看 [GitHub Issues](https://github.com/kinai9661/sonauto/issues) 或提交問題。