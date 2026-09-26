/**
 * ============================================================================
 * SHRAVAN R BANGERA — MULTI-PAGE DIGITAL STUDIO SCRIPT
 * Vanilla JS Architecture: Seamless Room Transitions, History API, Custom Cursor,
 * Dynamic Simulations, Lightbox & Case Study Modals.
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management
  let isTransitioning = false;
  let cursorDot = null;
  let cursorRing = null;
  let cursorLabel = null;
  let isFinePointer = false;
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  // --------------------------------------------------------------------------
  // 1. GLOBAL INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initHeaderScroll();
    initMobileNav();
    initPageModules();
    initSeamlessTransitions();
  });

  // --------------------------------------------------------------------------
  // 2. SEAMLESS "DIGITAL ROOM" PAGE TRANSITIONS (SPA Experience with History API)
  // --------------------------------------------------------------------------
  function initSeamlessTransitions() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;
      const hrefLower = href.toLowerCase();

      // Skip external links, mailto, tel, pdf downloads, and custom action buttons
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || hrefLower.endsWith('.pdf') || hrefLower.includes('.pdf') || hrefLower.includes('resume') || link.hasAttribute('download')) {
        return;
      }

      // Handle pure hash anchor on current page
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.querySelector(href);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.remove('pulse-highlight');
          void targetEl.offsetWidth;
          targetEl.classList.add('pulse-highlight');
          setTimeout(() => targetEl.classList.remove('pulse-highlight'), 3600);
        }
        return;
      }

      // Handle relative/internal html paths
      try {
        const targetUrlObj = new URL(href, window.location.href);
        const currentUrlObj = new URL(window.location.href);

        if (targetUrlObj.origin === currentUrlObj.origin) {
          e.preventDefault();
          if (isTransitioning) return;

          // If on the exact same page with a hash
          if (targetUrlObj.pathname === currentUrlObj.pathname && targetUrlObj.hash) {
            const targetEl = document.querySelector(targetUrlObj.hash);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetEl.classList.remove('pulse-highlight');
              void targetEl.offsetWidth;
              targetEl.classList.add('pulse-highlight');
              setTimeout(() => targetEl.classList.remove('pulse-highlight'), 3600);
            }
            return;
          }

          // Same page without hash: scroll to top
          if (targetUrlObj.pathname === currentUrlObj.pathname && !targetUrlObj.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          navigateRoom(href);
        }
      } catch (err) {
        // Allow default navigation fallback
      }
    });

    // Handle Browser Back / Forward Navigation
    window.addEventListener('popstate', () => {
      loadPageContent(window.location.href, false);
    });
  }

  async function navigateRoom(url) {
    if (isTransitioning) return;
    isTransitioning = true;

    const curtain = document.getElementById('pageTransitionCurtain');
    if (curtain) {
      curtain.classList.add('active');
    }

    // Short cinematic transition pause
    await new Promise((resolve) => setTimeout(resolve, 260));

    await loadPageContent(url, true);

    if (curtain) {
      curtain.classList.remove('active');
    }
    isTransitioning = false;
  }

  async function loadPageContent(url, pushToHistory = true) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        window.location.href = url;
        return;
      }

      const htmlText = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(htmlText, 'text/html');

      // Update Page Title
      document.title = newDoc.title;

      // Update Body Dataset Page
      const newPageKey = newDoc.body.getAttribute('data-page') || 'home';
      document.body.setAttribute('data-page', newPageKey);

      // Replace Main Content Wrapper
      const currentMain = document.getElementById('mainContent');
      const newMain = newDoc.getElementById('mainContent');

      if (currentMain && newMain) {
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.classList.remove('page-enter');
        void currentMain.offsetWidth; // Trigger reflow
        currentMain.classList.add('page-enter');
      }

      // Update Active Navigation Item
      updateActiveNavLink(url);

      // Update History API
      if (pushToHistory) {
        window.history.pushState({ page: newPageKey }, newDoc.title, url);
      }

      // Re-initialize all interactive components on the new page
      initPageModules();
      initMobileNav();
      attachCursorHoverListeners();

      // Check for anchor hash
      try {
        const hash = new URL(url, window.location.href).hash;
        if (hash) {
          setTimeout(() => {
            const el = document.querySelector(hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.remove('pulse-highlight');
              void el.offsetWidth;
              el.classList.add('pulse-highlight');
              setTimeout(() => el.classList.remove('pulse-highlight'), 3600);
            }
          }, 140);
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      } catch (e) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

    } catch (err) {
      console.warn('Navigation fallback triggered:', err);
      window.location.href = url;
    }
  }

  function updateActiveNavLink(url) {
    const navItems = document.querySelectorAll('.nav-item');
    const path = new URL(url, window.location.href).pathname.split('/').pop() || 'index.html';

    navItems.forEach((item) => {
      const href = item.getAttribute('href').split('/').pop() || 'index.html';
      if (href === path || (path === '' && href === 'index.html')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. CUSTOM MAGNETIC CURSOR
  // --------------------------------------------------------------------------
  function initCursor() {
    isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    cursorDot = document.getElementById('cursorDot');
    cursorRing = document.getElementById('cursorRing');
    cursorLabel = document.getElementById('cursorLabel');

    if (!isFinePointer || !cursorDot || !cursorRing) return;

    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    ringX = mouseX;
    ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    const renderLoop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);

    attachCursorHoverListeners();
  }

  function attachCursorHoverListeners() {
    if (!isFinePointer || !cursorRing) return;

    const hoverElements = document.querySelectorAll('a, button, [data-magnetic], input, textarea, .gallery-item, .value-feature-card, .pillar-card, .portal-room-card, .milestone-block, .credential-item-card');

    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('cursor-hover');
        const text = el.getAttribute('data-cursor-text');
        if (text && cursorLabel) {
          cursorLabel.textContent = text;
          cursorRing.classList.add('cursor-text-active');
        }
      });

      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('cursor-hover');
        cursorRing.classList.remove('cursor-text-active');
        if (cursorLabel) cursorLabel.textContent = '';
        if (el.hasAttribute('data-magnetic')) {
          el.style.transform = 'translate3d(0, 0, 0)';
        }
      });

      if (el.hasAttribute('data-magnetic')) {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate3d(${x * 0.22}px, ${y * 0.22}px, 0)`;
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. HEADER CONDENSING ON SCROLL
  // --------------------------------------------------------------------------
  function initHeaderScroll() {
    const studioHeader = document.getElementById('studioHeader');
    if (!studioHeader) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        studioHeader.classList.add('header-condensed');
      } else {
        studioHeader.classList.remove('header-condensed');
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 5. MOBILE NAVIGATION DRAWER
  // --------------------------------------------------------------------------
  function initMobileNav() {
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const navMenuWrapper = document.getElementById('navMenuWrapper');

    if (menuToggleBtn && navMenuWrapper) {
      // Remove previous listener clones
      const newToggle = menuToggleBtn.cloneNode(true);
      menuToggleBtn.parentNode.replaceChild(newToggle, menuToggleBtn);

      newToggle.addEventListener('click', () => {
        const isExpanded = newToggle.getAttribute('aria-expanded') === 'true';
        newToggle.setAttribute('aria-expanded', !isExpanded);
        newToggle.classList.toggle('active');
        navMenuWrapper.classList.toggle('active');
      });

      const navLinks = navMenuWrapper.querySelectorAll('.nav-item');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          newToggle.classList.remove('active');
          navMenuWrapper.classList.remove('active');
          newToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. PAGE-SPECIFIC MODULES & INTERACTION INITIALIZERS
  // --------------------------------------------------------------------------
  function initPageModules() {
    initStaggeredReveals();
    initHeroParallax();
    initTimelineConstellation();
    initImpactCounters();
    initFoodIQSimulator();
    initPhotographyGallery();
    initCaseStudyModals();
    initContactForm();
    initAboutPillars();
    initRecruiterModal();
    initAchievementMuseum();
    initLearningNetwork();
    initStoryMomentCards();
    initLeadershipModal();
    initCredentialDetailModal();
    initCloudMascot();
  }

  // Staggered Scroll Reveals
  function initStaggeredReveals() {
    const items = document.querySelectorAll('.reveal-item, .glass-panel');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, parseInt(delay, 10));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    items.forEach((el) => observer.observe(el));
  }

  // Hero 3D Portrait Tilt (Home)
  function initHeroParallax() {
    const heroSec = document.querySelector('.home-hero-section');
    const portraitStage = document.getElementById('portraitStage');

    if (heroSec && portraitStage && window.innerWidth > 1024) {
      heroSec.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const rotateY = ((clientX - innerWidth / 2) / innerWidth) * 12;
        const rotateX = -((clientY - innerHeight / 2) / innerHeight) * 12;
        portraitStage.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      heroSec.addEventListener('mouseleave', () => {
        portraitStage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    }
  }

  // Timeline Scroll Line & Constellation Nodes (Journey)
  function initTimelineConstellation() {
    const timelineProgress = document.getElementById('timelineProgress');
    const timelineContainer = document.querySelector('.timeline-container');

    if (timelineProgress && timelineContainer) {
      window.addEventListener('scroll', () => {
        const rect = timelineContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
          const total = rect.height;
          const current = windowHeight - rect.top - 80;
          const pct = Math.min(Math.max((current / total) * 100, 0), 100);
          timelineProgress.style.height = `${pct}%`;
        }
      }, { passive: true });
    }
  }

  // Impact Numerical Metrics Counter (Journey)
  function initImpactCounters() {
    const metricNumbers = document.querySelectorAll('.metric-number');
    const impactStrip = document.getElementById('impactMetrics');
    let animated = false;

    if (impactStrip && metricNumbers.length > 0) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            metricNumbers.forEach((stat) => {
              const target = parseInt(stat.getAttribute('data-target'), 10);
              let current = 0;
              const step = Math.ceil(target / 45);
              const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                  stat.textContent = target;
                  clearInterval(timer);
                } else {
                  stat.textContent = current;
                }
              }, 30);
            });
          }
        });
      }, { threshold: 0.3 });

      statsObserver.observe(impactStrip);
    }
  }

  // FoodIQ Interactive Live Neural Simulator (Projects)
  function initFoodIQSimulator() {
    const dishButtons = document.querySelectorAll('.dish-btn');
    const hudDetection = document.getElementById('hudDetection');
    const hudConfidence = document.getElementById('hudConfidence');
    const hudCal = document.getElementById('hudCal');
    const hudProtein = document.getElementById('hudProtein');
    const hudCarbs = document.getElementById('hudCarbs');
    const hudScore = document.getElementById('hudScore');

    const donutKcal = document.getElementById('donutKcal');
    const donutProtein = document.getElementById('donutProtein');
    const donutCarbs = document.getElementById('donutCarbs');
    const donutFats = document.getElementById('donutFats');
    const legProtein = document.getElementById('legProtein');
    const legCarbs = document.getElementById('legCarbs');
    const legFats = document.getElementById('legFats');

    if (!dishButtons.length || !hudDetection) return;

    const dataset = {
      avocado: {
        name: 'AVOCADO SALAD',
        confidence: '98.4%',
        cal: '320',
        protein: '12.5g',
        carbs: '24.0g',
        score: '92',
        pPct: 25,
        cPct: 50,
        fPct: 25,
        pVal: '12.5g (25%)',
        cVal: '24.0g (50%)',
        fVal: '14.2g (25%)'
      },
      salmon: {
        name: 'GRILLED SALMON BOWL',
        confidence: '99.1%',
        cal: '480',
        protein: '38.0g',
        carbs: '32.0g',
        score: '96',
        pPct: 45,
        cPct: 35,
        fPct: 20,
        pVal: '38.0g (45%)',
        cVal: '32.0g (35%)',
        fVal: '18.5g (20%)'
      },
      oatmeal: {
        name: 'BERRY OATMEAL BOWL',
        confidence: '97.6%',
        cal: '260',
        protein: '9.0g',
        carbs: '45.0g',
        score: '88',
        pPct: 15,
        cPct: 70,
        fPct: 15,
        pVal: '9.0g (15%)',
        cVal: '45.0g (70%)',
        fVal: '5.2g (15%)'
      }
    };

    dishButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        dishButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-dish');
        const data = dataset[key];

        if (data && hudDetection) {
          hudDetection.style.opacity = '0';
          hudConfidence.style.opacity = '0';

          setTimeout(() => {
            hudDetection.textContent = `AI Recognition: ${data.name}`;
            hudConfidence.textContent = `Confidence: ${data.confidence}`;
            hudCal.textContent = data.cal;
            hudProtein.textContent = data.protein;
            hudCarbs.textContent = data.carbs;
            hudScore.textContent = data.score;

            if (donutKcal) donutKcal.innerHTML = `${data.cal}<br><span style="font-size:9px; font-weight:700; color:var(--text-muted);">KCAL</span>`;
            if (donutProtein) {
              donutProtein.setAttribute('stroke-dasharray', `${data.pPct} 100`);
              donutProtein.setAttribute('stroke-dashoffset', '0');
            }
            if (donutCarbs) {
              donutCarbs.setAttribute('stroke-dasharray', `${data.cPct} 100`);
              donutCarbs.setAttribute('stroke-dashoffset', `-${data.pPct}`);
            }
            if (donutFats) {
              donutFats.setAttribute('stroke-dasharray', `${data.fPct} 100`);
              donutFats.setAttribute('stroke-dashoffset', `-${data.pPct + data.cPct}`);
            }
            if (legProtein) legProtein.textContent = data.pVal;
            if (legCarbs) legCarbs.textContent = data.cVal;
            if (legFats) legFats.textContent = data.fVal;

            hudDetection.style.opacity = '1';
            hudConfidence.style.opacity = '1';
          }, 150);
        }
      });
    });
  }

  // Photography Gallery Filters & Lightbox (Creative Work)
  function initPhotographyGallery() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxAward = document.getElementById('lightboxAward');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');

    if (!galleryItems.length) return;

    // Filter Buttons
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        galleryItems.forEach((item) => {
          const cat = item.getAttribute('data-category') || '';
          if (filter === 'all' || cat.includes(filter)) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 30);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 200);
          }
        });
      });
    });

    // Lightbox Logic
    let currentIndex = 0;
    const itemsArray = Array.from(galleryItems);

    const openLightbox = (idx) => {
      if (!lightboxModal || idx < 0 || idx >= itemsArray.length) return;
      currentIndex = idx;
      const el = itemsArray[currentIndex];
      lightboxImg.src = el.getAttribute('data-img') || '';
      lightboxImg.alt = el.getAttribute('data-title') || '';
      lightboxTitle.textContent = el.getAttribute('data-title') || '';
      lightboxAward.textContent = el.getAttribute('data-award') || '';
      lightboxDesc.textContent = el.getAttribute('data-desc') || '';

      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      if (!lightboxModal) return;
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    itemsArray.forEach((item, i) => {
      item.onclick = () => openLightbox(i);
    });

    if (lightboxCloseBtn) lightboxCloseBtn.onclick = closeLightbox;
    if (lightboxPrevBtn) {
      lightboxPrevBtn.onclick = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
        openLightbox(currentIndex);
      };
    }
    if (lightboxNextBtn) {
      lightboxNextBtn.onclick = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % itemsArray.length;
        openLightbox(currentIndex);
      };
    }

    if (lightboxModal) {
      lightboxModal.onclick = (e) => {
        if (e.target === lightboxModal) closeLightbox();
      };
    }

    // Keyboard controls
    window.onkeydown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
        const csModal = document.getElementById('caseStudyModal');
        if (csModal) {
          csModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      } else if (e.key === 'ArrowLeft' && lightboxModal && lightboxModal.classList.contains('active')) {
        currentIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
        openLightbox(currentIndex);
      } else if (e.key === 'ArrowRight' && lightboxModal && lightboxModal.classList.contains('active')) {
        currentIndex = (currentIndex + 1) % itemsArray.length;
        openLightbox(currentIndex);
      }
    };
  }

  // Case Study Modals (Projects)
  function initCaseStudyModals() {
    const modal = document.getElementById('caseStudyModal');
    const closeBtn = document.getElementById('caseStudyCloseBtn');
    const csCategory = document.getElementById('csCategory');
    const csTitle = document.getElementById('csTitle');
    const csTagline = document.getElementById('csTagline');
    const csOverview = document.getElementById('csOverview');
    const csWorkedOn = document.getElementById('csWorkedOn');
    const csFeatures = document.getElementById('csFeatures');
    const csLearned = document.getElementById('csLearned');
    const triggers = document.querySelectorAll('.open-case-study');

    if (!modal || !triggers.length) return;

    const caseStudyData = {
      foodiq: {
        category: 'FULL-STACK & AI COMPUTER VISION CASE STUDY',
        title: 'FoodIQ – AI-Powered Food & Nutrition Recognition System',
        tagline: '“React frontend, Node.js/Express backend, 148,000+ image deep learning model & USDA nutrition tracking.”',
        overview: 'Built a full-stack web application (React frontend, Node.js/Express backend) that lets users upload a photo of any meal and instantly identifies the food item, calculating macronutrients and a 0–100 health score in real time.',
        workedOn: 'Engineered the React UI and Node.js/Express REST API, integrated the deep learning model trained on 148,000+ food images (Indian dishes, fruits, vegetables, and global foods), and linked predictions to the USDA nutrition database.',
        features: [
          'Full-stack architecture: Modern React user interface backed by high-performance Node.js & Express API services.',
          'Deep learning image recognition trained on 148,000+ images covering Indian dishes, fruits, vegetables, and international cuisines.',
          'Real-time connection to the official USDA nutrition database for automated calculation of calories, protein, carbohydrates, and fats.',
          'Automated 0–100 health scoring engine assessing nutrient density and meal balance.'
        ],
        learned: 'Mastered combining full-stack React and Node.js/Express web development with deep-learning vision inference, USDA nutrition database synchronization, and responsive real-time data visualization.'
      },
      studio: {
        category: 'FULL-STACK OPERATIONS & WORKFLOW CASE STUDY',
        title: 'Photo Studio Management System (PSMS)',
        tagline: '“An integrated platform for appointment scheduling, client database management, billing, and asset organization.”',
        overview: 'Designed a comprehensive platform integrating appointment scheduling, client database management, billing, and asset organization, eliminating double bookings and streamlining studio operations.',
        workedOn: 'Architected the relational schema, engineered conflict-free appointment scheduling algorithms, built client databases, automated billing, and developed media asset organization vaults.',
        features: [
          'Real-time conflict-free appointment scheduling engine eliminating double bookings across studio sessions.',
          'Unified client database management tracking shoot history, client preferences, and contact records.',
          'Automated invoicing and billing management system with transparent payment tracking.',
          'Secure digital asset organization repository linking final deliverables to client profiles.'
        ],
        learned: 'Deepened practical expertise in full-stack architecture, relational database management (SQL), business process automation, and operational software reliability.'
      }
    };

    triggers.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-project');
        const data = caseStudyData[key];
        if (!data) return;

        csCategory.textContent = data.category;
        csTitle.textContent = data.title;
        csTagline.textContent = data.tagline;
        csOverview.textContent = data.overview;
        csWorkedOn.textContent = data.workedOn;
        csLearned.textContent = data.learned;

        csFeatures.innerHTML = '';
        data.features.forEach((f) => {
          const li = document.createElement('li');
          li.textContent = f;
          csFeatures.appendChild(li);
        });

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      };
    });

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
  }

  // Interactive Concept Pillars Hover Effects (About)
  function initAboutPillars() {
    const pillars = document.querySelectorAll('.pillar-card');
    const ambientOrb = document.querySelector('.orb-primary');

    if (!pillars.length || !ambientOrb) return;

    pillars.forEach((p) => {
      p.addEventListener('mouseenter', () => {
        const theme = p.getAttribute('data-pillar-theme');
        if (theme === 'tech') {
          ambientOrb.style.background = 'radial-gradient(circle, rgba(8, 120, 201, 0.45) 0%, rgba(56, 189, 248, 0.2) 70%, transparent 100%)';
        } else if (theme === 'creative') {
          ambientOrb.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(0, 169, 157, 0.2) 70%, transparent 100%)';
        } else if (theme === 'lead') {
          ambientOrb.style.background = 'radial-gradient(circle, rgba(2, 132, 199, 0.45) 0%, rgba(14, 165, 233, 0.2) 70%, transparent 100%)';
        } else if (theme === 'media') {
          ambientOrb.style.background = 'radial-gradient(circle, rgba(0, 169, 157, 0.45) 0%, rgba(16, 185, 129, 0.2) 70%, transparent 100%)';
        }
      });

      p.addEventListener('mouseleave', () => {
        ambientOrb.style.background = 'radial-gradient(circle, rgba(8, 120, 201, 0.32) 0%, rgba(56, 189, 248, 0.1) 70%, transparent 100%)';
      });
    });
  }

  // Contact Form Validation & Feedback (Contact)
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('formFeedback');

    if (!form || !feedback) return;

    form.onsubmit = (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('userName');
      const emailInput = document.getElementById('userEmail');
      const subjectInput = document.getElementById('userSubject');
      const messageInput = document.getElementById('userMessage');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !subjectInput.value.trim() || !messageInput.value.trim()) {
        feedback.className = 'form-feedback-message error';
        feedback.textContent = 'Please fill out all required fields before sending.';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        feedback.className = 'form-feedback-message error';
        feedback.textContent = 'Please enter a valid email address.';
        return;
      }

      feedback.className = 'form-feedback-message success';
      feedback.textContent = `Thank you, ${nameInput.value.trim()}! Your note has been received. I will reply to ${emailInput.value.trim()} shortly.`;
      form.reset();

      setTimeout(() => {
        feedback.style.display = 'none';
        feedback.className = 'form-feedback-message';
      }, 7000);
    };
  }

  // Recruiter Executive Briefing Modal
  function initRecruiterModal() {
    const trigger = document.getElementById('recruiterModalTrigger');
    const modal = document.getElementById('recruiterModal');
    const closeBtn = document.getElementById('recruiterCloseBtn');

    if (!modal) return;

    const openModal = () => {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (trigger) {
      trigger.onclick = (e) => {
        e.preventDefault();
        openModal();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Achievement Museum Dynamic Filter Tabs
  function initAchievementMuseum() {
    const tabs = document.querySelectorAll('.museum-filter-tab');
    const cards = document.querySelectorAll('.museum-exhibit-card');

    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-museum-filter') || 'all';

        cards.forEach((card) => {
          const cat = card.getAttribute('data-museum-category') || '';
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            }, 30);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px) scale(0.96)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // Learning Network Interactive Knowledge Graph
  function initLearningNetwork() {
    const nodes = document.querySelectorAll('.learning-node-card');
    const connectors = document.querySelectorAll('.learning-node-connector');

    if (!nodes.length) return;

    nodes.forEach((node, idx) => {
      node.addEventListener('mouseenter', () => {
        node.classList.add('node-active');
        if (connectors[idx]) connectors[idx].classList.add('connector-active');
        if (connectors[idx - 1]) connectors[idx - 1].classList.add('connector-active');
      });

      node.addEventListener('mouseleave', () => {
        node.classList.remove('node-active');
        connectors.forEach((c) => c.classList.remove('connector-active'));
      });
    });
  }

  // Story Moment Cards Proof-of-Work Interactions
  function initStoryMomentCards() {
    const moments = document.querySelectorAll('.story-moment-card, .story-spotlight-card');
    moments.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'rgba(8, 120, 201, 0.45)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '';
      });
    });
  }

  // Leadership Overlay Modal (Story Page)
  function initLeadershipModal() {
    const trigger = document.getElementById('openLeadershipModalBtn');
    const modal = document.getElementById('leadershipOverlayModal');
    const closeBtn = document.getElementById('leadershipCloseBtn');
    const evolutionCards = document.querySelectorAll('.story-spotlight-card[data-cursor-text="EVOLUTION"]');

    if (!modal) return;

    const openModal = () => {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (trigger) {
      trigger.onclick = (e) => {
        e.preventDefault();
        openModal();
      };
    }

    evolutionCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          openModal();
        }
      });
    });

    if (closeBtn) closeBtn.onclick = closeModal;

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Credential Detail Popup Modal (Certifications Page)
  function initCredentialDetailModal() {
    const modal = document.getElementById('credentialDetailModal');
    const closeBtn = document.getElementById('credentialCloseBtn');
    const orgEl = document.getElementById('credModalOrg');
    const titleEl = document.getElementById('credModalTitle');
    const typeEl = document.getElementById('credModalType');
    const descEl = document.getElementById('credModalDesc');
    const skillsEl = document.getElementById('credModalSkills');
    const credCards = document.querySelectorAll('.credential-item-card[data-cred-key]');

    if (!modal || !credCards.length) return;

    const credentialData = {
      'azure-ai': {
        org: 'MICROSOFT CERTIFIED LEARNING',
        title: 'Microsoft Azure AI Learning Challenge',
        type: 'Cloud & Artificial Intelligence Systems',
        desc: 'Completed advanced challenge curriculum covering cognitive services, automated machine learning pipelines, deep learning vision models, and natural language understanding architectures hosted on Microsoft Azure cloud infrastructure.',
        skills: ['Computer Vision Models', 'Natural Language Processing', 'Azure Cognitive Services', 'ML Pipeline Inference', 'Cloud AI Solutions']
      },
      'ai-tools': {
        org: 'PROFESSIONAL MASTERCLASS',
        title: 'AI-Driven Professional & AI Tools Workshop',
        type: 'Generative AI & Productivity Architectures',
        desc: 'Hands-on intensive masterclass on integrating modern generative AI systems, prompt engineering frameworks, automated media synthesis, and intelligent developer workflows into real-world applications.',
        skills: ['Prompt Engineering', 'Generative AI Workflows', 'Productivity Tooling', 'Intelligent Automations', 'AI Assisted Design']
      },
      'data-analyst': {
        org: 'DATA ENGINEERING ACADEMY',
        title: 'AI – Data Engineering Analyst',
        type: 'Data Infrastructure & Analytical Schemas',
        desc: 'Practical technical training in relational database management, data ingestion pipelines, feature normalization, and interactive analytics reporting to feed AI model training and operational dashboards.',
        skills: ['Relational Schemas', 'Data Ingestion & Cleaning', 'Feature Engineering', 'SQL Query Optimization', 'Metric Analytics']
      },
      'cybersecurity': {
        org: 'ICT ACADEMY',
        title: 'Cyber Security Fundamentals',
        type: 'Information Security & Infrastructure Defense',
        desc: 'Comprehensive study of cybersecurity fundamentals including threat vector analysis, cryptographic standards, perimeter defenses, authentication protocols, and secure coding practices for web applications.',
        skills: ['Network Threat Vectors', 'Cryptography & SSL/TLS', 'Data Privacy', 'OWASP Top 10', 'Secure Application Hygiene']
      },
      'android': {
        org: 'DR. NSAM FGC ACADEMIC PROGRAM',
        title: 'Android Application Development',
        type: 'Mobile Software Engineering',
        desc: 'Foundational mobile engineering curriculum focused on Android SDK architectures, Activity/Fragment lifecycles, Material design layouts, background services, and local SQLite data persistence.',
        skills: ['Android SDK', 'Java / Kotlin Core', 'UI Layout XML', 'Activity Lifecycles', 'SQLite Mobile Storage']
      }
    };

    const openModal = (key) => {
      const data = credentialData[key];
      if (!data) return;

      if (orgEl) orgEl.textContent = data.org;
      if (titleEl) titleEl.textContent = data.title;
      if (typeEl) typeEl.textContent = data.type;
      if (descEl) descEl.textContent = data.desc;

      if (skillsEl) {
        skillsEl.innerHTML = '';
        data.skills.forEach((skill) => {
          const span = document.createElement('span');
          span.className = 'cred-detail-skill-tag';
          span.textContent = skill;
          skillsEl.appendChild(span);
        });
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    credCards.forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-cred-key');
        openModal(key);
      });
    });

    if (closeBtn) closeBtn.onclick = closeModal;

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 17. SPROUTBOT AI CHATBOT & SMART PROFILE NAVIGATOR
  // --------------------------------------------------------------------------
  function initCloudMascot() {
    const mascotBtn = document.getElementById('mascotAvatarBtn');
    const speechBubble = document.getElementById('mascotBubble');
    const chatPanel = document.getElementById('mascotChatPanel');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatResetBtn = document.getElementById('chatResetBtn');
    const chatInputForm = document.getElementById('chatInputForm');
    const chatInputText = document.getElementById('chatInputText');
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const chatQuickChips = document.getElementById('chatQuickChips');

    if (!mascotBtn) return;

    // Interactive Speech Bubble Guide Prompts
    const guideQuotes = [
      {
        badge: "🥗 LIVE AI PROJECT",
        text: "FoodIQ AI Nutrition Scanner (React + Node.js)",
        cta: "Click text to test live ↗",
        actionType: "nav",
        targetUrl: "projects.html",
        targetId: "#scannerStage",
        query: "Show me FoodIQ AI Scanner"
      },
      {
        badge: "🏆 1ST PLACE WINNER",
        text: "Nitte Aqua Lens '24 & ETTIN '25 Awards",
        cta: "Click text to view awards ↗",
        actionType: "nav",
        targetUrl: "journey.html",
        targetId: "#achievementMuseumGrid",
        query: "What awards has Shravan won?"
      },
      {
        badge: "📸 CREATIVE GALLERY",
        text: "Award-Winning Photography & Optics",
        cta: "Click text to explore gallery ↗",
        actionType: "nav",
        targetUrl: "journey.html",
        targetId: "#editorialGallery",
        query: "Show me photography gallery"
      },
      {
        badge: "📢 LEADERSHIP & SCALE",
        text: "180+ Volunteers Led as Media Head",
        cta: "Click text to see telemetry ↗",
        actionType: "nav",
        targetUrl: "journey.html",
        targetId: "#impactMetrics",
        query: "Tell me about leadership and media head"
      },
      {
        badge: "📄 VERIFIED CV",
        text: "Download Official Full-Stack Resume (PDF)",
        cta: "Click text to download ↗",
        actionType: "download",
        targetUrl: "assets/SHRAVAN_RESUME.pdf",
        query: "Download Shravan's resume"
      },
      {
        badge: "📬 GET IN TOUCH",
        text: "Direct Message & Collaboration Form",
        cta: "Click text to open contact ↗",
        actionType: "nav",
        targetUrl: "about.html",
        targetId: "#contactForm",
        query: "How can I contact Shravan?"
      },
      {
        badge: "⚡ RECRUITER 1-MIN BRIEF",
        text: "Executive Summary & Tech Highlights",
        cta: "Click text for recruiter modal ↗",
        actionType: "recruiter",
        query: "Show recruiter brief"
      },
      {
        badge: "🎓 ACADEMIC TIMELINE",
        text: "NMAMIT MCA & Dr NSAM BCA Education",
        cta: "Click text to view timeline ↗",
        actionType: "nav",
        targetUrl: "journey.html",
        targetId: ".timeline-container",
        query: "Tell me about education"
      }
    ];

    let quoteIndex = 0;
    let cycleInterval = null;

    const renderQuote = (index) => {
      if (!speechBubble || chatPanel?.classList.contains('active')) return;
      const quote = guideQuotes[index % guideQuotes.length];
      speechBubble.innerHTML = `
        <div class="bubble-content-wrap">
          <div class="bubble-header-tag">
            <span class="bubble-pill-dot"></span>
            <span class="bubble-badge-text">${quote.badge}</span>
          </div>
          <div class="bubble-headline">${quote.text}</div>
          <div class="bubble-guide-cue">👉 ${quote.cta}</div>
        </div>
      `;
      speechBubble.style.display = 'block';
      speechBubble.style.opacity = '1';
      speechBubble.style.transform = 'translateY(0)';
    };

    const startQuoteCycle = () => {
      if (cycleInterval) clearInterval(cycleInterval);
      renderQuote(quoteIndex);

      cycleInterval = setInterval(() => {
        if (!speechBubble || chatPanel?.classList.contains('active')) return;
        speechBubble.style.opacity = '0';
        speechBubble.style.transform = 'translateY(6px)';

        setTimeout(() => {
          quoteIndex = (quoteIndex + 1) % guideQuotes.length;
          renderQuote(quoteIndex);
        }, 380);
      }, 6200);
    };

    // Toggle Chat Panel
    const openChat = () => {
      if (chatPanel) {
        chatPanel.classList.add('active');
        chatPanel.setAttribute('aria-hidden', 'false');
        if (speechBubble) speechBubble.style.display = 'none';
        if (chatMessagesContainer && chatMessagesContainer.children.length === 0) {
          renderWelcomeMessage();
        }
        if (chatInputText) {
          setTimeout(() => chatInputText.focus(), 250);
        }
      }
    };

    const closeChat = () => {
      if (chatPanel) {
        chatPanel.classList.remove('active');
        chatPanel.setAttribute('aria-hidden', 'true');
        if (speechBubble) {
          setTimeout(() => {
            if (!chatPanel.classList.contains('active')) {
              renderQuote(quoteIndex);
            }
          }, 400);
        }
      }
    };

    mascotBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mascotBtn.classList.remove('bounce');
      void mascotBtn.offsetWidth;
      mascotBtn.classList.add('bounce');

      if (chatPanel?.classList.contains('active')) {
        closeChat();
      } else {
        openChat();
      }
    });

    // Speech bubble click: Directly guide the user to that section/action!
    if (speechBubble) {
      speechBubble.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentQuote = guideQuotes[quoteIndex % guideQuotes.length];
        if (currentQuote) {
          handleSmartAction(currentQuote.actionType, currentQuote.targetUrl, currentQuote.targetId);
        }
      });
    }

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeChat();
      });
    }

    if (chatResetBtn) {
      chatResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chatMessagesContainer) {
          chatMessagesContainer.innerHTML = '';
          renderWelcomeMessage();
        }
      });
    }

    // Close on Escape or click outside
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatPanel?.classList.contains('active')) {
        closeChat();
      }
    });

    document.addEventListener('click', (e) => {
      if (chatPanel?.classList.contains('active') && !chatPanel.contains(e.target) && !mascotBtn.contains(e.target) && !speechBubble?.contains(e.target)) {
        closeChat();
      }
    });

    // Start cycling quotes after initial page mount
    setTimeout(() => {
      startQuoteCycle();
    }, 1500);

    // Render Welcome Message
    const renderWelcomeMessage = () => {
      if (!chatMessagesContainer) return;
      appendBotMessage({
        text: "👋 **Hello! I'm SproutBot**, Shravan's intelligent digital companion and profile guide.\n\nClick any link or button below, or type what you're looking for, and I will **instantly guide you there** with precision scrolling!",
        actionTitle: "Popular Quick Actions",
        actionDesc: "Tap any topic below to navigate directly:",
        actions: [
          { label: "🥗 FoodIQ AI Vision Scanner", targetUrl: "projects.html", targetId: "#scannerStage" },
          { label: "🏆 Awards & Honors Museum", targetUrl: "journey.html", targetId: "#achievementMuseumGrid" },
          { label: "📸 Award-Winning Photography", targetUrl: "journey.html", targetId: "#editorialGallery" },
          { label: "📢 180+ Volunteers Telemetry", targetUrl: "journey.html", targetId: "#impactMetrics" },
          { label: "📄 Download Official Resume (PDF)", type: "download" },
          { label: "⚡ Recruiter 1-Minute Brief", type: "recruiter" }
        ]
      });
    };

    // Append Messages Helper
    const appendUserMessage = (text) => {
      const msg = document.createElement('div');
      msg.className = 'chat-msg user';
      msg.innerHTML = `
        <div class="msg-bubble">${escapeHtml(text)}</div>
        <div class="chat-msg-user-avatar">YOU</div>
      `;
      chatMessagesContainer.appendChild(msg);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const showTypingIndicator = () => {
      const typingEl = document.createElement('div');
      typingEl.className = 'chat-msg bot typing-msg';
      typingEl.id = 'sproutTypingIndicator';
      typingEl.innerHTML = `
        <img src="assets/sprout-mascot.jpg" alt="SproutBot" class="chat-msg-avatar">
        <div class="msg-bubble">
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      `;
      chatMessagesContainer.appendChild(typingEl);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      return typingEl;
    };

    const removeTypingIndicator = () => {
      const el = document.getElementById('sproutTypingIndicator');
      if (el) el.remove();
    };

    const appendBotMessage = (data) => {
      removeTypingIndicator();
      const msg = document.createElement('div');
      msg.className = 'chat-msg bot';
      
      let formattedText = formatMarkdown(data.text);
      let actionsHtml = '';

      if (data.actions && data.actions.length > 0) {
        actionsHtml = `
          <div class="chat-action-card">
            ${data.actionTitle ? `<div class="chat-action-card-title">${data.actionTitle}</div>` : ''}
            ${data.actionDesc ? `<div class="chat-action-card-desc">${data.actionDesc}</div>` : ''}
            <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 4px;">
              ${data.actions.map(act => `
                <button 
                  class="chat-nav-action-btn" 
                  data-action-type="${act.type || 'nav'}" 
                  data-target-url="${act.targetUrl || ''}" 
                  data-target-id="${act.targetId || ''}"
                >
                  ${act.label} &rarr;
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      msg.innerHTML = `
        <img src="assets/sprout-mascot.jpg" alt="SproutBot" class="chat-msg-avatar">
        <div class="msg-bubble">
          ${formattedText}
          ${actionsHtml}
        </div>
      `;

      chatMessagesContainer.appendChild(msg);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

      // Attach click events to inline guide links and action buttons
      const inlineLinks = msg.querySelectorAll('.inline-guide-link');
      inlineLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const type = link.getAttribute('data-action-type') || 'nav';
          const targetUrl = link.getAttribute('data-target-url') || '';
          const targetId = link.getAttribute('data-target-id') || '';
          handleSmartAction(type, targetUrl, targetId);
        });
      });

      const actionBtns = msg.querySelectorAll('.chat-nav-action-btn');
      actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const type = btn.getAttribute('data-action-type') || 'nav';
          const targetUrl = btn.getAttribute('data-target-url') || '';
          const targetId = btn.getAttribute('data-target-id') || '';
          handleSmartAction(type, targetUrl, targetId);
        });
      });
    };

    // Smart Action & Deep Link Execution: Guides the user directly to the section!
    const handleSmartAction = async (type, targetUrl, targetId) => {
      if (type === 'download') {
        const a = document.createElement('a');
        a.href = 'assets/SHRAVAN_RESUME.pdf';
        a.download = 'SHRAVAN_RESUME.pdf';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        closeChat();
        return;
      }

      if (type === 'recruiter') {
        closeChat();
        const recModal = document.getElementById('recruiterModal');
        if (recModal) {
          recModal.classList.add('active');
          recModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
        return;
      }

      if (type === 'nav' && targetUrl) {
        closeChat();
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetPath = targetUrl.split('/').pop() || 'index.html';

        if (currentPath === targetPath) {
          if (targetId) {
            scrollToTarget(targetId);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          await navigateRoom(targetUrl);
          if (targetId) {
            setTimeout(() => scrollToTarget(targetId), 450);
          }
        }
      }
    };

    const scrollToTarget = (selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('pulse-highlight');
        void el.offsetWidth;
        el.classList.add('pulse-highlight');
        setTimeout(() => el.classList.remove('pulse-highlight'), 3600);
      }
    };

    // Query Processor & NLP Knowledge Engine
    const processUserQuery = (query) => {
      const q = query.toLowerCase().trim();
      if (!q) return;

      appendUserMessage(query);
      showTypingIndicator();

      setTimeout(() => {
        const responseData = generateBotResponse(q);
        appendBotMessage(responseData);
      }, 350);
    };

    const generateBotResponse = (q) => {
      // Intent 1: Projects / FoodIQ / PSMS / MERN Stack
      if (q.includes('project') || q.includes('foodiq') || q.includes('food') || q.includes('psms') || q.includes('studio') || q.includes('app') || q.includes('system') || q.includes('build')) {
        if (q.includes('foodiq') || q.includes('nutrition') || q.includes('diet') || q.includes('health') || q.includes('usda') || q.includes('scanner')) {
          return {
            text: "🥗 **FoodIQ — AI-Powered Food & Nutrition Recognition System**\n• Full-stack platform built with **React** & **Node.js/Express**.\n• Deep learning image recognition trained on **148,000+ food items** (Indian cuisine, fruits, vegetables, global dishes).\n• Synchronized with the **USDA database** to compute live calories, protein, carbs, fats, and a 0–100 health score.\n\n👉 Click [Test FoodIQ Live Simulator](projects.html#scannerStage) or [Explore Projects Room](projects.html#.section-editorial-header) to navigate directly there!",
            actionTitle: "FoodIQ Actions",
            actionDesc: "Would you like to test the live simulator?",
            actions: [
              { label: "🥗 Test FoodIQ Scanner Simulator", targetUrl: "projects.html", targetId: "#scannerStage" },
              { label: "🚀 View All Projects", targetUrl: "projects.html", targetId: ".section-editorial-header" }
            ]
          };
        }

        if (q.includes('psms') || q.includes('studio') || q.includes('photo studio')) {
          return {
            text: "📷 **Photo Studio Management System (PSMS)**\n• Complete platform integrating appointment scheduling, client database management, automated invoicing, and digital asset organization.\n• Eliminates double-bookings and streamlines photography operations.\n\n👉 Click [View PSMS Details in Projects Room](projects.html#.foodiq-showcase-card:nth-of-type(2)) to jump straight to this card!",
            actionTitle: "PSMS Actions",
            actions: [
              { label: "📷 View PSMS Details in Projects Room", targetUrl: "projects.html", targetId: ".foodiq-showcase-card:nth-of-type(2)" }
            ]
          };
        }

        return {
          text: "🚀 **Shravan's Featured Software Projects:**\n1. [FoodIQ AI Vision Scanner](projects.html#scannerStage): React, Node.js, 148k+ dataset, USDA API.\n2. [PSMS Management System](projects.html#.foodiq-showcase-card:nth-of-type(2)): Scheduling, client invoicing, digital asset vault.\n3. [MERN Stack Workflows](projects.html#.section-editorial-header).\n\n👉 Click any highlighted link to navigate straight to that section!",
          actionTitle: "Explore Projects",
          actions: [
            { label: "🚀 Open Projects & AI Lab", targetUrl: "projects.html", targetId: ".section-editorial-header" },
            { label: "🥗 Try FoodIQ Simulator", targetUrl: "projects.html", targetId: "#scannerStage" }
          ]
        };
      }

      // Intent 2: Awards / Achievements / Honours / Competitions
      if (q.includes('award') || q.includes('achieve') || q.includes('honour') || q.includes('honor') || q.includes('ettin') || q.includes('aqua') || q.includes('agon') || q.includes('win') || q.includes('prize') || q.includes('troph')) {
        return {
          text: "🏆 **Shravan's Verified Awards & Honors:**\n• 🥇 **1st Place (University Level)**: [Nitte Aqua Lens 2024](journey.html#achievementMuseumGrid) (SDG Cell, Nitte DU — Felicitated in Republic Day '25)\n• 🥇 **1st Place (National Fest)**: [ETTIN 2025 Eco-Vision](journey.html#achievementMuseumGrid) (JKSHIM Nitte)\n• 🥈 **2nd Place (National Fest)**: [AGON 2024 Apollo](journey.html#achievementMuseumGrid) (ALVA’S AIET, Mijar)\n• 🎖️ **Media Headship**: Directing [180+ Student Volunteers](journey.html#impactMetrics) across 5+ departmental programs.\n\n👉 Click any award link above to visit the museum grid!",
          actionTitle: "Awards Actions",
          actions: [
            { label: "🏆 View Achievements Museum on Journey Page", targetUrl: "journey.html", targetId: "#achievementMuseumGrid" },
            { label: "🥇 View Aqua Lens '24 Spotlight Exhibit", targetUrl: "journey.html", targetId: ".story-spotlight-card" }
          ]
        };
      }

      // Intent 3: Photography / Creative Work / Camera / Reels
      if (q.includes('photo') || q.includes('camera') || q.includes('creative') || q.includes('gallery') || q.includes('work') || q.includes('reel') || q.includes('art') || q.includes('shoot')) {
        return {
          text: "📸 **Creative Photography & Visual Storytelling:**\nShravan combines photographic composition, golden hour light, and macro water droplet optics with modern UI design principles. He has won multiple 1st-place national and university titles!\n\n👉 Click [Open Photography Gallery](journey.html#editorialGallery) to view the curated high-res gallery with interactive lightbox!",
          actionTitle: "Gallery Actions",
          actions: [
            { label: "📸 Open Photography Gallery with Lightbox", targetUrl: "journey.html", targetId: "#editorialGallery" },
            { label: "🥇 See Award-Winning Captures", targetUrl: "journey.html", targetId: "#achievementMuseumGrid" }
          ]
        };
      }

      // Intent 4: Leadership / Media Head / Volunteers / Events
      if (q.includes('leader') || q.includes('media') || q.includes('volunteer') || q.includes('event') || q.includes('team') || q.includes('head') || q.includes('manage') || q.includes('coordinat') || q.includes('pr')) {
        return {
          text: "📢 **Leadership & Event Operations:**\n• **Media Head (MCA Dept, NMAMIT)**: Coordinated logistics and media coverage across **5+ department programs** with **180+ student volunteers**; published 15+ promotional posts.\n• **BCA Media Team**: Grew post engagement by **87%** and reduced documentation time by **50%** using AI tools.\n\n👉 Click [View Volunteer Scaling & Impact Chart](journey.html#impactMetrics) to explore the live telemetry data!",
          actionTitle: "Leadership Actions",
          actions: [
            { label: "📢 View Volunteer Scaling & Impact Chart", targetUrl: "journey.html", targetId: "#impactMetrics" },
            { label: "🌱 Read Leadership Evolution Pathway", targetUrl: "journey.html", targetId: ".evolution-track" }
          ]
        };
      }

      // Intent 5: Internship / Experience / Zephyr
      if (q.includes('intern') || q.includes('zephyr') || q.includes('experience') || q.includes('job') || q.includes('trainee') || q.includes('work history')) {
        return {
          text: "💼 **Industry Internship Experience:**\n• **Zephyr Technologies & Solutions Pvt. Ltd.** (Jun 2024 – Jul 2024)\n• Role: **Student Trainee (MERN Stack Projects)**\n• Prepared and maintained technical documentation, API workflows, and structured development tasks in a professional software environment.\n\n👉 Click [View Internship on Timeline](journey.html#.timeline-container) or [Download Verified CV](download)!",
          actionTitle: "Experience Actions",
          actions: [
            { label: "💼 View Internship on Timeline", targetUrl: "journey.html", targetId: ".timeline-container" },
            { label: "📄 Download Full Verified CV (PDF)", type: "download" }
          ]
        };
      }

      // Intent 6: Education / MCA / BCA / Degree / University
      if (q.includes('edu') || q.includes('mca') || q.includes('bca') || q.includes('degree') || q.includes('college') || q.includes('nitte') || q.includes('nmamit') || q.includes('nsam') || q.includes('study')) {
        return {
          text: "🎓 **Academic Background:**\n• **Master of Computer Applications (MCA, 2025–2027)** — N.M.A.M. Institute of Technology, Nitte, Karnataka (Autonomous).\n• **Bachelor of Computer Applications (BCA, 2022–2025)** — Dr. NSAM First Grade College, Nitte (Graduated with Distinction).\n\n👉 Click [View Academic Timeline](journey.html#.timeline-container) or [Read Academic Manifesto](about.html#.about-manifesto-card)!",
          actionTitle: "Education Actions",
          actions: [
            { label: "🎓 View Academic Timeline on Journey Page", targetUrl: "journey.html", targetId: ".timeline-container" },
            { label: "🌿 Read Academic Manifesto", targetUrl: "about.html", targetId: ".about-manifesto-card" }
          ]
        };
      }

      // Intent 7: Skills / Tech Stack / Tools / Languages / Certifications
      if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('tool') || q.includes('python') || q.includes('react') || q.includes('node') || q.includes('sql') || q.includes('git') || q.includes('certif') || q.includes('azure') || q.includes('cyber') || q.includes('android') || q.includes('language') || q.includes('japanese')) {
        return {
          text: "🛠️ **Technical Skillset & Certifications:**\n• **Languages & Web**: Python, MERN Stack (React, Node.js, Express), HTML5/CSS3, SQL, Git, Vercel.\n• **AI/ML**: Deep Learning Image Recognition, Prompt Engineering, USDA API.\n• **Certifications**: Microsoft Azure AI Challenge, Cyber Security (ICT Academy), Android App Dev (NSAM FGC).\n• **Languages**: English (Fluent), Kannada (Native), Hindi (Professional), Japanese (Beginner).\n\n👉 Click [View Full Credentials on About Page](about.html#.credentials-cards-grid) or [Test FoodIQ Scanner](projects.html#scannerStage)!",
          actionTitle: "Skills Actions",
          actions: [
            { label: "🛠️ View Credentials & Languages on About Page", targetUrl: "about.html", targetId: ".credentials-cards-grid" },
            { label: "🥗 See Skills Applied in FoodIQ", targetUrl: "projects.html", targetId: "#scannerStage" }
          ]
        };
      }

      // Intent 8: Resume / CV / Download / PDF
      if (q.includes('resume') || q.includes('cv') || q.includes('download') || q.includes('pdf')) {
        return {
          text: "📄 **Download Shravan's Official Resume:**\nYou can download the latest official PDF resume directly with all verified full-stack, AI, leadership, and academic details.\n\n👉 Click [Download Official Resume (PDF)](download) or [Launch 1-Minute Recruiter Brief](recruiter)!",
          actionTitle: "Resume Actions",
          actions: [
            { label: "📄 Download Official Resume (PDF)", type: "download" },
            { label: "⚡ Open 1-Minute Recruiter Brief", type: "recruiter" }
          ]
        };
      }

      // Intent 9: Contact / Email / Phone / Location / Hire / LinkedIn / GitHub
      if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('whatsapp') || q.includes('hire') || q.includes('reach') || q.includes('linkedin') || q.includes('github') || q.includes('message') || q.includes('connect')) {
        return {
          text: "📬 **Get in Touch with Shravan:**\n• 📧 **Email**: [shravanrbangera@gmail.com](mailto:shravanrbangera@gmail.com)\n• 📱 **Phone**: +91 9964429300\n• 📍 **Location**: Udupi, Karnataka, India\n• 🔗 **LinkedIn**: [linkedin.com/in/shravan-r-bangera-7bb053246](https://www.linkedin.com/in/shravan-r-bangera-7bb053246/)\n• 💻 **GitHub**: [github.com/shravanrbangera](https://github.com/shravanrbangera)\n\n👉 Click [Go to Direct Message Form](about.html#contactForm) to send an instant message!",
          actionTitle: "Contact Actions",
          actions: [
            { label: "📧 Go to Direct Message Form", targetUrl: "about.html", targetId: "#contactForm" },
            { label: "📄 Download Resume (PDF)", type: "download" }
          ]
        };
      }

      // Intent 10: Recruiter / Brief / Summary
      if (q.includes('recruiter') || q.includes('brief') || q.includes('summary') || q.includes('executive') || q.includes('overview') || q.includes('1 minute')) {
        return {
          text: "⚡ **1-Minute Executive Briefing:**\nShravan is an MCA student at NMAMIT Nitte specializing in full-stack web development (React, Node.js), AI application development, and 180+ volunteer media leadership.\n\n👉 Click [Open Recruiter Briefing Modal](recruiter) or [Download Verified CV](download)!",
          actionTitle: "Executive View",
          actions: [
            { label: "⚡ Launch Recruiter Briefing Modal", type: "recruiter" },
            { label: "📄 Download Verified CV (PDF)", type: "download" }
          ]
        };
      }

      // Intent 11: Story / About / Who is Shravan
      if (q.includes('story') || q.includes('about') || q.includes('who') || q.includes('intro') || q.includes('bio') || q.includes('manifesto')) {
        return {
          text: "🌿 **About Shravan R Bangera:**\nAn MCA postgraduate student at NMAMIT Nitte who bridges software engineering with visual storytelling, deep learning vision systems, and large-scale media operations.\n\n👉 Click [Read About Manifesto & 4 Pillars](about.html#.about-manifesto-card) or [Read Formative Story on Journey Page](journey.html#.story-spotlight-card)!",
          actionTitle: "Explore Profile",
          actions: [
            { label: "🌿 Read About Manifesto & 4 Pillars", targetUrl: "about.html", targetId: ".about-manifesto-card" },
            { label: "🌱 Read Formative Story on Journey Page", targetUrl: "journey.html", targetId: ".story-spotlight-card" }
          ]
        };
      }

      // Smart Fallback Search
      return {
        text: `🔍 I searched for **"${escapeHtml(q)}"** across Shravan's portfolio! Here are the best sections to explore based on your search:\n\n• [Projects & AI Lab](projects.html#.section-editorial-header)\n• [Journey & Awards Museum](journey.html#achievementMuseumGrid)\n• [About & Contact](about.html#.about-manifesto-card)\n• [Download Official Resume](download)`,
        actionTitle: "Matched Destinations",
        actions: [
          { label: "🚀 Projects & AI Lab", targetUrl: "projects.html", targetId: ".section-editorial-header" },
          { label: "🏆 Journey & Awards", targetUrl: "journey.html", targetId: "#achievementMuseumGrid" },
          { label: "🌿 About & Contact", targetUrl: "about.html", targetId: ".about-manifesto-card" },
          { label: "📄 Download Resume (PDF)", type: "download" }
        ]
      };
    };

    // Quick Chips Click Event
    if (chatQuickChips) {
      const chipBtns = chatQuickChips.querySelectorAll('.chat-chip-btn');
      chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.getAttribute('data-query') || chip.textContent;
          processUserQuery(query);
        });
      });
    }

    // Chat Input Form Submit Event
    if (chatInputForm && chatInputText) {
      chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInputText.value.trim();
        if (!query) return;
        chatInputText.value = '';
        processUserQuery(query);
      });
    }

    // Helper Markdown & HTML formatters
    function escapeHtml(str) {
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }

    function formatMarkdown(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
          if (p2 === 'download' || p2.includes('.pdf') || p2.includes('resume')) {
            return `<button class="inline-guide-link" data-action-type="download" data-target-url="assets/SHRAVAN_RESUME.pdf">${p1} <span class="guide-arrow">↗</span></button>`;
          }
          if (p2 === 'recruiter') {
            return `<button class="inline-guide-link" data-action-type="recruiter">${p1} <span class="guide-arrow">↗</span></button>`;
          }
          if (p2.includes('.html') || p2.startsWith('#') || p2.startsWith('.')) {
            const parts = p2.split('#');
            const targetUrl = parts[0] || '';
            const targetId = parts[1] ? `#${parts[1]}` : (p2.startsWith('.') ? p2 : '');
            return `<button class="inline-guide-link" data-action-type="nav" data-target-url="${targetUrl}" data-target-id="${targetId}">${p1} <span class="guide-arrow">↗</span></button>`;
          }
          return `<a href="${p2}" target="_blank" rel="noopener" class="inline-guide-link">${p1} <span class="guide-arrow">↗</span></a>`;
        });
    }
  }

})();
