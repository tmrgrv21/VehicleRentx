# 🚀 How to Run VehicleRentX in VS Code (Step-by-Step Guide)

This guide will help you run the complete **VehicleRentX** project (Spring Boot Backend + React Frontend + MySQL Database) easily inside **Visual Studio Code**.

---

## 🛠️ Prerequisites
Make sure you have installed on your computer:
1. **VS Code** (Visual Studio Code)
2. **Java 21 or Java 25 JDK**
3. **Node.js** (v18 or higher)
4. **XAMPP Server** (for MySQL)

---

## 📂 Step 1: Open Project in VS Code
1. Open **VS Code**.
2. Go to **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select your project folder: `VehicleRentx`.

---

## 🛢️ Step 2: Start MySQL Database
Open **XAMPP Control Panel** and click **Start** next to **MySQL**.

*(Alternatively, you can start MySQL directly inside a VS Code Terminal)*:
```powershell
C:\xampp\mysql\bin\mysqld.exe --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
```

---

## ☕ Step 3: Run Spring Boot Backend Server
1. In VS Code, open a new Terminal (`Ctrl + ~` or top menu: **Terminal** > **New Terminal**).
2. Run the following commands:
```powershell
cd backend
.\gradlew.bat bootRun
```
*Wait until you see:* `Tomcat initialized with port 5000 (http)`.  
Your backend is now live at: `http://localhost:5000`

---

## ⚛️ Step 4: Run React Frontend Client
1. Open a **second terminal tab** in VS Code (click the `+` icon or split terminal button in the top right of the terminal panel).
2. Run the following commands:
```powershell
cd frontend
npm start
```
*The React app will compile and automatically open in your browser at:* `http://localhost:3000`

---

## 🔌 VS Code Recommended Extensions (Optional)
To get the best coding and debugging experience in VS Code, install these extensions from the VS Code Marketplace (`Ctrl + Shift + X`):
* **Extension Pack for Java** (by Microsoft)
* **Spring Boot Extension Pack** (by VMware)
* **ES7+ React/Redux/React-Native snippets** (by dsznajder)
* **Bootstrap 5 & FontAwesome Snippets**

---

## ⚡ Quick One-Line Summary for Class/Exam Setup:
| Component | Terminal Command | Local URL |
| :--- | :--- | :--- |
| **MySQL DB** | Started via XAMPP Control Panel | Port `3307` |
| **Backend API** | `cd backend` ➔ `.\gradlew.bat bootRun` | `http://localhost:5000` |
| **Frontend App** | `cd frontend` ➔ `npm start` | `http://localhost:3000` |
