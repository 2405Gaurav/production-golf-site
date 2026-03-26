# Digital Heroes · Project: Golf Charity Subscription Platform

**A premium, emotion-driven subscription platform combining golf performance tracking, charitable giving, and a monthly reward engine.**

[![Portfolio](https://img.shields.io/badge/Developed%20By-Gaurav%20Thakur-c8f04e?style=flat-square)](https://thegauravthakur.in)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20TypeScript%20|%20Prisma-0a0f0d?style=flat-square)]()
[![Payment](https://img.shields.io/badge/Payment-Razorpay%20(Test%20Mode)-blue?style=flat-square)]()

---

## 01 PROJECT OVERVIEW
The platform is a subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine. It is designed to feel emotionally engaging and modern—deliberately avoiding the aesthetics of a traditional golf website.

### Users can:
*   **Subscribe:** Access premium features via Monthly or Yearly plans.
*   **Track Performance:** Enter golf scores in **Stableford format** (1 – 45 range).
*   **Participate:** Automatically enter monthly draw-based prize pools.
*   **Support:** Dedicate a portion of their subscription (min. 10%) to a charity of their choice.

---

## 02 CORE OBJECTIVES
*   **Subscription Engine:** Build a robust membership and payment system via **Razorpay Integration**.
*   **Score Experience:** Simple, engaging 5-score rolling entry flow.
*   **Custom Draw Engine:** Algorithm-powered and random monthly draws.
*   **Charity Integration:** Seamless charity contribution logic and directory.
*   **Admin Control:** Comprehensive terminal for user management, simulations, and winner verification.
*   **Outstanding UI/UX:** Clean, modern, motion-enhanced interface that stands out in the golf industry.

---

## 03 TECHNICAL STACK
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Framer Motion (Animations)
*   **Database:** PostgreSQL (Neon.tech / Prisma ORM)
*   **Authentication:** Custom JWT & Session-based Auth
*   **Payments:** Razorpay API (**Test Mode Integration**)
*   **Icons:** Lucide React

---

## 04 SYSTEM LOGIC & FEATURES

### Draw & Reward System (PRD Section 06 & 07)
A fixed portion of each subscription contributes to the prize pool.
*   **5-Number Match:** 40% Pool Share (Jackpot + Rollover logic).
*   **4-Number Match:** 35% Pool Share.
*   **3-Number Match:** 25% Pool Share.
*   **Logic Modes:** Admins can toggle between **Pure Random** or **Weighted Algorithmic** (based on frequency of user score entries).

### Score Management (PRD Section 05)
*   Only the **latest 5 scores** are retained at any time.
*   A new score automatically replaces the oldest stored score.
*   Scores are displayed in reverse chronological order (most recent first).

### Winner Verification (PRD Section 09)
Winners must upload a screenshot of their scores from the golf platform for Admin review.
*   **States:** Pending → Approved/Rejected → Paid.

---

## 05 GETTING STARTED

### Prerequisites
*   Node.js 18+
*   PostgreSQL Database (Neon.tech recommended)
*   Razorpay Account (for Test API keys)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd golf-charity-platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@neon-db-url/dbname?sslmode=require"
    DIRECT_URL="postgresql://user:password@neon-db-url/dbname?sslmode=require"
    JWT_SECRET="your-super-secret-key-123"

    RAZORPAY_KEY_ID="rzp_test_..."
    RAZORPAY_KEY_SECRET="your_rzp_secret"
    NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
    ```

4.  **Database Migration & Seeding:**
    ```bash
    npx prisma generate
    npx prisma db push
    node prisma/seed.js
    ```
    *Note: The seed script creates the initial admin user (`admin@gt.com` / `admin123`) and default charities.*

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 06 MANDATORY NOTES
*   **Payment Gateway:** Currently utilizing **Razorpay Test Mode**. All subscription flows are fully simulated for selection process evaluation. Architecture is "Production-Ready" and can be transitioned by updating API keys.
*   **Mobile-First:** The UI is fully responsive and optimized for mobile devices as per PRD Section 13.

---

## 07 DEVELOPER PORTFOLIO
Designed and Developed by **Gaurav Thakur**.  
[thegauravthakur.in](https://thegauravthakur.in)

---
© 2026 DIGITAL HEROES SELECTION PROCESS · [digitalheroes.co.in](https://digitalheroes.co.in)