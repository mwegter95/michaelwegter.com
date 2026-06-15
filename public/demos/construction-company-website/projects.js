/* =====================================================================
   CORNERSTONE CONSTRUCTION CO. | PROJECTS.JS
   Handles: filter tabs, lightbox with arrow/keyboard nav, focus trap
   ===================================================================== */

(function () {
  'use strict';

  // ─── PROJECT DATA ─────────────────────────────────────────────────────
  const projects = [
    {
      id: 1,
      category: 'residential',
      title: 'Hartwell Estate',
      year: '2024',
      image: 'https://images.unsplash.com/photo-X1P1_EDNnok?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85',
      description: 'A 4,800 sq ft custom estate home featuring a chef kitchen, three-car garage, and wraparound porch. Completed in 11 months with all custom millwork handled in-house.',
      services: ['Custom Home Build', 'Site Excavation', 'Landscaping', 'Full Project Management'],
    },
    {
      id: 2,
      category: 'residential',
      title: 'The Langford Residence',
      year: '2023',
      image: 'https://images.unsplash.com/photo-ymf4_9Y9S_A?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85',
      description: 'A modern craftsman home on a sloped lot in Springfield. Required complex foundation work and custom framing. Delivered two weeks ahead of schedule.',
      services: ['Custom Home Build', 'Foundation Engineering', 'Framing', 'Finish Carpentry'],
    },
    {
      id: 3,
      category: 'residential',
      title: 'Cedar Ridge Custom Home',
      year: '2022',
      image: 'https://images.unsplash.com/photo-hfI0pr6g4yw?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85',
      description: 'Three-bedroom custom build with a full basement and attached studio. Included geothermal HVAC coordination and stamped concrete driveway.',
      services: ['Design-Build', 'Basement Excavation', 'MEP Coordination', 'Exterior Hardscape'],
    },
    {
      id: 4,
      category: 'commercial',
      title: 'Riverside Professional Center',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?w=1200&q=85',
      description: 'A 22,000 sq ft professional office complex along the river corridor. Tilt-up construction with a glass curtain wall lobby. LEED Silver certified.',
      services: ['Tilt-Up Construction', 'GC Services', 'Glass Curtain Wall', 'LEED Documentation'],
    },
    {
      id: 5,
      category: 'commercial',
      title: 'Summit Storage Complex',
      year: '2023',
      image: 'https://images.unsplash.com/photo-PlBsJ5MybGc?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85',
      description: 'An 80-unit climate-controlled self-storage facility. Completed on a compressed 9-month schedule. On-site offices and gated entry included.',
      services: ['Commercial Build', 'Site Prep', 'Electrical Coordination', 'Security Systems'],
    },
    {
      id: 6,
      category: 'commercial',
      title: 'Northgate Retail Plaza',
      year: '2022',
      image: 'https://images.unsplash.com/photo-8Gg2Ne_uTcM?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?w=1200&q=85',
      description: 'A 14-tenant strip center with shared parking for 280 vehicles. Ground-up build including utility infrastructure. Fully leased at ribbon cutting.',
      services: ['GC Services', 'Utility Infrastructure', 'Parking Lot Construction', 'Tenant Coordination'],
    },
    {
      id: 7,
      category: 'excavation',
      title: 'Lake Meridian Basin Prep',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1622082679766-c5912d9416eb?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1622082679766-c5912d9416eb?w=1200&q=85',
      description: 'Earthworks for a 12-acre stormwater retention basin serving a new residential development. Involved 40,000+ cubic yards of soil removal and grading.',
      services: ['Heavy Excavation', 'Grading', 'Erosion Control', 'Compaction Testing'],
    },
    {
      id: 8,
      category: 'excavation',
      title: 'Highway 7 Utility Trenching',
      year: '2023',
      image: 'https://images.unsplash.com/photo-nkxB5Ab-ONY?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1622082679766-c5912d9416eb?w=1200&q=85',
      description: 'Utility trench installation for a 2.4-mile fiber and electric corridor along Highway 7. Coordinated with IDOT for lane closures and traffic management.',
      services: ['Trench Excavation', 'Utility Corridor', 'IDOT Coordination', 'Backfill and Compaction'],
    },
    {
      id: 9,
      category: 'excavation',
      title: 'Willowbrook Pond Excavation',
      year: '2022',
      image: 'https://images.unsplash.com/photo-pX66y31DOIQ?w=1200&q=85',
      fallbackImage: 'https://images.unsplash.com/photo-1622082679766-c5912d9416eb?w=1200&q=85',
      description: 'Excavation and shaping of a 3-acre decorative pond and wetland feature for a private estate. Included clay liner installation and inlet/outlet structures.',
      services: ['Pond Excavation', 'Clay Liner Install', 'Inlet/Outlet Structures', 'Riparian Restoration'],
    },
  ];

  // ─── FILTER ───────────────────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;

      projectCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ─── LIGHTBOX ─────────────────────────────────────────────────────────
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbBadge = lightbox.querySelector('.lightbox-badge');
  const lbTitle = lightbox.querySelector('.lightbox-title');
  const lbYear = lightbox.querySelector('.lightbox-year');
  const lbDesc = lightbox.querySelector('.lightbox-desc');
  const lbServices = lightbox.querySelector('.lightbox-services-list');
  const lbCounter = lightbox.querySelector('.lightbox-counter');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbPrev = lightbox.querySelector('.lb-prev');
  const lbNext = lightbox.querySelector('.lb-next');

  let currentIndex = 0;
  let visibleProjects = [...projects];

  function getCategoryLabel(cat) {
    const map = { residential: 'Residential', commercial: 'Commercial', excavation: 'Excavation' };
    return map[cat] || cat;
  }

  function renderLightbox(index) {
    const p = visibleProjects[index];
    if (!p) return;

    // Image with fallback
    const img = new Image();
    img.onload = function () {
      lbImg.src = img.src;
    };
    img.onerror = function () {
      lbImg.src = p.fallbackImage;
    };
    img.src = p.image;
    lbImg.alt = p.title;
    lbImg.src = p.image;

    lbBadge.textContent = getCategoryLabel(p.category);
    lbTitle.textContent = p.title;
    lbYear.textContent = p.year;
    lbDesc.textContent = p.description;

    lbServices.innerHTML = '';
    p.services.forEach(function (s) {
      const li = document.createElement('li');
      li.textContent = s;
      lbServices.appendChild(li);
    });

    lbCounter.textContent = (index + 1) + ' / ' + visibleProjects.length;

    lbPrev.disabled = index === 0;
    lbNext.disabled = index === visibleProjects.length - 1;
  }

  function openLightbox(projectId) {
    const activeFilter = document.querySelector('.filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';

    if (filter === 'all') {
      visibleProjects = [...projects];
    } else {
      visibleProjects = projects.filter(function (p) { return p.category === filter; });
    }

    const idx = visibleProjects.findIndex(function (p) { return p.id === projectId; });
    currentIndex = idx >= 0 ? idx : 0;

    renderLightbox(currentIndex);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    setTimeout(function () { lbClose.focus(); }, 50);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prevProject() {
    if (currentIndex > 0) {
      currentIndex--;
      renderLightbox(currentIndex);
    }
  }

  function nextProject() {
    if (currentIndex < visibleProjects.length - 1) {
      currentIndex++;
      renderLightbox(currentIndex);
    }
  }

  // Card click handlers
  projectCards.forEach(function (card) {
    card.addEventListener('click', function () {
      const id = parseInt(card.dataset.id, 10);
      openLightbox(id);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = parseInt(card.dataset.id, 10);
        openLightbox(id);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prevProject);
  lbNext.addEventListener('click', nextProject);

  // Click outside lightbox-inner to close
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevProject();
    if (e.key === 'ArrowRight') nextProject();
  });

  // Focus trap
  lightbox.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open') || e.key !== 'Tab') return;

    const focusable = lightbox.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Handle broken images in project cards with amber gradient placeholder
  const cardImgs = document.querySelectorAll('.project-card img');
  cardImgs.forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      const card = img.closest('.project-card');
      if (card) {
        card.style.background = 'linear-gradient(135deg, #1E2228 0%, #2A2F38 100%)';
      }
    });
  });

})();
