# Southern Delta University (SDU) Lost & Found Portal
## Final Year Project Technical Documentation & Defense Guide

**Institution:** Southern Delta University, Ozoro  
**Project:** Campus Lost & Found Web Portal  
**Architecture:** Client-Server REST Architecture (Node.js, Express, MongoDB, Vanilla CSS/JS)  

---

## 1. Executive Summary & Problem Statement

Belongings such as student identity cards, scientific calculators, laboratory coats, textbooks, and room keys are frequently misplaced across campus lecture theaters, reading halls, hostels, and sports grounds. Historically, recovery relied on uncoordinated physical bulletin boards or noisy messaging groups, leading to:
- High loss rates for sensitive student credentials and expensive academic equipment.
- Inability to search or filter by date, category, or faculty building.
- Lack of audit trail and secure verification before handover.

The **SDU Lost & Found Portal** resolves this by providing a centralized, responsive web platform featuring real-time reporting, category filtering, search, claim verification, student dashboards, and campus security moderation.

---

## 2. Technology Stack

* **Frontend:**
  - Modern Semantic HTML5
  - Custom Vanilla CSS3 (Custom design tokens, responsive CSS Grid & Flexbox, no heavy framework dependencies)
  - Vanilla JavaScript (ES6+ `fetch` API, client-side routing and DOM manipulation)
* **Backend:**
  - Node.js (v24 LTS)
  - Express.js (RESTful routing, static file delivery, middleware pipeline)
  - Multer (Multipart form handling and disk-based image uploads)
  - Dotenv (Environment configuration)
  - CORS (Cross-Origin Resource Sharing)
* **Database & Persistence:**
  - MongoDB (via Mongoose ODM) with automated in-memory fallback for offline demonstrations
  - Text search indexing on `title`, `description`, and `location`

---

## 3. System Architecture & Component Diagram

```
+-------------------------------------------------------------------------+
|                         Frontend Client (Browser)                       |
|  - index.html      (Screen 1: Campus Feed & Search)                     |
|  - item.html       (Screen 2: Details & Claim Modal)                    |
|  - report.html     (Screen 3: Multipart Form + Image Upload)             |
|  - dashboard.html  (Screen 4: Student Report Resolution)                |
|  - admin.html      (Screen 5: Moderation Desk & Analytics)              |
+------------------------------------+------------------------------------+
                                     |
                                REST API Calls
                          (JSON / Multipart FormData)
                                     v
+------------------------------------+------------------------------------+
|                         Express.js REST API Server                      |
|  Port: 5000                                                             |
|  - /api/items       (CRUD, Search, Filter, Sort, Multer Upload)         |
|  - /api/stats       (Analytics & Recovery Rate Metrics)                 |
|  - /uploads         (Static Serving of Uploaded Images)                 |
|  - /health          (Server Health Status)                              |
+------------------------------------+------------------------------------+
                                     |
                                Mongoose ODM
                                     v
+------------------------------------+------------------------------------+
|                         MongoDB Database                                |
|  - Collection: items                                                    |
|  - Fields: title, type, category, location, date, description,          |
|            imageUrl, contactName, contactEmail, contactPhone, status    |
|  - Indexes: Text Index (title, description, location)                   |
+-------------------------------------------------------------------------+
```

---

## 4. Database Schema Reference (`models/Item.js`)

| Field Name | Type | Options / Constraints | Description |
|---|---|---|---|
| `title` | String | Required, Trimmed | Name of the misplaced or found item |
| `type` | String | Required, Enum: `['Lost', 'Found']` | Indicates report classification |
| `category` | String | Required, Enum: `['Electronics', 'ID Cards', 'Keys', 'Books', 'Clothing', 'Wallets', 'Other']` | Categorical classification |
| `location` | String | Required, Trimmed | Faculty building, hall, or campus landmark |
| `date` | Date | Default: `Date.now` | Date when item was lost or found |
| `description` | String | Trimmed | Distinguishing marks, serial numbers, color |
| `imageUrl` | String | Default: `''` | Path to uploaded image (`/uploads/...`) |
| `contactName` | String | Required, Trimmed | Full name of student or staff reporter |
| `contactEmail` | String | Required, Trimmed, Lowercase | University email address |
| `contactPhone` | String | Required, Trimmed | WhatsApp / mobile telephone number |
| `status` | String | Enum: `['Active', 'Recovered']`, Default: `'Active'` | Current resolution status |
| `createdAt` | Date | Default: `Date.now` | Timestamp of report submission |

---

## 5. REST API Specification

### 5.1 Fetch All Items (Filtered / Searched)
- **Method:** `GET`
- **Endpoint:** `/api/items`
- **Query Parameters:**
  - `type`: `Lost` | `Found` | `all`
  - `category`: `Electronics` | `ID Cards` | `Keys` | `Books` | `Clothing` | `Other`
  - `location`: Keyword match (e.g. `Library`, `Engineering`)
  - `search`: Full text search across title, description, and location
  - `status`: `Active` | `Recovered` | `all`
- **Response Format:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "673f8a...",
      "title": "Casio Scientific Calculator FX-991EX",
      "type": "Found",
      "category": "Electronics",
      "location": "Faculty of Science, Physics Lab 2",
      "status": "Active",
      "createdAt": "2026-10-26T10:30:00.000Z"
    }
  ]
}
```

### 5.2 Fetch Single Item by ID
- **Method:** `GET`
- **Endpoint:** `/api/items/:id`
- **Response Format:** Returns full item JSON object including contact details.

### 5.3 Submit a New Item Report
- **Method:** `POST`
- **Endpoint:** `/api/items`
- **Content-Type:** `multipart/form-data` or `application/json`
- **Payload Fields:** `title`, `type`, `category`, `location`, `date`, `description`, `contactName`, `contactEmail`, `contactPhone`, and optional `image` file.
- **Response (201 Created):** Returns created item with generated `_id` and `imageUrl`.

### 5.4 Update Status (Mark as Recovered)
- **Method:** `PUT`
- **Endpoint:** `/api/items/:id/status`
- **Body:** `{ "status": "Recovered" }`

### 5.5 Delete Report
- **Method:** `DELETE`
- **Endpoint:** `/api/items/:id`
- **Behavior:** Removes database record and automatically deletes the stored image from disk.

### 5.6 Platform Statistics & Metrics
- **Method:** `GET`
- **Endpoint:** `/api/stats`
- **Response Format:**
```json
{
  "success": true,
  "data": {
    "totalItems": 8,
    "activeLost": 3,
    "activeFound": 4,
    "totalRecovered": 1,
    "recoveryRate": 13,
    "categoryStats": [...]
  }
}
```

---

## 6. How to Run the Project Locally

### Prerequisites
- Node.js (v18+)

### Steps
1. Open terminal in `Backend`:
   ```bash
   cd Backend
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your web browser:
   - **Frontend App:** [http://localhost:5000/index.html](http://localhost:5000/index.html)
   - **Student Dashboard:** [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
   - **Report Item:** [http://localhost:5000/report.html](http://localhost:5000/report.html)
   - **Admin Moderation:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
   - **REST API:** [http://localhost:5000/api/items](http://localhost:5000/api/items)
   - **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Note: The server includes an automatic in-memory MongoDB fallback. If a local MongoDB daemon or Atlas URI is not detected, it spins up an embedded database and pre-seeds it with 8 sample items so demonstrations run without any manual database setup!)*

---

## 7. Project Defense Q&A Cheatsheet

1. **Why did you choose Node.js and Express for this project?**
   - *Answer:* Node.js offers an asynchronous, event-driven runtime ideal for I/O operations like handling file uploads and REST API requests with low latency. Express provides a lightweight, unopinionated routing layer that makes API creation clean and maintainable.

2. **Why MongoDB over a Relational Database like MySQL?**
   - *Answer:* Lost and found reports have varying metadata (e.g. electronics have serial numbers, ID cards have matric numbers, clothing has sizes). MongoDB's flexible JSON-like document model adapts naturally to diverse item descriptions and supports fast geospatial or text-index searches.

3. **How are images handled securely?**
   - *Answer:* Images are processed using Multer with strict MIME type validation (allowing only JPEG, PNG, WEBP, and GIF) and a 5MB size limit. Files are sanitized and renamed with unique timestamps to prevent directory traversal and name collision attacks.

4. **How does the claim verification workflow work?**
   - *Answer:* To deter fraud, finder contact numbers are provided alongside an integrated verification modal where the claimant describes secret identifying marks (such as stickers, engravings, or serial numbers) before physical handover at campus security.
