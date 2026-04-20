# KNS SwiftCheck Scan

**KNS SwiftCheck Scan** is a state-of-the-art QR Code-based attendance parsing and check-in system developed specifically for the **KNS Company**. It serves as an integrated event management and analytics suite tailored specifically for training sessions and large organizational events. 

---

## 👨‍💻 Lead Developer
**Developed by:** The Lead Developer of the **KNS Company** (You).

---

## ✨ Features

- **QR Code Scanning:** Robust and quick QR code identification to securely check-in and checkout participants.
- **Organization & Admin Dashboards:** Dedicated operational dashboards allowing for seamless session creation, administration, and team management.
- **Real-Time Analytics:** Live reporting views presenting immediate attendance numbers, participant turnout insights, and more.
- **Excel & CSV Integration:** Built-in spreadsheet generation (powered by `xlsx` and `papaparse`) to download attendance records effortlessly.
- **Rich Animations:** Smooth and reactive UI designs implemented out-of-the-box thanks to Framer Motion. 
- **Security & Reliability:** Built with standard authentication routing, secured middleware transitions, and a secure backend powered by **Supabase**.

## 🛠 Tech Stack

The platform boasts a remarkably modern tech stack constructed upon robust web technologies:
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Database / Auth:** Supabase
- **Styling:** Tailwind CSS + AutoPrefixer
- **Iconography:** Lucide Icons
- **Animation:** Framer Motion
- **Scanning Engine:** HTML5-QRCode
- **Utility:** Date-fns, Bcryptjs

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18.0.0 or greater) installed.

### Installation

1. Copy the repository to your local environment.
2. Install necessary dependencies from within the project's root:
   ```bash
   npm install
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
4. Access the application running at [http://localhost:3000](http://localhost:3000).

## 🗂 Project Architecture
The system is built leveraging Next.js' App directory layout:
- `app/api`: Handles direct server-side data routes and specialized sessions endpoints.
- `app/admin`: Comprehensive system management routes.
- `app/org`: Dedicated spaces for specific KNS Company subdivisions and external organizations.
- `app/components`: Centralized modular component collections encompassing complex Analytics views, Registration forms, and Navigation logic. 
- `lib/`: Provides custom server/client utility routines (Contexts, Authentication helpers, validations).

---
*© KNS Company - Developed internally out of KNS Head Office.*
