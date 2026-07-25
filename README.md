# Local Services Booking Platform

A full-stack MERN application connecting Customers with independent Service Providers for bookable, time-slot-based appointments.

## Features

- JWT authentication with bcrypt password hashing
- Two roles: Provider (manages services & availability) and Customer (books appointments)
- Service listings with categories, pricing, and duration
- Weekly availability scheduling with double-booking prevention
- Booking status lifecycle: pending → confirmed → completed / declined / cancelled
- Reviews and ratings after completed bookings
- Search, sort, and filter providers
- Provider dashboard with stats (response time, completion rate)
- Favorite providers list
- In-app notification center for booking status changes

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT & bcrypt

## Getting Started

### Prerequisites
- Node.js (LTS)
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd backend
npm install
