
# 🗑️ Waste Management Automation for Dark Stores

![Hackron 2025](https://img.shields.io/badge/Techathon-2025-blue.svg) ![Status](https://img.shields.io/badge/Status-Completed-success.svg)

## 🚀 Project Overview
**Waste Management Automation for Dark Stores** is an AI-powered web application designed to optimize waste tracking, reduce food wastage, and enhance sustainability in dark stores (micro-fulfillment centers). The system automates waste categorization, provides predictive analytics, and integrates with IoT sensors to monitor and reduce waste in real-time.

## 🏆 TROPHIES
[![trophy](https://github-profile-trophy.vercel.app/?username=OneTeraByte7&theme=onedark)](https://github.com/ryo-ma/github-profile-trophy)


## 🏆 Hackathon Submission
- **Hackathon Name:** CodeClash2025
- **Problem Statement:** Waste Management Automation for Dark Stores
- **Team Name:** Coding Knights
- **Project Duration:** 24 Hours

## 🎯 Key Features
✅ **AI-Powered Waste Classification**: Automatically detects and classifies waste using image recognition.
✅ **Real-Time Waste Monitoring**: IoT-enabled sensors track waste levels and send alerts.
✅ **Predictive Analytics**: Machine learning models analyze trends to reduce wastage.
✅ **Inventory Expiry Alerts**: Prevents unnecessary waste by notifying about soon-to-expire products.
✅ **User Dashboard**: Provides waste insights, analytics, and reports.
✅ **Sustainability Score**: Tracks waste reduction performance over time.

## 🛠️ Tech Stack
### 🌐 Frontend:
- React.js (with Tailwind CSS for UI styling)
- Chart.js for data visualization

### ⚙️ Backend:
- Node.js with Express.js
- MongoDB for database storage
- Socket.io for real-time updates
# 🗑️ Waste Management Automation for Dark Stores

![Hackron 2025](https://img.shields.io/badge/Techathon-2025-blue.svg) ![Status](https://img.shields.io/badge/Status-Completed-success.svg)

<img width="1024" height="361" alt="banner" src="https://github.com/user-attachments/assets/223b98ee-5162-42c4-b689-4eee1ec14710" />

## 🚀 Project Overview

This repository contains an AI-powered web application that automates waste classification, tracking, and decision-making for dark stores (micro-fulfillment centers). The platform combines rule-based shelf-life classification, machine learning insights, and real-time dashboards to reduce food wastage and improve operational efficiency.

## 🎯 Key Objectives

- 📦 Minimize expired goods using predictive classification
- ♻️ Improve sustainability through waste identification and separation
- 📈 Use data & AI to guide restocking and clearance decisions
- 🧭 Enable store-wise performance tracking with visual dashboards

## 🎯 Core Features

- 🚦 Smart Shelf-Life Classification (Red / Yellow / Green)
- 🗺️ Waste Generation Maps with store heatmaps
- 📦 Real-time inventory monitoring and expiry alerts
- 🤖 AI-powered insights for demand/expiry correlation and clearance recommendations
- 📊 Admin dashboards, reports, and sustainability scoring

## 🛠️ Tech Stack

- Frontend: React.js, Tailwind CSS, Chart.js / Plotly
- Backend: Node.js + Express (API), Python + Flask (ML services)
- Database: MongoDB or PostgreSQL
- AI: TensorFlow / PyTorch, OpenCV for image processing
- Real-time: Socket.io / MQTT for IoT integration

## 🔧 Installation & Quick Start

1. Clone the repository
```bash
git clone https://github.com/OneTeraByte7/Hackron2025.git
cd Hackron2025
```
2. Install server deps
```bash
cd server
npm install
pip install -r requirements.txt
```
3. Install client deps and start
```bash
cd ../client
npm install
npm start
```
4. Start the backend
```bash
cd ../server
node server.js
```

## 📊 System Architecture
```mermaid
graph TD;
   User-->Frontend;
   Frontend-->|API Calls|Backend;
   Backend-->|Database Requests|Database[(MongoDB/Postgres)];
   Backend-->|ML Processing|MLServer[Python ML Services];
   Backend-->|IoT Communication|MQTT[MQTT Broker];
```

## 🖥️ Example Workflows

- Daily shelf-life tagging and database update
```bash
python server/classify_products.py --store_id=store_102
python server/update_inventory_tags.py
python server/run_ai_insights.py --store_id=store_102
curl -X POST http://localhost:5000/refresh-dashboard
```

## 🎥 Demo & Screenshots

Screenshots and demo assets are stored in the repository attachments and build artifacts in `client/build`.

## 📅 Future Enhancements

- Integration with live ordering APIs (e.g., Blinkit)
- Mobile app for on-site tagging
- Auto-schedule waste pickups based on volume thresholds
- Notifications and automated clearance campaigns

---

If you'd like, I can stage and commit this resolved [README.md](README.md) for you and finish the merge. See next steps below.

