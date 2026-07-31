<div align="center">

#  ITFlow

### One Platform for All IT Services

A modern IT Service Management (ITSM) platform designed to simplify ticket management, asset tracking, and IT operations with an intuitive and responsive user experience.

---

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 📖 About

ITFlow is a modern **IT Service Management (ITSM)** web application developed to improve how organizations manage their daily IT operations.

Instead of relying on spreadsheets, manual reports, or paper-based requests, ITFlow centralizes every IT process into one platform—from ticket reporting and asset management to service history and analytics.

The goal is to create a faster, more transparent, and more organized workflow for both employees and IT Support teams.

---

# 🎯 Why ITFlow?

Many companies still experience common challenges in managing IT services.

- ❌ Lost or forgotten support requests
- ❌ Difficult asset tracking
- ❌ No maintenance history
- ❌ Slow communication between employees and IT Support
- ❌ Inefficient manual documentation

ITFlow solves these problems by providing one centralized platform that helps teams manage IT operations more efficiently.

---

# ⚙️ How It Works

```mermaid
flowchart LR

A[Employee]
--> B[Create Ticket]

B --> C[IT Support]

C --> D[Diagnosis]

D --> E[Repair]

E --> F[Complete Ticket]

F --> G[History Saved]
```

Every issue reported by employees is tracked from the beginning until completion, ensuring every repair has a complete service history.

---

# ✨ Key Features

## 🔐 Authentication

Secure login system with role-based access control.

---

## 🎫 Ticket Management

Create, monitor, update, and resolve IT support tickets efficiently.

---

## 📦 Asset Management

Manage company assets with complete information and maintenance history.

---

## 📱 QR Code System

Every asset can be identified instantly using QR Code scanning.

---

## 📊 Dashboard Analytics

Visualize ticket statistics, asset information, and operational insights.

---

## 🌙 Dark & Light Mode

Modern interface with smooth animations and theme switching.

---

## 🔔 Notification Center

Receive important updates and system notifications in real time.

---

# 🖼️ Application Preview

## Landing Page

> Add Screenshot Here

---

## Login

> Add Screenshot Here

---

## Dashboard

> Add Screenshot Here

---

## Ticket Management

> Add Screenshot Here

---

## Asset Management

> Add Screenshot Here

---

## QR Code

> Add Screenshot Here

---

# 🏗️ System Architecture

```text
                User

                  │

                  ▼

        React + TypeScript

                  │

                  ▼

         Business Logic Layer

                  │

        ┌─────────┴─────────┐

        ▼                   ▼

 Local Storage          Firebase

        │                   │

        └─────────┬─────────┘

                  ▼

            Dashboard UI
```

---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Routing | React Router |
| Forms | React Hook Form |
| Validation | Zod |
| Icons | Lucide React |
| Data | LocalStorage / Firebase |

---

# 📂 Project Structure

```text
src

├── app
├── assets
├── components
│   ├── auth
│   ├── dashboard
│   ├── tickets
│   ├── assets
│   └── ui
│
├── hooks
├── pages
├── services
├── utils
├── types
└── styles
```

---

# 🚀 Getting Started

Clone this repository.

```bash
git clone https://github.com/skysholder02/itflow.git
```

Navigate into the project.

```bash
cd itflow
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Build for production.

```bash
npm run build
```

---

# 🗺️ Roadmap

- ✅ Authentication System
- ✅ Dashboard
- ✅ Ticket Management
- ✅ Asset Management
- ✅ QR Code Assets
- ✅ Notification Center
- ✅ Dark / Light Theme
- ⏳ Firebase Integration
- ⏳ Email Notification
- ⏳ Mobile Optimization
- ⏳ Progressive Web App (PWA)

---

# 🎯 Project Goals

The objective of ITFlow is to build an efficient, user-friendly, and scalable IT Service Management platform that helps organizations manage IT services digitally.

The system focuses on:

- Improving productivity
- Simplifying IT workflows
- Reducing manual processes
- Increasing service transparency
- Providing better asset visibility

---

# 👨‍💻 Author

**Darwin Bharatha**

Vocational High School Student

IT Support Intern

GitHub

https://github.com/skysholder02

---

# ⭐ Support

If you find this project useful, consider giving it a **Star ⭐** on GitHub.

It helps support the project and motivates future development.

---

<div align="center">

Made with ❤️ using React + TypeScript + Vite

</div>
