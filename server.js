const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from project directory
app.use(express.static(path.join(__dirname)));

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: '3D Portfolio Backend Database API is operational',
    timestamp: new Date().toISOString()
  });
});

// API: Get Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get Projects (optional category filter)
app.get('/api/projects', (req, res) => {
  try {
    const { category } = req.query;
    const rawProjects = db.getAllProjects(category);
    // Parse JSON software array
    const projects = rawProjects.map(p => {
      let softwareList = [];
      try {
        softwareList = typeof p.software === 'string' ? JSON.parse(p.software) : p.software;
      } catch (e) {
        softwareList = [p.software];
      }
      return {
        ...p,
        software: softwareList
      };
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get Single Project
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    db.incrementViews(req.params.id);
    let softwareList = [];
    try {
      softwareList = typeof project.software === 'string' ? JSON.parse(project.software) : project.software;
    } catch (e) {
      softwareList = [project.software];
    }
    res.json({
      success: true,
      data: {
        ...project,
        views: (project.views || 0) + 1,
        software: softwareList
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Like a Project
app.post('/api/projects/:id/like', (req, res) => {
  try {
    const projectId = req.params.id;
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const updatedLikes = db.incrementLikes(projectId);
    res.json({ success: true, likes: updatedLikes, message: 'Project liked successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Submit Contact Inquiry
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, service, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required fields: name, email, and message.'
      });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    const saved = db.saveMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      service: service ? service.trim() : '3D Modeling & Animation',
      budget: budget ? budget.trim() : 'Flexible',
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your project inquiry has been received. Stuti will get back to you shortly.',
      data: saved
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get All Messages (for portfolio owner / dashboard preview)
app.get('/api/messages', (req, res) => {
  try {
    const messages = db.getAllMessages();
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all route to serve index.html for SPA navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` 🚀 3D Portfolio Server is live!`);
  console.log(` 🌐 Local URL:  http://localhost:${PORT}`);
  console.log(` 🗄️ Database:  SQLite (portfolio.db)`);
  console.log(`===============================================`);
});
