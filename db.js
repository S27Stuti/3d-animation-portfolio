const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'portfolio.db');

let dbInstance = null;
let useFallback = false;

// Attempt to use built-in node:sqlite (Node 22+)
try {
  const { DatabaseSync } = require('node:sqlite');
  dbInstance = new DatabaseSync(DB_FILE);
  console.log('[Database] Connected to SQLite database at:', DB_FILE);
} catch (err) {
  console.warn('[Database] node:sqlite unavailable or failed. Using robust JSON-backed database fallback.', err.message);
  useFallback = true;
}

// Initial default projects to seed
const INITIAL_PROJECTS = [
  {
    slug: 'indoor-scene',
    title: 'Modern Living Room Architecture',
    category: 'environment',
    category_label: 'Environments',
    tagline: 'Photorealistic architectural visualization with warm interior lighting.',
    description: 'A detailed 3D interior living space crafted with realistic procedural PBR materials, custom furniture modeling, soft ambient occlusions, and balanced global illumination using Blender Cycles.',
    image: 'indoor.png',
    software: JSON.stringify(['Blender 4.x', 'Cycles Render', 'PBR Shading', 'Color Grading']),
    poly_count: '142k Faces',
    render_engine: 'Cycles (1024 Samples)',
    likes: 24,
    views: 180,
    featured: 1
  },
  {
    slug: 'outdoor-scene',
    title: 'Contemporary Villa & Landscape',
    category: 'environment',
    category_label: 'Environments',
    tagline: 'Exterior architectural concept with vegetation and dynamic natural daylight.',
    description: 'An architectural exterior rendering showcasing a modern suburban villa with structured landscaping, glass reflections, concrete textures, and atmospheric sky simulation.',
    image: 'outdoor.png',
    software: JSON.stringify(['Blender', 'Cycles', 'Procedural Grass', 'HDRI Lighting']),
    poly_count: '210k Faces',
    render_engine: 'Cycles Engine',
    likes: 31,
    views: 245,
    featured: 1
  },
  {
    slug: 'car-model',
    title: 'Cyberpunk Concept Supercar',
    category: 'vehicle',
    category_label: 'Vehicles',
    tagline: 'Stylized hard-surface sports car with precision topology and bold proportions.',
    description: 'A low-to-mid poly vehicle model focusing on sleek edge flows, aerodynamic curvature, neon rim accents, and game-ready asset optimization for real-time engines.',
    image: 'car.png',
    software: JSON.stringify(['Blender', 'Hard-Surface Modeling', 'Subdivision Surface']),
    poly_count: '38k Tris',
    render_engine: 'Eevee Real-Time',
    likes: 45,
    views: 312,
    featured: 1
  },
  {
    slug: 'scooty-model',
    title: 'Urban Commuter Scooter',
    category: 'vehicle',
    category_label: 'Vehicles',
    tagline: 'Ergonomic urban two-wheeler with smooth curvature and mechanical detailing.',
    description: 'A clean two-wheeler vehicle design with detailed handlebar controls, body paneling, headlight optics, and realistic tire tread modeling ready for product visualization.',
    image: 'scooty.png',
    software: JSON.stringify(['Blender', 'SubD Modeling', 'Material Nodes']),
    poly_count: '52k Tris',
    render_engine: 'Blender Eevee',
    likes: 19,
    views: 154,
    featured: 1
  },
  {
    slug: 'fish-model',
    title: 'Organic Marine Life Study',
    category: 'organic',
    category_label: 'Organic Modeling',
    tagline: 'Sculpted aquatic creature with anatomical flow and smooth organic curves.',
    description: 'An exploration of organic form, soft silhouette transitions, and underwater light refraction. Features sculpted fin structures and smooth retopology designed for organic animation.',
    image: 'fish.png',
    software: JSON.stringify(['Blender Sculpting', 'Retopology', 'SSS Shader']),
    poly_count: '24k Polygons',
    render_engine: 'Cycles SSS',
    likes: 27,
    views: 198,
    featured: 1
  },
  {
    slug: 'piano-model',
    title: 'Classical Grand Piano',
    category: 'props',
    category_label: 'Hard Surface Props',
    tagline: 'Precision musical instrument with authentic key action and glossy lacquered wood.',
    description: 'A tribute to classical instruments featuring an 88-key layout, pedals, curved soundboard lid, brass hinge detailing, and realistic high-gloss lacquer reflections.',
    image: 'piyano.png',
    software: JSON.stringify(['Blender', 'Precision Modeling', 'High-Gloss Shading']),
    poly_count: '64k Faces',
    render_engine: 'Cycles Render',
    likes: 38,
    views: 260,
    featured: 1
  }
];

// Fallback JSON Store implementation if SQLite is not available
class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { projects: [], messages: [], subscribers: [] };
    this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading JSON DB:', e);
    }
  }
  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving JSON DB:', e);
    }
  }
}

let fallbackDb = null;
if (useFallback) {
  fallbackDb = new JsonDatabase(path.join(__dirname, 'portfolio_data.json'));
}

// Initialize tables and seed initial data
function initDatabase() {
  if (!useFallback && dbInstance) {
    // 1. Projects Table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        category_label TEXT NOT NULL,
        tagline TEXT,
        description TEXT,
        image TEXT NOT NULL,
        software TEXT,
        poly_count TEXT,
        render_engine TEXT,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Messages / Inquiries Table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service TEXT,
        budget TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Newsletter / Commission subscribers
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if projects already exist
    const countRow = dbInstance.prepare('SELECT COUNT(*) as count FROM projects').get();
    if (countRow.count === 0) {
      console.log('[Database] Seeding initial 3D projects...');
      const insert = dbInstance.prepare(`
        INSERT INTO projects (slug, title, category, category_label, tagline, description, image, software, poly_count, render_engine, likes, views, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of INITIAL_PROJECTS) {
        insert.run(p.slug, p.title, p.category, p.category_label, p.tagline, p.description, p.image, p.software, p.poly_count, p.render_engine, p.likes, p.views, p.featured);
      }
      console.log(`[Database] Successfully seeded ${INITIAL_PROJECTS.length} projects.`);
    }
  } else {
    // JSON Fallback initialization
    if (!fallbackDb.data.projects || fallbackDb.data.projects.length === 0) {
      fallbackDb.data.projects = INITIAL_PROJECTS.map((p, idx) => ({ id: idx + 1, ...p, created_at: new Date().toISOString() }));
      fallbackDb.data.messages = [];
      fallbackDb.data.subscribers = [];
      fallbackDb.save();
    }
  }
}

// Database Operations
const db = {
  // Projects
  getAllProjects(category) {
    if (!useFallback && dbInstance) {
      if (category && category !== 'all') {
        return dbInstance.prepare('SELECT * FROM projects WHERE category = ? ORDER BY id ASC').all(category);
      }
      return dbInstance.prepare('SELECT * FROM projects ORDER BY id ASC').all();
    } else {
      let list = fallbackDb.data.projects;
      if (category && category !== 'all') {
        list = list.filter(p => p.category === category);
      }
      return list;
    }
  },

  getProjectById(id) {
    if (!useFallback && dbInstance) {
      return dbInstance.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    } else {
      return fallbackDb.data.projects.find(p => p.id === parseInt(id, 10));
    }
  },

  incrementLikes(id) {
    if (!useFallback && dbInstance) {
      dbInstance.prepare('UPDATE projects SET likes = likes + 1 WHERE id = ?').run(id);
      const row = dbInstance.prepare('SELECT likes FROM projects WHERE id = ?').get(id);
      return row ? row.likes : 0;
    } else {
      const proj = fallbackDb.data.projects.find(p => p.id === parseInt(id, 10));
      if (proj) {
        proj.likes = (proj.likes || 0) + 1;
        fallbackDb.save();
        return proj.likes;
      }
      return 0;
    }
  },

  incrementViews(id) {
    if (!useFallback && dbInstance) {
      dbInstance.prepare('UPDATE projects SET views = views + 1 WHERE id = ?').run(id);
    } else {
      const proj = fallbackDb.data.projects.find(p => p.id === parseInt(id, 10));
      if (proj) {
        proj.views = (proj.views || 0) + 1;
        fallbackDb.save();
      }
    }
  },

  // Contact Inquiries
  saveMessage({ name, email, phone, service, budget, message }) {
    if (!useFallback && dbInstance) {
      const stmt = dbInstance.prepare(`
        INSERT INTO messages (name, email, phone, service, budget, message)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(name, email, phone || '', service || 'General Inquiry', budget || 'Not specified', message);
      return { id: info.lastInsertRowid, name, email, created_at: new Date().toISOString() };
    } else {
      const newMessage = {
        id: fallbackDb.data.messages.length + 1,
        name,
        email,
        phone: phone || '',
        service: service || 'General Inquiry',
        budget: budget || 'Not specified',
        message,
        status: 'unread',
        created_at: new Date().toISOString()
      };
      fallbackDb.data.messages.push(newMessage);
      fallbackDb.save();
      return newMessage;
    }
  },

  getAllMessages() {
    if (!useFallback && dbInstance) {
      return dbInstance.prepare('SELECT * FROM messages ORDER BY id DESC').all();
    } else {
      return [...fallbackDb.data.messages].reverse();
    }
  },

  // Stats
  getStats() {
    if (!useFallback && dbInstance) {
      const totalProjects = dbInstance.prepare('SELECT COUNT(*) as count FROM projects').get().count;
      const totalLikes = dbInstance.prepare('SELECT SUM(likes) as total FROM projects').get().total || 0;
      const totalMessages = dbInstance.prepare('SELECT COUNT(*) as count FROM messages').get().count;
      return { totalProjects, totalLikes, totalMessages, engine: 'SQLite (node:sqlite)' };
    } else {
      const totalProjects = fallbackDb.data.projects.length;
      const totalLikes = fallbackDb.data.projects.reduce((acc, p) => acc + (p.likes || 0), 0);
      const totalMessages = fallbackDb.data.messages.length;
      return { totalProjects, totalLikes, totalMessages, engine: 'JSON-Persistent DB' };
    }
  }
};

// Initialize right away
initDatabase();

module.exports = db;

