/* ============================================================
   ATLAS CALCULOS TRABALHISTAS - Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  var DEFAULT_WHATSAPP_URL =
    'https://wa.me/5511926876472?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20an%C3%A1lise%20t%C3%A9cnica.';
  var WHATSAPP_FLOAT_URL =
    (document.body &&
      document.body.dataset &&
      document.body.dataset.whatsappUrl) ||
    DEFAULT_WHATSAPP_URL;
  var WHATSAPP_FLOAT_LABEL = 'Abrir conversa no WhatsApp';
  var WHATSAPP_FLOAT_MARKUP =
    '<span class="whatsapp-float__pulse" aria-hidden="true"></span>' +
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  function runWhenIdle(callback, timeout) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        function () {
          callback();
        },
        { timeout: timeout || 1200 }
      );
      return;
    }

    window.setTimeout(callback, 1);
  }

  function whenVisible(element, callback, rootMargin) {
    if (!element || typeof callback !== 'function') return;

    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }

    var hasRun = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (hasRun || !entry.isIntersecting) return;

          hasRun = true;
          observer.disconnect();
          callback();
        });
      },
      { rootMargin: rootMargin || '280px 0px' }
    );

    observer.observe(element);
  }

  function shouldRenderWhatsappFloat() {
    return Boolean(document.querySelector('.hero') || document.body.classList.contains('service-page'));
  }

  function ensureWhatsappFloat() {
    var floatButtons = document.querySelectorAll('.whatsapp-float');
    var floatButton = floatButtons[0] || null;

    if (!floatButton) {
      floatButton = document.createElement('a');
      floatButton.className = 'whatsapp-float';
      document.body.appendChild(floatButton);
    }

    floatButtons.forEach(function (button, index) {
      if (index > 0) {
        button.remove();
      }
    });

    floatButton.setAttribute('href', WHATSAPP_FLOAT_URL);
    floatButton.setAttribute('target', '_blank');
    floatButton.setAttribute('rel', 'noopener noreferrer');
    floatButton.setAttribute('aria-label', WHATSAPP_FLOAT_LABEL);
    floatButton.setAttribute('title', 'Falar no WhatsApp');
    floatButton.innerHTML = WHATSAPP_FLOAT_MARKUP;
  }

  if (shouldRenderWhatsappFloat()) {
    ensureWhatsappFloat();
  }

  /* ---------- HEADER SCROLL ---------- */
  var header = document.getElementById('header');

  function handleHeaderScroll() {
    if (!header) return;

    if (window.scrollY > 40) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ---------- MOBILE MENU ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');

  function closeMenu() {
    if (!menuToggle || !nav) return;

    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- SMOOTH SCROLL ---------- */
  function getAnchorScrollNode(target) {
    if (!target) return null;

    if (target.tagName && target.tagName.toLowerCase() === 'section') {
      for (var i = 0; i < target.children.length; i++) {
        var child = target.children[i];

        if (child.classList && child.classList.contains('container')) {
          return child;
        }
      }
    }

    return target;
  }

  function scrollToAnchorTarget(target, behavior) {
    if (!target) return;

    var headerHeight = header ? header.offsetHeight : 80;
    var scrollNode = getAnchorScrollNode(target);
    var targetTop = scrollNode.getBoundingClientRect().top + window.scrollY;
    var scrollTarget = targetTop - headerHeight - 16;

    window.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: behavior || 'smooth'
    });
  }

  function syncHashScroll(behavior) {
    if (!window.location.hash || window.location.hash === '#') return;

    var target = document.querySelector(window.location.hash);
    if (!target) return;

    scrollToAnchorTarget(target, behavior || 'auto');
  }

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      var target = document.querySelector(targetId);

      if (!target) return;

      e.preventDefault();
      scrollToAnchorTarget(target, 'smooth');

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', targetId);
      }
    });
  });

  window.addEventListener('hashchange', function () {
    syncHashScroll('auto');
  });

  window.addEventListener('load', function () {
    syncHashScroll('auto');
  });

  /* ---------- SCROLL ANIMATIONS ---------- */
  var animateElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animateElements.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    animateElements.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }

  /* ---------- TESTIMONIAL CAROUSEL ---------- */
  function initCarousel(carousel) {
    if (carousel.dataset.carouselReady === 'true') return;

    var track = carousel.querySelector('[data-carousel-track]');
    var viewport = carousel.querySelector('.testimonial-carousel__viewport');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
    var prevButton = carousel.querySelector('[data-carousel-prev]');
    var nextButton = carousel.querySelector('[data-carousel-next]');
    var dotsContainer = carousel.querySelector('[data-carousel-dots]');
    var currentCount = carousel.querySelector('[data-carousel-current]');
    var totalCount = carousel.querySelector('[data-carousel-total]');
    var autoplayDelay = parseInt(carousel.getAttribute('data-autoplay'), 10) || 6800;
    var activeIndex = 0;
    var autoplayTimer = null;
    var touchStartX = 0;
    var touchStartY = 0;
    var resizeFrame = null;
    var dotButtons = [];
    var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;

    if (!track || !viewport || !slides.length) return;

    carousel.dataset.carouselReady = 'true';

    function formatSlideNumber(number) {
      return String(number).padStart(2, '0');
    }

    function getSlideLabel(slide, index) {
      var name = slide.querySelector('.testimonial-card__name');
      return name ? name.textContent.trim() : 'Depoimento ' + formatSlideNumber(index + 1);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      if (prefersReducedMotion || slides.length < 2) return;

      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        goToSlide(activeIndex + 1, false);
      }, autoplayDelay);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    function syncHeight() {
      var tallest = 0;

      slides.forEach(function (slide) {
        tallest = Math.max(tallest, slide.offsetHeight);
      });

      if (tallest) {
        viewport.style.minHeight = tallest + 'px';
      }
    }

    function queueHeightSync() {
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(syncHeight);
    }

    function updateCarousel() {
      track.style.transform = 'translate3d(' + activeIndex * -100 + '%, 0, 0)';

      slides.forEach(function (slide, index) {
        var isActive = index === activeIndex;

        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        slide.classList.toggle('is-active', isActive);
      });

      dotButtons.forEach(function (button, index) {
        var isActive = index === activeIndex;

        if (isActive) {
          button.setAttribute('aria-current', 'true');
        } else {
          button.removeAttribute('aria-current');
        }
      });

      if (currentCount) {
        currentCount.textContent = formatSlideNumber(activeIndex + 1);
      }
    }

    function goToSlide(index, userInitiated) {
      activeIndex = (index + slides.length) % slides.length;
      updateCarousel();

      if (userInitiated) {
        restartAutoplay();
      }
    }

    function buildDots() {
      if (!dotsContainer) return;

      dotsContainer.innerHTML = '';
      dotButtons = [];

      slides.forEach(function (slide, index) {
        var dot = document.createElement('button');

        dot.type = 'button';
        dot.className = 'testimonial-carousel__dot';
        dot.setAttribute('aria-label', 'Ver depoimento de ' + getSlideLabel(slide, index));
        if (viewport.id) {
          dot.setAttribute('aria-controls', viewport.id);
        }
        dot.addEventListener('click', function () {
          goToSlide(index, true);
        });

        dotsContainer.appendChild(dot);
        dotButtons.push(dot);
      });
    }

    if (totalCount) {
      totalCount.textContent = formatSlideNumber(slides.length);
    }

    carousel.classList.add('is-ready');

    if (prevButton && viewport.id) {
      prevButton.setAttribute('aria-controls', viewport.id);
    }

    if (nextButton && viewport.id) {
      nextButton.setAttribute('aria-controls', viewport.id);
    }

    buildDots();
    updateCarousel();
    queueHeightSync();
    startAutoplay();

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        goToSlide(activeIndex - 1, true);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        goToSlide(activeIndex + 1, true);
      });
    }

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', function (event) {
      if (carousel.contains(event.relatedTarget)) return;
      startAutoplay();
    });

    viewport.addEventListener(
      'touchstart',
      function (event) {
        if (!event.touches.length) return;

        stopAutoplay();
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchend',
      function (event) {
        if (!event.changedTouches.length) {
          startAutoplay();
          return;
        }

        var deltaX = event.changedTouches[0].clientX - touchStartX;
        var deltaY = event.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          goToSlide(activeIndex + (deltaX < 0 ? 1 : -1), true);
          return;
        }

        startAutoplay();
      },
      { passive: true }
    );

    window.addEventListener('resize', queueHeightSync, { passive: true });
    window.addEventListener('load', queueHeightSync);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(queueHeightSync);
    }

    if (mediaQuery) {
      var handleMotionChange = function (event) {
        prefersReducedMotion = event.matches;

        if (prefersReducedMotion) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMotionChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleMotionChange);
      }
    }
  }

  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      whenVisible(
        carousel,
        function () {
          initCarousel(carousel);
        },
        '320px 0px'
      );
    });
  }

  /* ---------- CONTACT FORM -> WHATSAPP ---------- */
  var contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = contactForm.querySelector('#nome').value.trim();
      var tipo = contactForm.querySelector('#tipo').value;
      var descricao = contactForm.querySelector('#descricao').value.trim();

      if (!nome || !tipo || !descricao) return;

      var mensagem =
        'Olá, gostaria de solicitar uma análise técnica.\n\n' +
        '*Nome/Escritório:* ' + nome + '\n' +
        '*Tipo de demanda:* ' + tipo + '\n' +
        '*Descrição do caso:* ' + descricao;

      var whatsappUrl = 'https://wa.me/5511926876472?text=' + encodeURIComponent(mensagem);
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---------- ACTIVE NAV HIGHLIGHT ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  function highlightNav() {
    var scrollPos = window.scrollY + 140;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('nav__link--active');
          } else {
            link.classList.remove('nav__link--active');
          }
        });
      }
    });
  }

  function initActiveNav() {
    var highlightFrame = null;

    function queueHighlightNav() {
      if (highlightFrame) return;

      highlightFrame = window.requestAnimationFrame(function () {
        highlightFrame = null;
        highlightNav();
      });
    }

    if (!navLinks.length) return;

    window.addEventListener('scroll', queueHighlightNav, { passive: true });
    queueHighlightNav();
  }

  /* ---------- FAQ ACCORDION ANIMATION ---------- */
  function initFaqAccordions() {
    document.querySelectorAll('.faq__item').forEach(function (details) {
      var summary = details.querySelector('.faq__question');
      var content = details.querySelector('.faq__answer');
      var animation = null;
      var isClosing = false;
      var isExpanding = false;

      if (!summary || !content || details.dataset.faqAnimated === 'true') return;

      details.dataset.faqAnimated = 'true';

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        details.style.overflow = 'hidden';

        if (isClosing || !details.open) {
          expand();
        } else if (isExpanding || details.open) {
          shrink();
        }
      });

      function shrink() {
        isClosing = true;

        var startHeight = details.offsetHeight + 'px';
        var endHeight = summary.offsetHeight + 'px';

        if (animation) animation.cancel();

        animation = details.animate(
          { height: [startHeight, endHeight] },
          { duration: 320, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
        );

        animation.onfinish = function () {
          onFinish(false);
        };

        animation.oncancel = function () {
          isClosing = false;
        };
      }

      function expand() {
        details.style.height = details.offsetHeight + 'px';
        details.open = true;

        window.requestAnimationFrame(function () {
          isExpanding = true;

          var startHeight = details.offsetHeight + 'px';
          var endHeight = summary.offsetHeight + content.offsetHeight + 'px';

          if (animation) animation.cancel();

          animation = details.animate(
            { height: [startHeight, endHeight] },
            { duration: 320, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
          );

          animation.onfinish = function () {
            onFinish(true);
          };

          animation.oncancel = function () {
            isExpanding = false;
          };
        });
      }

      function onFinish(openState) {
        details.open = openState;
        animation = null;
        isClosing = false;
        isExpanding = false;
        details.style.height = '';
        details.style.overflow = '';
      }
    });
  }

  runWhenIdle(function () {
    initCarousels();
    initActiveNav();
    initFaqAccordions();
  }, 900);

})();
