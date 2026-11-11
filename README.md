# 🎨 Stuti | 3D Animation & Design Portfolio (Full-Stack)

A modern, high-performance, and responsive 3D Animation and Design portfolio website powered by an **Express & SQLite backend database** and **Three.js WebGL animations**.

---

## 🌟 Key Features

### 1. 🗄️ Backend Database Integration (SQLite & Express)
- **Persistent Database (`portfolio.db`)**: Powered by SQLite with structured tables for `projects`, `messages`, and `subscribers`.
- **Dual-Engine Resilience**: Seamlessly operates with SQLite and includes an automatic fallback data layer so the site works offline or without a server.
- **RESTful API Endpoints**:
  - `GET /api/projects`: Fetch projects with category filtering (`?category=environment|vehicle|organic|props`).
  - `GET /api/projects/:id`: Get project specs, topology data, and increment views.
  - `POST /api/projects/:id/like`: Atomically increment project likes in the database.
  - `POST /api/contact`: Validate and store client commission inquiries directly into the database.
  - `GET /api/messages`: Retrieve received client inquiries.
  - `GET /api/stats`: Real-time portfolio database metrics (projects count, likes, messages).
  - `GET /api/health`: Health status of the database server.
- **Admin Inquiries Modal**: Built-in dashboard (accessible via "⚙️ View Database Inquiries" in the footer) to inspect all incoming client messages.

---

### 2. 💎 Modern, Premium & Professional UI
- **Futuristic Dark Aesthetic**: Obsidian black (`#07090e`), electric cyan (`#38bdf8`), vibrant violet (`#818cf8`), and emerald accents.
- **Glassmorphism**: Translucent frosted glass headers, cards, and modal windows with `backdrop-filter: blur()`.
- **Dynamic Cursor Spotlight**: Ambient cursor-follower glow on desktop devices.
- **Interactive Lightbox Modal**: Click "Inspect 3D Details" on any card to view high-resolution renders, polygon topology count, render engine specifications, and software used.

---

### 3. 🚀 Real-Time 3D WebGL Animations (Three.js)
- **Hero Galaxy Particle Canvas**: Multi-layered glowing particle system with a floating wireframe knot that reacts dynamically to cursor motion and device tilt.
- **Real-Time 3D Viewport / Lab**: An interactive faceted 3D model that visitors can rotate and orbit with touch/drag, complete with live shader switches:
  - **Hologram**: Cyberpunk glowing cyan wireframe.
  - **Chrome Metallic**: Specular reflective metal shading.
  - **Clay Matte**: Architectural clay finish.
  - **Auto-Rotate Toggle**: Toggle orbital rotation on/off.

---

### 4. 📱 100% Responsive for Mobile, Tablet, Laptop & Desktop (iOS & Android)
- **Mobile First & Cross-Platform**: Fluid typography with CSS `clamp()`, safe-area-insets for iPhone notches/dynamic island, and Android navigation bars.
- **Touch-Optimized**: 44px+ touch targets, swipe-friendly 3D orbit controls, and mobile navigation drawer.
- **Category Filter Tabs**: Quick filtering across Environments, Vehicles, Organic Modeling, and Props.

---

## 🛠️ How to Run

### Start the Server
```bash
npm start
```
or with auto-reload during development:
```bash
npm run dev
```

Visit in your browser:
```
http://localhost:3000
```

