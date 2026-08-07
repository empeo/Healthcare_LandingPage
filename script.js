document.addEventListener('DOMContentLoaded', () => {

  /* ---------- YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  const loaderBar = loader ? loader.querySelector('.loader-bar span') : null;

  requestAnimationFrame(() => {
    if (loaderBar) loaderBar.style.width = '100%';
  });

  const finishLoading = () => {
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add('hide');
      document.body.style.overflow = '';
      animateStats();
      triggerScrollReveals();
    }, 700);
  };

  document.body.style.overflow = 'hidden';
  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading);
    setTimeout(finishLoading, 2000);
  }

  /* ---------- SCROLL REVEAL OBSERVER (Fade in / Slide up) ---------- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        const rect = entry.target.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          entry.target.classList.remove('active');
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  function triggerScrollReveals() {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 20) {
        el.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', triggerScrollReveals, { passive: true });

  /* ---------- MULTI-PAGE ROUTE TRANSITION SYSTEM ---------- */
  const journeyTransition = document.getElementById('journeyTransition');
  const jtText = document.getElementById('jtText');
  const viewSections = document.querySelectorAll('.view-section');
  const navRouteLinks = document.querySelectorAll('.nav-route');
  const bookingServiceTitle = document.getElementById('bookingServiceTitle');
  const patientNameInput = document.getElementById('patientName');

  let currentSelectedService = 'طلب زيارة تمريضية عامة';

  const routeTitles = {
    home: 'الرئيسية | مسار الرعاية',
    services: 'موسوعة الخدمات الـ 14 المتاحة',
    about: 'عن مؤسسة التميز للرعاية',
    contact: 'تواصل معنا وحجز زيارة منزلية'
  };

  function switchRoute(targetRoute, serviceName) {
    if (!targetRoute) return;

    if (serviceName) {
      currentSelectedService = serviceName;
      if (bookingServiceTitle) bookingServiceTitle.textContent = currentSelectedService;
    }

    if (jtText && routeTitles[targetRoute]) {
      jtText.textContent = `جاري الانتقال إلى: ${routeTitles[targetRoute]}...`;
    }
    journeyTransition.classList.add('active');

    setTimeout(() => {
      // Hide all views
      viewSections.forEach(sec => sec.classList.remove('active'));

      // Show target view
      const targetView = document.getElementById(`view-${targetRoute}`);
      if (targetView) targetView.classList.add('active');

      // Update Nav active states
      navRouteLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.route === targetRoute);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        journeyTransition.classList.remove('active');
        triggerScrollReveals();
        if (targetRoute === 'contact' && serviceName && patientNameInput) {
          const formBox = document.getElementById('contactBookingBox');
          if (formBox) formBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          patientNameInput.focus();
        }
      }, 300);
    }, 450);
  }

  // Top and Mobile navigation route links
  navRouteLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = link.dataset.route;
      switchRoute(targetRoute);
    });
  });

  // Open contact view & pre-fill service for any booking button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-booking-btn');
    if (btn) {
      e.preventDefault();
      const serviceName = btn.dataset.service || btn.getAttribute('data-service');
      switchRoute('contact', serviceName);
    }
  });

  /* ---------- WHATSAPP BOOKING FORM SUBMISSION ---------- */
  const whatsappBookingFormPage = document.getElementById('whatsappBookingFormPage');

  if (whatsappBookingFormPage) {
    whatsappBookingFormPage.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('patientName').value.trim();
      const ageGroup = document.getElementById('patientAgeGroup').value;
      const address = document.getElementById('patientAddress').value.trim();
      const preferredTime = document.getElementById('preferredTime').value;
      const condition = document.getElementById('patientConditionDetails').value.trim();

      const messageText = 
`أهلاً فريق التميز للرعاية الصحية المنزلية 🏥
أود حجز وتأكيد الخدمة الطبية التالية:

📋 الخدمة المطلوبة: ${currentSelectedService}
👤 اسم المريض: ${name}
👶/👵 الفئة العمرية: ${ageGroup}
📍 العنوان / المنطقة: ${address}
⏰ الموعد المطلوب: ${preferredTime}
📝 الشرح وتفاصيل الحالة: ${condition || 'لا توجد ملاحظات إضافية'}

يرجى التواصل معي وتأكيد تحرك أخصائي التمريض.`;

      const encodedMsg = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/201113482494?text=${encodedMsg}`;

      window.open(whatsappUrl, '_blank');
    });
  }

  /* ---------- SERVICE SEARCH & CATEGORY FILTER ---------- */
  const serviceSearch = document.getElementById('serviceSearch');
  const catBtns = document.querySelectorAll('.cat-btn');
  const serviceCards = document.querySelectorAll('.s-card-full');

  let currentCategory = 'all';
  let currentSearchQuery = '';

  function filterServices() {
    serviceCards.forEach(card => {
      const cardCat = card.dataset.cat;
      const cardText = card.textContent.toLowerCase();

      const matchesCat = (currentCategory === 'all' || cardCat === currentCategory);
      const matchesSearch = (!currentSearchQuery || cardText.includes(currentSearchQuery));

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        card.classList.add('active');
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (serviceSearch) {
    serviceSearch.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      filterServices();
    });
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      filterServices();
    });
  });

  /* ---------- STATS COUNTER ANIMATION ---------- */
  let animatedStats = false;
  function animateStats() {
    if (animatedStats) return;
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards.length) return;

    statCards.forEach(card => {
      const numEl = card.querySelector('.stat-number');
      if (!numEl) return;

      const rawVal = numEl.dataset.target;
      const targetVal = parseInt(rawVal, 10);
      if (isNaN(targetVal)) return;

      let start = 0;
      const duration = 1800;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = targetVal / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= targetVal) {
          numEl.textContent = (rawVal.includes('+') ? '+' : '') + 
                              (rawVal.includes('%') ? '%' : '') + targetVal;
          clearInterval(timer);
        } else {
          numEl.textContent = Math.floor(start);
        }
      }, stepTime);
    });
    animatedStats = true;
  }

  /* ---------- 3D TILT EFFECT ON CARDS ---------- */
  const cards = document.querySelectorAll('.s-card-full, .preview-card, .stat-card, .c-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});
