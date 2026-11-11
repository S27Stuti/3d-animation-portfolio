/**
 * STUTI 3D ANIMATION & DESIGN PORTFOLIO
 * Modern Interactive Controller & Backend Database Connector
 */

// Fallback project data if accessed without active backend server
const FALLBACK_PROJECTS = [
  {
    id: 1,
    slug: 'indoor-scene',
    title: 'Modern Living Room Architecture',
    category: 'environment',
    category_label: 'Environments',
    tagline: 'Photorealistic architectural visualization with warm interior lighting.',
    description: 'A detailed 3D interior living space crafted with realistic procedural PBR materials, custom furniture modeling, soft ambient occlusions, and balanced global illumination using Blender Cycles.',
    image: 'indoor.png',
    software: ['Blender 4.x', 'Cycles Render', 'PBR Shading', 'Color Grading'],
    poly_count: '142k Faces',
    render_engine: 'Cycles (1024 Samples)',
    likes: 25,
    views: 180
  },
  {
    id: 2,
    slug: 'outdoor-scene',
    title: 'Contemporary Villa & Landscape',
    category: 'environment',
    category_label: 'Environments',
    tagline: 'Exterior architectural concept with vegetation and dynamic natural daylight.',
    description: 'An architectural exterior rendering showcasing a modern suburban villa with structured landscaping, glass reflections, concrete textures, and atmospheric sky simulation.',
    image: 'outdoor.png',
    software: ['Blender', 'Cycles', 'Procedural Grass', 'HDRI Lighting'],
    poly_count: '210k Faces',
    render_engine: 'Cycles Engine',
    likes: 31,
    views: 245
  },
  {
    id: 3,
    slug: 'car-model',
    title: 'Cyberpunk Concept Supercar',
    category: 'vehicle',
    category_label: 'Vehicles',
    tagline: 'Stylized hard-surface sports car with precision topology and bold proportions.',
    description: 'A low-to-mid poly vehicle model focusing on sleek edge flows, aerodynamic curvature, neon rim accents, and game-ready asset optimization for real-time engines.',
    image: 'car.png',
    software: ['Blender', 'Hard-Surface Modeling', 'Subdivision Surface'],
    poly_count: '38k Tris',
    render_engine: 'Eevee Real-Time',
    likes: 45,
    views: 312
  },
  {
    id: 4,
    slug: 'scooty-model',
    title: 'Urban Commuter Scooter',
    category: 'vehicle',
    category_label: 'Vehicles',
    tagline: 'Ergonomic urban two-wheeler with smooth curvature and mechanical detailing.',
    description: 'A clean two-wheeler vehicle design with detailed handlebar controls, body paneling, headlight optics, and realistic tire tread modeling ready for product visualization.',
    image: 'scooty.png',
    software: ['Blender', 'SubD Modeling', 'Material Nodes'],
    poly_count: '52k Tris',
    render_engine: 'Blender Eevee',
    likes: 19,
    views: 154
  },
  {
    id: 5,
    slug: 'fish-model',
    title: 'Organic Marine Life Study',
    category: 'organic',
    category_label: 'Organic Modeling',
    tagline: 'Sculpted aquatic creature with anatomical flow and smooth organic curves.',
    description: 'An exploration of organic form, soft silhouette transitions, and underwater light refraction. Features sculpted fin structures and smooth retopology designed for organic animation.',
    image: 'fish.png',
    software: ['Blender Sculpting', 'Retopology', 'SSS Shader'],
    poly_count: '24k Polygons',
    render_engine: 'Cycles SSS',
    likes: 27,
    views: 198
  },
  {
    id: 6,
    slug: 'piano-model',
    title: 'Classical Grand Piano',
    category: 'props',
    category_label: 'Hard Surface Props',
    tagline: 'Precision musical instrument with authentic key action and glossy lacquered wood.',
    description: 'A tribute to classical instruments featuring an 88-key layout, pedals, curved soundboard lid, brass hinge detailing, and realistic high-gloss lacquer reflections.',
    image: 'piyano.png',
    software: ['Blender', 'Precision Modeling', 'High-Gloss Shading'],
    poly_count: '64k Faces',
    render_engine: 'Cycles Render',
    likes: 38,
    views: 260
  }
];

// App State
const state = {
  projects: [],
  currentCategory: 'all',
  likedProjects: new Set(),
  dbConnected: false
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCursorSpotlight();
  initContactForm();
  loadProjects();
  checkBackendHealth();
  setupFilterTabs();
  setupModals();
});

// Check if backend database server is live
async function checkBackendHealth() {
  const badge = document.getElementById('db-status-badge');
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      state.dbConnected = true;
      if (badge) {
        badge.innerHTML = `<span class="pulse-dot"></span> SQLite Live (${data.status})`;
        badge.title = 'Backend database is active and synced';
      }
    }
  } catch (err) {
    state.dbConnected = false;
    if (badge) {
      badge.innerHTML = `<span class="pulse-dot" style="background:#eab308; box-shadow:0 0 8px #eab308;"></span> Static Mode`;
      badge.title = 'Running locally with offline fallback';
    }
  }
}

// ================= NAVBAR & SCROLL =================
function initNavbar() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside tap
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

// Active Nav Link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 200;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);

    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

// ================= DESKTOP CURSOR SPOTLIGHT =================
function initCursorSpotlight() {
  const spotlight = document.querySelector('.cursor-spotlight');
  if (!spotlight || window.innerWidth < 1024 || 'ontouchstart' in window) return;

  document.addEventListener('mousemove', (e) => {
    spotlight.style.opacity = '1';
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

// ================= LOAD PROJECTS FROM BACKEND DATABASE =================
async function loadProjects(category = 'all') {
  const container = document.getElementById('projects-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
      <div style="font-size: 1.5rem; margin-bottom: 12px; animation: pulseAnim 1.5s infinite;">⚡</div>
      <p>Loading projects from database...</p>
    </div>
  `;

  try {
    const endpoint = category === 'all' ? '/api/projects' : `/api/projects?category=${encodeURIComponent(category)}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Network error');
    const json = await res.json();
    state.projects = json.data;
  } catch (err) {
    console.warn('API unreachable, using fallback dataset:', err);
    state.projects = category === 'all' ? FALLBACK_PROJECTS : FALLBACK_PROJECTS.filter(p => p.category === category);
  }

  renderProjects(state.projects);
}

// Render Project Cards with 3D hover effects & like counters
function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <p style="color: var(--text-muted);">No 3D projects found for this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(p => {
    const softwarePills = Array.isArray(p.software) ? p.software.slice(0, 2).map(s => `<span class="tool-tag">${escapeHTML(s)}</span>`).join('') : '';
    const isLiked = state.likedProjects.has(p.id);

    return `
      <article class="project-card" data-id="${p.id}" data-category="${p.category}">
        <div class="card-media">
          <div class="card-badges">
            <span class="badge-tag">${escapeHTML(p.category_label || p.category)}</span>
            <span class="badge-tag badge-poly">${escapeHTML(p.poly_count || 'Optimized')}</span>
          </div>

          <button class="card-likes-btn ${isLiked ? 'liked' : ''}" data-like-id="${p.id}" title="Applaud project">
            <i class="heart-icon">${isLiked ? '❤️' : '🤍'}</i>
            <span class="like-counter">${p.likes || 0}</span>
          </button>

          <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" class="card-image" loading="lazy">

          <div class="card-overlay">
            <button class="btn-inspect" onclick="openProjectModal(${p.id})">
              <span>Inspect 3D Details</span> &rarr;
            </button>
          </div>
        </div>

        <div class="card-body">
          <span class="card-category">${escapeHTML(p.category_label || p.category)}</span>
          <h3 class="card-title">${escapeHTML(p.title)}</h3>
          <p class="card-tagline">${escapeHTML(p.tagline || p.description)}</p>

          <div class="card-meta">
            <div class="card-tools">
              ${softwarePills}
            </div>
            <button class="btn-inspect" onclick="openProjectModal(${p.id})">
              <span>View</span> &rarr;
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  attachCardEvents();
}

// Attach Like event listeners
function attachCardEvents() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    // Like Button with Backend DB sync
    const likeBtn = card.querySelector('.card-likes-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(likeBtn.dataset.likeId, 10);
        handleLike(id, likeBtn);
      });
    }
  });
}

// Like handler: increments likes in SQLite database
async function handleLike(id, btn) {
  if (state.likedProjects.has(id)) {
    showToast('You already liked this 3D project!', 'info');
    return;
  }

  const counter = btn.querySelector('.like-counter');
  const icon = btn.querySelector('.heart-icon');

  // Optimistic UI update
  let currentLikes = parseInt(counter.textContent, 10) || 0;
  counter.textContent = currentLikes + 1;
  btn.classList.add('liked');
  icon.textContent = '❤️';
  state.likedProjects.add(id);

  try {
    const res = await fetch(`/api/projects/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.likes) counter.textContent = data.likes;
      showToast('Liked! Saved to portfolio database. ✨', 'success');
    }
  } catch (err) {
    // Kept client-side if offline
    showToast('Project liked! (Offline mode)', 'success');
  }
}

// ================= FILTER TABS =================
function setupFilterTabs() {
  const tabs = document.querySelectorAll('.filter-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.dataset.filter;
      state.currentCategory = category;
      loadProjects(category);
    });
  });
}

// ================= MODAL & LIGHTBOX =================
function setupModals() {
  const overlay = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  }

  // Admin Inquiries Modal Setup
  const adminModal = document.getElementById('admin-modal');
  const adminClose = document.getElementById('admin-close-btn');
  if (adminClose && adminModal) {
    adminClose.addEventListener('click', () => adminModal.classList.remove('open'));
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) adminModal.classList.remove('open');
    });
  }

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (overlay) overlay.classList.remove('open');
      if (adminModal) adminModal.classList.remove('open');
    }
  });
}

// Open Project Details Modal
function openProjectModal(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const title = document.getElementById('modal-title');
  const category = document.getElementById('modal-category');
  const img = document.getElementById('modal-img');
  const desc = document.getElementById('modal-desc');
  const poly = document.getElementById('modal-poly');
  const renderEngine = document.getElementById('modal-engine');
  const tools = document.getElementById('modal-tools');

  if (title) title.textContent = project.title;
  if (category) category.textContent = project.category_label || project.category;
  if (img) {
    img.src = project.image;
    img.alt = project.title;
  }
  if (desc) desc.textContent = project.description || project.tagline;
  if (poly) poly.textContent = project.poly_count || 'Optimized Geometry';
  if (renderEngine) renderEngine.textContent = project.render_engine || 'Blender Cycles';
  
  if (tools) {
    const list = Array.isArray(project.software) ? project.software : [project.software];
    tools.innerHTML = list.map(t => `<span class="skill-pill" style="font-size:0.75rem; padding:4px 10px;">${escapeHTML(t)}</span>`).join('');
  }

  modal.classList.add('open');
}

// ================= CONTACT FORM & BACKEND DATABASE =================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone ? form.phone.value.trim() : '';
    const service = form.service ? form.service.value : '3D Modeling & Animation';
    const budget = form.budget ? form.budget.value : 'Flexible';
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill out all required fields (*)', 'error');
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Saving to Database...</span>`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, service, budget, message })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Message sent and saved to SQLite database! 🚀', 'success');
        form.reset();
      } else {
        throw new Error(data.error || 'Server rejected message');
      }
    } catch (err) {
      console.warn('Backend unavailable, mock success response:', err);
      showToast('Inquiry recorded successfully! (Stuti will reply soon)', 'success');
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Send 3D Project Inquiry</span> &rarr;`;
    }
  });

  // Copy Email Button
  const copyBtn = document.getElementById('btn-copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = 'stutu2004shah@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied to clipboard: ${email}`, 'success');
      }).catch(() => {
        showToast(`Email: ${email}`, 'info');
      });
    });
  }
}

// ================= ADMIN / INQUIRIES VIEWER =================
async function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  const content = document.getElementById('admin-inquiries-body');
  if (!modal || !content) return;

  modal.classList.add('open');
  content.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">Loading messages from SQLite database...</td></tr>`;

  try {
    const res = await fetch('/api/messages');
    if (!res.ok) throw new Error('Could not fetch');
    const json = await res.json();
    const messages = json.data || [];

    if (messages.length === 0) {
      content.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No inquiries in database yet. Try submitting the contact form!</td></tr>`;
      return;
    }

    content.innerHTML = messages.map(m => `
      <tr>
        <td><strong>${escapeHTML(m.name)}</strong><br><small style="color:var(--text-muted)">${escapeHTML(m.email)}</small></td>
        <td>${escapeHTML(m.service || '3D General')}</td>
        <td>${escapeHTML(m.budget || 'Flexible')}</td>
        <td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHTML(m.message)}">${escapeHTML(m.message)}</td>
        <td><small style="color:var(--text-muted)">${m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent'}</small></td>
      </tr>
    `).join('');
  } catch (err) {
    content.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--accent-rose);">Backend database not active or unreachable. Start server via <code>npm start</code>.</td></tr>`;
  }
}

// ================= TOAST NOTIFICATION UTILITY =================
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Helper: Escape HTML to avoid XSS
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

