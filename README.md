<p align="center">
  <img src="https://github.com/Ikbal-hand/KPI_TDN/blob/main/frontend/src/images/logo.png" />
</p>

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS Modules](https://img.shields.io/badge/CSS%20Modules-000000?style=for-the-badge&logo=css-modules&logoColor=white)](https://github.com/css-modules/css-modules)

</div>

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

### Login Page
![alt text](https://github.com/Ikbal-hand/KPI_TDN/blob/main/frontend/src/images/Login.png)

### Manager Dashboard
![alt text](https://github.com/Ikbal-hand/KPI_TDN/blob/main/frontend/src/images/Manager.png)

### Daily Report
![alt text](https://github.com/Ikbal-hand/KPI_TDN/blob/main/frontend/src/images/Report.png)

### Manage Your team
![alt text](https://github.com/Ikbal-hand/KPI_TDN/blob/main/frontend/src/images/team.png)


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
## ⚙️ Application Data Flow & Metric Calculation

This application transforms daily operational inputs into a real-time analytical dashboard for managers. Here is how the data flows through the system:

### 1. Data Input (Daily Reporting)
The process begins with the operational teams inputting their daily performance metrics through dedicated forms.

-   **Advertiser (ADV) Input**: An ADV user logs in, navigates to the "Lapor Kinerja Iklan" page, and submits a report containing the `date`, `advertiserId`, `platform`, `product`, and `spend`. This action creates a new document in the **`adSpends`** collection in Firestore.

-   **Customer Service (CS) Input**: A CS user logs in and uses two separate forms:
    1.  **"Lapor Leads"**: They submit a report with the `date`, `csId`, `sourceAdvertiserId`, `product`, `sourcePlatform`, and `leadCount`. This creates a new document in the **`leads`** collection.
    2.  **"Lapor Penjualan"**: For each sale, they submit a report with the `date`, `csId`, `advertiserId`, `product`, `quantity`, and `omset`. This creates a new document in the **`sales`** collection.

### 2. Data Processing (Backend Logic)
Once the data is in Firestore, the application's service layer (`managerService.js`, etc.) handles the processing when a dashboard is loaded.

-   **Data Fetching**: When the Manager loads their dashboard for a specific date range, the service queries and fetches all relevant documents from the `adSpends`, `leads`, and `sales` collections within that period.
-   **In-Memory Aggregation**: The service then processes this raw data:
    -   It `SUM`s all `spend` from `adSpends` by advertiser.
    -   It `SUM`s all `omset`, `quantity`, and counts `closing` events (one per sale document) from `sales` by advertiser and by CS.
    -   It `SUM`s all `leadCount` from `leads` by advertiser and by CS.

### 3. Metric Calculation
Using the aggregated data, the `kpiService.js` calculates the key performance metrics:

-   **ROAS (Return on Ad Spend)**
    -   **Question:** How much revenue is generated for every Rupiah spent on ads?
    -   **Formula:** `Total Gross Omset / Total Budget Ads`
    -   **Example:** Omset `Rp 20jt` / Budget `Rp 5jt` = **ROAS 4.0**.

-   **CAC ADV (%) (Advertising Cost of Sales)**
    -   **Question:** What percentage of gross revenue is spent on ad costs?
    -   **Formula:** `(Total Budget Ads / Total Gross Omset) * 100%`
    -   **Example:** `(Rp 5jt / Rp 20jt) * 100%` = **25%**.

-   **Closing Rate**
    -   **Question:** How effectively does a CS agent convert leads into sales?
    -   **Formula:** `(Total Closing / Total Leads) * 100%`
    -   **Example:** `30 Closings / 150 Leads * 100%` = **20%**.

-   **Average Products per Transaction**
    -   **Question:** On average, how many products are sold in a single transaction?
    -   **Formula:** `Total Quantity / Total Closing`
    -   **Example:** `45 Products / 30 Closings` = **1.5 Products/Transaction**.

### 4. Data Visualization (Dashboard Display)
The processed data is sent back to the React components to be displayed to the Manager in the form of KPI cards, charts, and summary tables. This workflow ensures that any new report submitted by the team immediately updates the analytical insights on the Manager's dashboard.

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
    cd KPI_TDN
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

5.  **Configure Firebase Project:**
    -   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    -   In your project, enable **Authentication** (with the Email/Password provider) and **Cloud Firestore** (start in test mode).
    -   Copy your Firebase configuration credentials.
    -   Paste your credentials into the `src/firebase.js` file.

5.  **Setup Firestore Collections:**
    Before running the application, you need to create the necessary collections and a few documents in your Firestore database.

    #### ERD Diagram
      ![alt text](https://github.com/Ikbal-hand/KPI_TDN/blob/main/frontend/src/images/ERD.png)
    
    #### Master Data
    -   **`advertisers`**:
        -   Stores the list of advertisers.
        -   *Fields*: `name` (string), `email` (string), `photoURL` (string, optional).
    -   **`customerServices`**:
        -   Stores the list of Customer Service agents.
        -   *Fields*: `name` (string), `email` (string), `photoURL` (string, optional).
    -   **`users`**:
        -   Links authenticated users to their roles and data.
        -   The **Document ID** for each document must be the **User UID** from Firebase Authentication.
        -   *Fields*: `role` (string: "manager", "cs", or "advertiser"), `email` (string), `advertiserId` or `csId` (string, optional).

    #### Transactional Data
    -   **`adSpends`**:
        -   Stores daily ad spend reports submitted by the ADV team.
        -   *Fields*:
            -   `date` (timestamp): The date of the report.
            -   `advertiserId` (string): The ID of the advertiser who submitted the report (linked to the `advertisers` collection).
            -   `platform` (string): The ad platform used (e.g., "Meta", "TikTok").
            -   `product` (string): The product being advertised.
            -   `spend` (number): The total amount spent.
    -   **`leads`**:
        -   Stores daily lead reports submitted by the CS team.
        -   *Fields*:
            -   `date` (timestamp): The date the leads were received.
            -   `csId` (string): The ID of the CS agent who received the leads (linked to `customerServices`).
            -   `sourceAdvertiserId` (string): The ID of the advertiser whose campaign generated the leads.
            -   `sourcePlatform` (string): The platform the leads came from.
            -   `product` (string): The product the leads were for.
            -   `leadCount` (number): The total number of leads.
    -   **`sales`**:
        -   Stores individual sales/closing reports submitted by the CS team.
        -   *Fields*:
            -   `date` (timestamp): The date of the sale.
            -   `csId` (string): The ID of the CS agent who closed the sale.
            -   `advertiserId` (string): The ID of the advertiser whose campaign is credited for the sale.
            -   `product` (string): The name of the product sold.
            -   `sku` (string): The SKU of the product sold.
            -   `quantity` (number): The number of items sold in the transaction.
            -   `omset` (number): The total revenue from the transaction.

7.  **Run seed for add some data into database
     ```bash
     node seed.js
     ``` 
  
9.  **Run the application:**
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
