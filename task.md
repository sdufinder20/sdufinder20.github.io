# Campus Lost & Found Portal — Final Year Project Task Breakdown

A lightweight, web-based platform for university students and staff to report, track, and recover lost or found belongings across campus.

---

## 📌 Project Overview
* **Objective:** Streamline how lost items are recovered on campus by replacing disorganized physical bulletin boards and social media group posts with a structured, centralized web portal.
* **Architecture:** Client-Server Architecture (REST API)
* **Target Scope:** 4–5 core screens, simple CRUD operations, status workflows.

---

## 🛠️ Technology Stack
* **Frontend:** HTML5, Modern Vanilla CSS3 (custom CSS grid/flexbox, no bloated frameworks), Vanilla JavaScript (ES6+ `fetch` API)
* **Backend:** Node.js & Express.js
* **Database:** MongoDB (via Mongoose ODM)
* **File Handling:** Multer (for image uploads) or Image URLs

---

## 📱 The 5 Core Screens

| # | Screen Name | File | Description & Key UI Elements |
|---|---|---|---|
| 1 | **Home / Feed** | `public/index.html` | Hero banner, search bar, filter tabs (*All*, *Lost*, *Found*), category dropdown, responsive grid of item cards with status badges. |
| 2 | **Item Details & Claim** | `public/item.html` | Full item photo, title, date, campus location, detailed description, and a "Contact / Claim" button revealing finder/owner details. |
| 3 | **Report an Item** | `public/report.html` | Clean form to submit a lost or found item (Title, Type, Category, Location, Date, Description, Image Upload, Contact Info). |
| 4 | **My Reports Dashboard** | `public/my-items.html` | List of items reported by the user, with actions to **Mark as Recovered** or **Delete**. |
| 5 | **Admin Moderation** | `public/admin.html` | Dashboard with key metrics (Total Reported, Total Recovered) and a table to remove spam or inappropriate posts. |

---

## 🗄️ MongoDB Data Model (`models/Item.js`)

```javascript
{
  title: String,             // e.g. "Matte Black HP Charger"
  type: String,              // "Lost" | "Found"
  category: String,          // "Electronics", "ID Cards", "Keys", "Books", "Clothing", "Other"
  location: String,          // e.g. "Library 2nd Floor, Room 204"
  date: Date,                // Date when lost or found
  description: String,       // Additional details
  imageUrl: String,          // Path to uploaded image
  contactName: String,       // Name of student/staff
  contactEmail: String,      // Email address
  contactPhone: String,      // Phone or WhatsApp number
  status: String,            // "Active" | "Recovered"
  createdAt: Date            // Auto timestamp
}
```

---

## 🔌 REST API Endpoints Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items` | Fetch all items (supports `?type=Lost`, `?category=Keys`, `?search=HP`) |
| `GET` | `/api/items/:id` | Fetch details of a single item |
| `POST` | `/api/items` | Create a new lost/found report (handles multipart form data + image) |
| `PUT` | `/api/items/:id/status` | Update status (e.g., mark as `"Recovered"`) |
| `DELETE` | `/api/items/:id` | Delete an item report |
| `GET` | `/api/stats` | Return summary stats for Admin dashboard |

---

## 📋 Step-by-Step Implementation Checklist

### Phase 1: Environment & Backend Foundation
- [x] Initialize Node.js project (`npm init -y`)
- [x] Install dependencies (`express`, `mongoose`, `multer`, `dotenv`, `cors`)
- [x] Configure MongoDB connection via Mongoose
- [x] Create `models/Item.js` schema
- [x] Implement Express routes (`routes/items.js`) for CRUD operations
- [x] Test all endpoints using a REST client (cURL / Postman / browser)

### Phase 2: Design System & Styling
- [x] Create `public/css/style.css`
- [x] Define CSS variables (color palette, typography, card shadows, border radii)
- [x] Build reusable UI components:
  - Navigation bar & footer
  - Status badges (`badge-lost`, `badge-found`, `badge-recovered`)
  - Item card grid
  - Form input styles and primary/secondary buttons
  - Responsive layout for mobile and desktop

### Phase 3: Screen Development & Integration
- [x] **Screen 1 (`index.html`)**:
  - Build UI layout
  - Connect JS to `GET /api/items` to dynamically render cards
  - Implement client-side filtering and search
- [x] **Screen 2 (`item.html`)**:
  - Parse `?id=...` query parameter from URL
  - Fetch item details from `GET /api/items/:id`
  - Populate UI with details and contact modal
- [x] **Screen 3 (`report.html`)**:
  - Build form with file upload support
  - Send form data via `POST /api/items`
  - Show success feedback and redirect to home
- [x] **Screen 4 (`my-items.html` / `dashboard.html`)**:
  - Filter items by stored user email/ID (or local storage reference)
  - Add "Mark as Recovered" button calling `PUT /api/items/:id/status`
  - Add "Delete" button calling `DELETE /api/items/:id`
- [x] **Screen 5 (`admin.html`)**:
  - Fetch stats from `GET /api/stats` and display counters
  - Render moderation table with direct deletion controls

### Phase 4: Final Polish & Project Defense Prep
- [x] Seed database with 6–8 realistic campus sample items
- [x] Test mobile responsiveness across all 5 pages
- [x] Validate form inputs (required fields, valid phone/email)
- [x] Prepare project documentation / report write-up
