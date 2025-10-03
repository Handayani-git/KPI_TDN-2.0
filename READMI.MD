
# 📊 KPI Dashboard for TDN (Tasik Digital Native)

An internal, full-stack serverless web application built to monitor, report, and analyze Key Performance Indicators (KPIs) for the marketing and sales teams at **TDN (Tasik Digital Native)**. Built with React and Firebase.

---

## ✨ Key Features

-    **Role-Based Access Control**: Three distinct roles (Manager, Customer Service, Advertiser) with customized views and permissions.
-    **Dynamic Dashboard**: Real-time data visualization with KPI cards, period-over-period comparison, and interactive charts.
-   **Internal Reporting System**: Dedicated forms for the Advertiser and CS teams to input daily performance metrics directly into the system.
-    **Data Management (CRUD)**: Full functionality for the Manager role to create, read, update, and delete master data (Advertisers & CS).
-    **Advanced Filtering**: The ability to filter all data by a custom date range or view overall data ("All Time").
-    **Serverless Backend**: Fully powered by **Firebase** (Authentication & Cloud Firestore) for security and scalability.

---

## 📸 Application Screenshots

Here are some views of the TDN KPI Dashboard application:


> **Note**: Create a `docs` folder in your project root and save the screenshots there, or adjust the image paths accordingly.

---

## 🛠️ Tech Stack

-   **Frontend**: React.js
-   **Backend & Database**: Firebase (Authentication, Cloud Firestore)
-   **Styling**: CSS Modules
-   **Charting**: Chart.js (`react-chartjs-2`)
-   **Date Filtering**: `react-date-range` & `date-fns`

---

## 📂 Folder Structure

```
/
├── functions/      # (Optional) For future Firebase Cloud Functions
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   ├── firebase.js
│   └── App.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

A guide to run this project in a local environment.

### Prerequisites

-   Node.js (v16 or newer)
-   npm or yarn

### Installation

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/Ikbal-hand/KPI_TDN.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd KPI-TDN
    ```
4.  **Dive to frontend folder:**
    ```bash
    cd frontend
    ```

3.  **Install all dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Firebase:**
    -   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    -   Enable **Authentication** (Email/Password) and **Firestore Database** (test mode).
    -   Copy your Firebase configuration and paste it into the `src/firebase.js` file.

5.  **Run the application:**
    ```bash
    npm start
    ```
    The application will be running at `http://localhost:3000`.

---

## ⚙️ User Workflow

1.  **Manager**:
    -   Logs in to view the overall business dashboard.
    -   Analyzes data using filters for date, CS, and search.
    -   Manages master data for Advertisers and CS via the "Kelola" menus.

2.  **Customer Service (CS)**:
    -   Logs in to view their personal performance dashboard.
    -   Accesses the "Lapor Leads" and "Lapor Penjualan" menus to input daily data.

3.  **Advertiser (ADV)**:
    -   Logs in to view their personal campaign performance dashboard.
    -   Accesses the "Lapor Kinerja Iklan" menu to input daily ad spend.

---

##  🗺️ Roadmap

-   ✅ Add more data visualizations (Bar Charts).
-   ✅ Move heavy aggregation logic to Firebase Cloud Functions.
-   ✅ Enhance UI/UX with loading animations and empty state views.