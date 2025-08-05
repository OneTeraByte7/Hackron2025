# 🗑️ Waste Management Automation in Dark Stores

**Problem Statement by Blinkit to solve Real World Problems**

---

## 🚀 Overview

Dark stores are the backbone of fast delivery services like Blinkit. However, managing perishable inventory efficiently remains a major challenge. This project addresses the **automation of waste classification, tracking, and decision-making** using smart categorization, AI insights, and centralized dashboards.

The system classifies products based on their **manufacturing (MFG)** and **expiry dates** into clear actionable categories:

- 🔴 **Red:** Products past expiry or expiring soon — needs immediate removal
- 🟡 **Yellow:** Products nearing expiry — needs close monitoring
- 🟢 **Green:** Products well within shelf life — safe to keep/sell

The platform supports admins with real-time dashboards, waste maps, inventory views, and predictive AI to reduce losses and enhance operational efficiency.

---

## 🎯 Key Objectives

- 📦 **Minimize expired goods** via predictive classification
- ♻️ **Improve sustainability** by identifying and separating waste types
- 📈 **Use data & AI** to guide restocking and clearance decisions
- 🧭 **Enable store-wise performance tracking** with visual dashboards

---

## 🔍 Core Features

### 1. 🚦 Smart Shelf Life Classification

Every product is categorized into:

- 🔴 **Red:** Near/past expiry — flagged for removal  
- 🟡 **Yellow:** Approaching expiry — warning triggered  
- 🟢 **Green:** Healthy shelf life — marked safe

This is done automatically at scale using date-based rules.

---

### 2. 🗺️ Waste Generation Maps

Admins can view a **map-based dashboard** showing:

- Waste type per store:  
  - 🥦 **Organic**  
  - 🧃 **Non-organic**  
  - 🧴 **Plastic**  
  - 🔄 **Recyclable**

- Total waste volume by region
- Heatmaps showing high-waste areas

This helps identify where waste is being mismanaged.

---

### 3. 📦 Real-Time Inventory Management

Admins can:

- View all product data: name, category, quantity, MFG, EXP dates
- Search and filter by expiry category (Red, Yellow, Green)
- Track inventory health across all stores from one dashboard

---

### 4. 🤖 AI-Powered Waste Insights

An AI engine gives smart suggestions and predictions:

- 📊 **Sales-Demand-Expiry correlation**  
- 🛒 Suggests **which products** are likely to expire based on sales rate  
- 📉 Recommends **clearance discounts** or **reorder postponement**  
- 📦 Detects **waste trends** per category and region

AI helps reduce waste and optimize restocking automatically.

---

## 🧑‍💼 Who Uses This?

- **Store Managers:** Get alerts for expiry risk, clearance tasks  
- **Admin/Operations:** Monitor waste trends, store performance, and compliance  
- **Procurement:** Adjust stock orders based on expiry predictions  

---

## 🖥️ Tech Stack Overview

- 🐍 Python + Flask backend  
- 📊 MongoDB or PostgreSQL for product and waste data  
- 📈 Plotly or Leaflet.js for maps & dashboards  
- 🧠 TensorFlow/PyTorch for AI insights module  
- 🧪 Bash/CLI scripts for automation and cron jobs

---

## 💻 Sample Bash Workflow

Here's how a store might run the script daily:

```bash
echo "🗂️ Starting Daily Waste Sorter..."

# Run shelf-life classification
python classify_products.py --store_id=store_102
```

# Update database with red/yellow/green tagging
```bash
python update_inventory_tags.py
```
# Run AI prediction for upcoming expiries
```bash
python run_ai_insights.py --store_id=store_102
```

# Push dashboard refresh
```bash
curl -X POST http://localhost:5000/refresh-dashboard
```

## 📅 Future Enhancements:
🔗 Integration with Blinkit's live ordering APIs
📲 Mobile version for on-site waste tagging
📤 Auto-schedule waste pickups based on volume thresholds
📢 Notification system for Red products nearing sell-by deadline


