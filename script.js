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
    }, 800);
  };

  document.body.style.overflow = 'hidden';
  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading);
    setTimeout(finishLoading, 2000);
  }

  /* ---------- MULTI-PAGE ROUTE TRANSITION SYSTEM ---------- */
  const journeyTransition = document.getElementById('journeyTransition');
  const jtText = document.getElementById('jtText');
  const viewSections = document.querySelectorAll('.view-section');
  const navRouteLinks = document.querySelectorAll('.nav-route');

  const routeTitles = {
    home: 'الرئيسية | مسار الرعاية',
    services: 'موسوعة الخدمات الـ 14 المتاحة',
    about: 'مسار التمريض والرعاية الطبية',
    contact: 'تواصل مباشر مع الطقم الطبي'
  };

  function switchRoute(targetRoute) {
    if (!targetRoute) return;

    // Show transition overlay
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

      // Hide transition overlay
      setTimeout(() => {
        journeyTransition.classList.remove('active');
      }, 300);
    }, 450);
  }

  navRouteLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = link.dataset.route;
      switchRoute(targetRoute);
    });
  });

  /* ---------- INTERACTIVE BOOKING MODAL & WHATSAPP FORM ---------- */
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalServiceTitle = document.getElementById('modalServiceTitle');
  const modalServiceBadge = document.getElementById('modalServiceBadge');
  const whatsappBookingForm = document.getElementById('whatsappBookingForm');

  let currentSelectedService = 'طلب خدمة تمريضية عامة';

  function openBookingModal(serviceName) {
    currentSelectedService = serviceName || 'طلب خدمة تمريضية عامة';
    if (modalServiceTitle) modalServiceTitle.textContent = currentSelectedService;
    if (modalServiceBadge) modalServiceBadge.textContent = 'خدمة محددة جاهزة للحجز';
    
    bookingModal.classList.add('active');
  }

  function closeBookingModal() {
    bookingModal.classList.remove('active');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-booking-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const serviceName = btn.dataset.service || btn.getAttribute('data-service');
      openBookingModal(serviceName);
    }
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBookingModal);
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });
  }

  // Handle Form Submission -> Construct Structured WhatsApp Message
  if (whatsappBookingForm) {
    whatsappBookingForm.addEventListener('submit', (e) => {
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

      closeBookingModal();
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

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});
