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
      const link = e.target.closest('a[data-nav-link], a.portal-room-card, .room-nav-banner a');
      if (!link) return;

      const href = link.getAttribute('href');
      // Only intercept internal html links (not external or pdfs)
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.endsWith('.pdf') || href.includes('resume')) {
        return;
      }

      e.preventDefault();
      if (isTransitioning) return;

      // Extract target url
      const currentUrl = window.location.pathname;
      const targetUrl = new URL(href, window.location.href).pathname;

      if (currentUrl === targetUrl && !href.includes('#')) return;

      navigateRoom(href);
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

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Update History API
      if (pushToHistory) {
        window.history.pushState({ page: newPageKey }, newDoc.title, url);
      }

      // Re-initialize all interactive components on the new page
      initPageModules();
      initMobileNav();
      attachCursorHoverListeners();

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
        category: 'AI & COMPUTER VISION CASE STUDY',
        title: 'FoodIQ — AI Nutrition Intelligence',
        tagline: '“Transforming plate photography into instant nutritional analytics.”',
        overview: 'FoodIQ is an artificial intelligence application built to solve the tedious problem of manual dietary tracking. By leveraging deep convolutional neural networks trained on over 148,000 food images, it recognizes complex food plates and surfaces key macronutrients instantly.',
        workedOn: 'Designed the end-to-end user workflow, created the visual UI/UX layout system, integrated the computer vision model inference pipeline, and engineered responsive metric dashboards.',
        features: [
          'Instant multi-item food recognition using deep learning vision models.',
          'Real-time nutritional calculation including total calories, proteins, carbohydrates, and fats.',
          'Dynamic Health Score index providing dietary assessment based on nutritional density.',
          'Clean, accessible responsive UI designed for quick mobile and desktop scanning.'
        ],
        learned: 'Gained practical experience bridging machine learning model outputs with human-centric interfaces, optimizing asset loads for real-time camera feedback, and structuring clear visual data hierarchies.'
      },
      studio: {
        category: 'WORKFLOW & OPERATIONS CASE STUDY',
        title: 'Photo Studio Management System',
        tagline: '“A centralized platform for appointments, client records, billing, and asset organization.”',
        overview: 'Designed to solve operational bottlenecks for photography businesses, this management platform replaces fragmented spreadsheets with an integrated dashboard for booking, client registries, automated invoicing, and digital asset tracking.',
        workedOn: 'Architected the database schema, engineered conflict-free appointment scheduling logic, built client profile vaults, and crafted a modern desktop dashboard with instant status reporting.',
        features: [
          'Real-time schedule conflict engine to prevent double bookings across studio slots.',
          'Comprehensive client registry linking shoot histories, preferences, and contact records.',
          'Automated billing workflow with invoice generation and payment tracking.',
          'Secure asset organization portal linking delivered media packages to client profiles.'
        ],
        learned: 'Deepened practical knowledge of full-stack software development workflows, relational data models, user role management, and operational software reliability.'
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
  // 17. INTERACTIVE CLOUD MASCOT COMPANION
  // --------------------------------------------------------------------------
  function initCloudMascot() {
    const mascotBtn = document.getElementById('mascotAvatarBtn');
    const speechBubble = document.getElementById('mascotBubble');
    if (!mascotBtn || !speechBubble) return;

    const quotes = [
      "Hi! I'm Shravan's creative companion 🍀",
      "MCA Student & Creative Technologist! 🌱",
      "Led 180+ student volunteers as Media Head! 📢",
      "Won 1st Place at ETTIN '25 & Aqua Lens '24! 🥇",
      "Check out the FoodIQ AI neural macro chart in Projects! 🥗",
      "Need an executive brief? Click Recruiter View ⚡",
      "Let's build something beautiful and intelligent together! 🌿"
    ];

    let quoteIndex = 0;
    let hideTimeout = null;

    const showQuote = (text) => {
      speechBubble.innerHTML = `<span class="bubble-text">${text}</span>`;
      speechBubble.style.display = 'block';
      speechBubble.style.opacity = '1';
      speechBubble.style.transform = 'translateY(0)';

      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        speechBubble.style.opacity = '0';
        speechBubble.style.transform = 'translateY(6px)';
        setTimeout(() => {
          if (speechBubble.style.opacity === '0') {
            speechBubble.style.display = 'none';
          }
        }, 350);
      }, 5000);
    };

    mascotBtn.addEventListener('click', () => {
      mascotBtn.classList.remove('bounce');
      void mascotBtn.offsetWidth; // Reflow
      mascotBtn.classList.add('bounce');

      quoteIndex = (quoteIndex + 1) % quotes.length;
      showQuote(quotes[quoteIndex]);
    });

    // Initial greeting after 2s
    setTimeout(() => {
      showQuote("Welcome to Shravan's digital studio! 🍀✨");
    }, 2000);
  }

})();
