# VehicleRentX - MERN Stack

VehicleRentX is a smart bike and scooter rental platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure
This repository contains both the backend API and the frontend React application.

- `/backend` - Express.js API, Mongoose Models, Authentication
- `/frontend` - React Application (UI, Dashboards)

## Prerequisites
To run this application, you need to install:
1. **Node.js** (v16+) - Download from https://nodejs.org/
2. **MongoDB** - Either locally installed or a MongoDB Atlas URI.

## How to Run the Backend
1. Open a terminal and navigate to the backend directory:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Start the server (runs on port 5000):
   `npm run dev`

## How to Run the Frontend
1. Open a new terminal and navigate to the frontend directory:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the React development server (runs on port 3000):
   `npm start`

## Technologies Used
- **Frontend**: React, React Router, Bootstrap 5, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Security**: JWT Authentication, bcryptjs (setup ready in models)
