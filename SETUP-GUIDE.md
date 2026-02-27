# 🧋 Topepop Tea — Google Sheets Setup Guide
## Connect your loyalty app to Google Sheets (15 min)

---

## STEP 1 — Create your Google Sheet

1. Go to **sheets.google.com** and click **"+ Blank"**
2. Name it: `Topepop Tea Members`
3. Leave it open — we'll come back to it

---

## STEP 2 — Open Apps Script

1. In your Google Sheet, click the menu: **Extensions → Apps Script**
2. A new tab opens with a code editor
3. Delete everything in the editor (select all → delete)

---

## STEP 3 — Paste the code

1. Open the file **Code.gs** (included with your app files)
2. Copy ALL the text inside it
3. Paste it into the Apps Script editor
4. Click the 💾 **Save** button (or Ctrl+S)
5. Name the project: `Topepop Tea Loyalty`

---

## STEP 4 — Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click the ⚙️ gear icon next to "Type" → select **"Web app"**
3. Fill in:
   - **Description:** `Topepop Tea API`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← important!
4. Click **"Deploy"**
5. Google will ask you to **authorise** — click "Authorise access"
   - Choose your Google account
   - Click "Advanced" → "Go to Topepop Tea Loyalty (unsafe)" → "Allow"
   *(This is normal for your own script — Google just warns you)*
6. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/XXXXXXXXXX/exec`
   **Save this URL — you need it in Step 5!**

---

## STEP 5 — Paste URL into your app

1. Open **admin.html** in your browser
2. Log in (password: boba1234)
3. Scroll down to **⚙️ Settings**
4. Paste your Web app URL into **"Google Apps Script URL"**
5. Click **💾 Save Settings**
6. The app will connect and show **"Synced ✓"** in green

---

## STEP 6 — Test it!

1. Open **index.html** (customer page)
2. Register a test member with your own name/phone
3. Go back to **admin.html**
4. Click **🔄 Refresh** — you should see your test member appear
5. Open your **Google Sheet** — you should see a "Members" tab with the data!

---

## ✅ You're done!

From now on:
- Every signup, stamp, and redemption **syncs to Google Sheets automatically**
- Open admin on **any device** → click **🔄 Refresh** → see live data
- Your Google Sheet is your live database — you can view, filter, sort anytime
- The app also works **offline** if internet drops — it saves locally and you can manually refresh when back online

---

## 🔧 If something goes wrong

**"Synced ✓" not showing?**
→ Check the URL in Settings is correct (no extra spaces)
→ Make sure "Who has access" was set to "Anyone" in Step 4

**Google asking for permission again?**
→ Just allow it again — this happens if you re-deploy

**Want to re-deploy after changes to Code.gs?**
→ Extensions → Apps Script → Deploy → Manage deployments → Edit → New version → Deploy

---

## 📋 Your Google Sheet columns explained

| Column | What it means |
|--------|--------------|
| ID | Unique customer ID (auto) |
| Name | Customer name |
| Phone | Phone number |
| Birthday | Birthday date |
| Stamps | Total stamps earned |
| JoinDate | When they registered |
| PendingReward | Yes/No — free drink waiting |
| LastVisit | Last time they got a stamp |

The **History** sheet logs every stamp, signup, and redemption with timestamps.
