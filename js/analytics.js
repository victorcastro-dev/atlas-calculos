(function () {
  'use strict';

  var rawConfig = window.ATLAS_TRACKING_CONFIG || {};
  var config = {
    ga4MeasurementId: cleanId(rawConfig.ga4MeasurementId),
    googleAdsId: cleanId(rawConfig.googleAdsId),
    googleAdsConversions: {
      whatsappLead: cleanId(rawConfig.googleAdsConversions && rawConfig.googleAdsConversions.whatsappLead),
      contactFormLead: cleanId(rawConfig.googleAdsConversions && rawConfig.googleAdsConversions.contactFormLead)
    },
    consent: {
      enabled: !rawConfig.consent || rawConfig.consent.enabled !== false,
      storageKey:
        (rawConfig.consent && rawConfig.consent.storageKey) || 'atlas-cookie-consent-v1'
    },
    debug: rawConfig.debug === true
  };

  var pageContext = getPageContext();
  var consentGranted = false;
  var tagsInitialized = false;
  var tagsInitializing = false;
  var gtagReady = false;

  function cleanId(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function logDebug() {
    if (!config.debug || typeof console === 'undefined' || typeof console.log !== 'function') {
      return;
    }

    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Atlas Analytics]');
    console.log.apply(console, args);
  }

  function hasTrackingIds() {
    return Boolean(config.ga4MeasurementId || config.googleAdsId);
  }

  function hasAnalyticsConsent() {
    if (!config.consent.enabled || !hasTrackingIds()) {
      return true;
    }

    return readConsent() === 'granted';
  }

  function readConsent() {
    try {
      return window.localStorage.getItem(config.consent.storageKey) || '';
    } catch (error) {
      logDebug('Unable to read consent state.', error);
      return '';
    }
  }

  function writeConsent(value) {
    try {
      window.localStorage.setItem(config.consent.storageKey, value);
    } catch (error) {
      logDebug('Unable to persist consent state.', error);
    }
  }

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];

    if (typeof window.gtag !== 'function') {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  function loadGoogleTagManager(callback, onError) {
    if (gtagReady) {
      callback();
      return;
    }

    var primaryTagId = config.ga4MeasurementId || config.googleAdsId;

    if (!primaryTagId) {
      callback();
      return;
    }

    var existingScript = document.querySelector('script[data-atlas-google-tag="true"]');

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        gtagReady = true;
        callback();
        return;
      }

      existingScript.addEventListener(
        'load',
        function () {
          gtagReady = true;
          callback();
        },
        { once: true }
      );

      return;
    }

    ensureDataLayer();

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryTagId);
    script.dataset.atlasGoogleTag = 'true';

    script.addEventListener('load', function () {
      script.dataset.loaded = 'true';
      gtagReady = true;
      callback();
    });

    script.addEventListener('error', function () {
      if (typeof onError === 'function') {
        onError();
      }

      logDebug('Failed to load gtag.js.');
    });

    document.head.appendChild(script);
  }

  function initializeTags() {
    if (tagsInitialized || tagsInitializing || !hasTrackingIds() || !consentGranted) {
      return;
    }

    tagsInitializing = true;

    loadGoogleTagManager(
      function () {
        if (tagsInitialized) {
          tagsInitializing = false;
          return;
        }

        ensureDataLayer();
        window.gtag('js', new Date());

        if (config.ga4MeasurementId) {
          window.gtag('config', config.ga4MeasurementId, {
            send_page_view: true,
            anonymize_ip: true
          });
        }

        if (config.googleAdsId) {
          window.gtag('config', config.googleAdsId);
        }

        tagsInitialized = true;
        tagsInitializing = false;
        logDebug('Google tags initialized.', {
          ga4MeasurementId: config.ga4MeasurementId,
          googleAdsId: config.googleAdsId
        });
      },
      function () {
        tagsInitializing = false;
      }
    );
  }

  function sanitizeText(value, maxLength) {
    if (!value) return '';

    var normalized = String(value)
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalized) return '';

    if (!normalized.normalize) {
      return normalized.slice(0, maxLength || 100);
    }

    return normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, maxLength || 100);
  }

  function getPathKey(pathname) {
    var normalized = String(pathname || '/')
      .replace(/index\.html$/i, '')
      .replace(/\/+$/, '');

    return normalized || '/';
  }

  function getPageContext() {
    var pageMap = {
      '/': {
        page_name: 'home',
        page_type: 'home',
        service_name: ''
      },
      '/politica-de-privacidade': {
        page_name: 'privacidade',
        page_type: 'legal',
        service_name: ''
      },
      '/calculos-iniciais': {
        page_name: 'calculos_iniciais_trabalhistas',
        page_type: 'service',
        service_name: 'calculos_iniciais_trabalhistas'
      },
      '/liquidacao-de-sentenca': {
        page_name: 'liquidacao_de_sentenca_trabalhista',
        page_type: 'service',
        service_name: 'liquidacao_de_sentenca_trabalhista'
      },
      '/impugnacao-de-calculos': {
        page_name: 'impugnacao_de_calculos_trabalhistas',
        page_type: 'service',
        service_name: 'impugnacao_de_calculos_trabalhistas'
      },
      '/calculos-de-contingencia': {
        page_name: 'contingencia_trabalhista',
        page_type: 'service',
        service_name: 'contingencia_trabalhista'
      },
      '/revisao-de-calculos': {
        page_name: 'revisao_de_calculos_trabalhistas',
        page_type: 'service',
        service_name: 'revisao_de_calculos_trabalhistas'
      },
      '/calculos-para-advogados': {
        page_name: 'calculos_trabalhistas_para_advogados',
        page_type: 'service',
        service_name: 'calculos_trabalhistas_para_advogados'
      }
    };

    var pathKey = getPathKey(window.location.pathname);
    return pageMap[pathKey] || {
      page_name: sanitizeText(pathKey.replace(/^\/+/, ''), 40) || 'pagina_desconhecida',
      page_type: document.body && document.body.classList.contains('service-page') ? 'service' : 'site',
      service_name: ''
    };
  }

  function getLinkMetadata(link) {
    if (!link || !link.getAttribute) {
      return {
        href: '',
        fileName: '',
        serviceName: '',
        anchor: ''
      };
    }

    var rawHref = link.getAttribute('href') || '';
    var url;

    try {
      url = new URL(rawHref, window.location.href);
    } catch (error) {
      return {
        href: rawHref,
        fileName: '',
        serviceName: '',
        anchor: ''
      };
    }

    var pathKey = getPathKey(url.pathname);
    var mappedContext = getContextByFileName(pathKey);

    return {
      href: rawHref,
      fileName: pathKey,
      serviceName: mappedContext.service_name || '',
      anchor: url.hash ? sanitizeText(url.hash.replace(/^#/, ''), 40) : ''
    };
  }

  function getContextByFileName(fileName) {
    var filePath = fileName || '';

    if (!filePath || filePath === '/') {
      return {
        service_name: '',
        page_type: filePath === '/' ? 'home' : 'site'
      };
    }

    return getPageContextFromFileName(filePath);
  }

  function getPageContextFromFileName(fileName) {
    var map = {
      '/politica-de-privacidade': {
        service_name: '',
        page_type: 'legal'
      },
      '/calculos-iniciais': {
        service_name: 'calculos_iniciais_trabalhistas',
        page_type: 'service'
      },
      '/liquidacao-de-sentenca': {
        service_name: 'liquidacao_de_sentenca_trabalhista',
        page_type: 'service'
      },
      '/impugnacao-de-calculos': {
        service_name: 'impugnacao_de_calculos_trabalhistas',
        page_type: 'service'
      },
      '/calculos-de-contingencia': {
        service_name: 'contingencia_trabalhista',
        page_type: 'service'
      },
      '/revisao-de-calculos': {
        service_name: 'revisao_de_calculos_trabalhistas',
        page_type: 'service'
      },
      '/calculos-para-advogados': {
        service_name: 'calculos_trabalhistas_para_advogados',
        page_type: 'service'
      }
    };

    return map[fileName] || {
      service_name: sanitizeText(fileName.replace(/^\/+/, ''), 40),
      page_type: 'site'
    };
  }

  function getButtonText(element) {
    if (!element) return '';

    var text = element.getAttribute('aria-label') || element.textContent || '';
    return sanitizeText(text, 60);
  }

  function getEventBaseParams(extraParams) {
    return cleanParams(
      Object.assign(
        {
          page_name: pageContext.page_name,
          page_type: pageContext.page_type,
          service_name: pageContext.service_name || undefined
        },
        extraParams || {}
      )
    );
  }

  function cleanParams(params) {
    var output = {};

    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];

      if (value === undefined || value === null || value === '') {
        return;
      }

      output[key] = typeof value === 'string' ? value.slice(0, 100) : value;
    });

    return output;
  }

  function trackEvent(eventName, params) {
    if (!hasTrackingIds() || !consentGranted) {
      return false;
    }

    initializeTags();

    if (typeof window.gtag !== 'function') {
      return false;
    }

    var finalParams = cleanParams(params);
    window.gtag('event', eventName, finalParams);
    logDebug('Tracked event:', eventName, finalParams);
    return true;
  }

  function trackGoogleAdsConversion(conversionLabel, params) {
    if (!conversionLabel || !config.googleAdsId || !consentGranted || typeof window.gtag !== 'function') {
      return false;
    }

    var conversionParams = cleanParams(
      Object.assign(
        {
          send_to: conversionLabel
        },
        params || {}
      )
    );

    window.gtag('event', 'conversion', conversionParams);
    logDebug('Tracked Google Ads conversion:', conversionParams);
    return true;
  }

  function trackPrimaryLead(params, source) {
    var baseParams = getEventBaseParams(
      Object.assign(
        {
          conversion_tier: 'primary',
          lead_channel: 'whatsapp'
        },
        params || {}
      )
    );

    trackEvent('generate_lead', baseParams);

    if (source === 'contact_form') {
      trackGoogleAdsConversion(config.googleAdsConversions.contactFormLead);
      return;
    }

    trackGoogleAdsConversion(config.googleAdsConversions.whatsappLead);
  }

  function matchesSelector(element, selector) {
    return element && element.matches && element.matches(selector);
  }

  function getClickRule(element) {
    var rules = [
      {
        selector: '.header__cta[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'header',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: '.hero__actions .btn--primary[href*="wa.me"], .page-hero__actions .btn--primary[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'hero',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: '.faq__sidebar-cta .btn--primary[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'faq_sidebar',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: '.cta-band__actions .btn--primary[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'cta_band',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: '.contact-channel[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'contact_channel',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: '.whatsapp-float[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'floating_whatsapp',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: 'footer a[href*="wa.me"]',
        eventName: 'lead_cta_click',
        params: {
          cta_location: 'footer',
          contact_method: 'whatsapp',
          conversion_tier: 'primary'
        },
        trackLead: true
      },
      {
        selector: '.service-card__link, .service-link-card',
        eventName: 'service_navigation_click',
        params: {
          cta_location: 'service_navigation',
          conversion_tier: 'micro',
          target_type: 'service_page'
        }
      },
      {
        selector: '.about__content .btn[href^="/"]:not([href*="#"])',
        eventName: 'service_navigation_click',
        params: {
          cta_location: 'about_cta',
          conversion_tier: 'micro',
          target_type: 'service_page'
        }
      },
      {
        selector: '.hero__actions .btn--outline[href*="#servicos"], .page-hero__actions .btn--outline[href*="/#servicos"]',
        eventName: 'service_navigation_click',
        params: {
          cta_location: 'hero_secondary',
          conversion_tier: 'micro',
          target_type: 'section'
        }
      },
      {
        selector: '.cta-band__actions .btn--outline[href^="/"]:not([href*="#"])',
        eventName: 'service_navigation_click',
        params: {
          cta_location: 'cta_band_secondary',
          conversion_tier: 'micro',
          target_type: 'service_page'
        }
      }
    ];

    for (var index = 0; index < rules.length; index += 1) {
      if (matchesSelector(element, rules[index].selector)) {
        return rules[index];
      }
    }

    return null;
  }

  function buildClickParams(element, rule) {
    var linkMetadata = getLinkMetadata(element);

    return getEventBaseParams(
      Object.assign({}, rule.params, {
        cta_text: getButtonText(element),
        target_name: linkMetadata.serviceName || linkMetadata.anchor || sanitizeText(linkMetadata.fileName, 40),
        target_file: sanitizeText(linkMetadata.fileName || linkMetadata.href, 60)
      })
    );
  }

  function handleDocumentClick(event) {
    var element = event.target && event.target.closest ? event.target.closest('a, button') : null;

    if (!element) {
      return;
    }

    var rule = getClickRule(element);

    if (!rule) {
      return;
    }

    var params = buildClickParams(element, rule);
    trackEvent(rule.eventName, params);

    if (rule.trackLead) {
      trackPrimaryLead(
        {
          cta_location: params.cta_location,
          cta_text: params.cta_text,
          target_name: params.target_name
        },
        'whatsapp'
      );
    }
  }

  function handleFormSubmit(event) {
    var form = event.target;

    if (!form || form.id !== 'contactForm') {
      return;
    }

    var serviceField = form.querySelector('#tipo');
    var selectedService = serviceField ? sanitizeText(serviceField.value, 60) : '';
    var params = getEventBaseParams({
      form_id: 'contact_form',
      selected_service: selectedService,
      contact_method: 'whatsapp',
      conversion_tier: 'primary'
    });

    trackEvent('contact_form_submit', params);
    trackPrimaryLead(
      {
        cta_location: 'contact_form',
        selected_service: selectedService
      },
      'contact_form'
    );
  }

  function renderConsentBanner() {
    if (!config.consent.enabled || !hasTrackingIds() || readConsent()) {
      return;
    }

    if (document.querySelector('.cookie-banner')) {
      return;
    }

    var banner = document.createElement('aside');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Preferencias de cookies');
    banner.innerHTML =
      '<div class="cookie-banner__content">' +
      '<p class="cookie-banner__eyebrow">Analytics do site</p>' +
      '<h2 class="cookie-banner__title">Autorizar medicao com Google Analytics e Google Ads?</h2>' +
      '<p class="cookie-banner__text">Usamos essas tags apenas para medir acessos, cliques e geracao de leads. Voce pode aceitar ou recusar os cookies analiticos.</p>' +
      '<a class="cookie-banner__link" href="/politica-de-privacidade/">Ler politica de privacidade</a>' +
      '</div>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn btn--outline cookie-banner__button" data-cookie-action="reject">Recusar</button>' +
      '<button type="button" class="btn btn--primary cookie-banner__button" data-cookie-action="accept">Aceitar analytics</button>' +
      '</div>';

    banner.addEventListener('click', function (event) {
      var action = event.target && event.target.getAttribute('data-cookie-action');

      if (!action) {
        return;
      }

      if (action === 'accept') {
        writeConsent('granted');
        consentGranted = true;
        initializeTags();
      } else {
        writeConsent('denied');
        consentGranted = false;
      }

      banner.remove();
    });

    document.body.appendChild(banner);
  }

  function init() {
    consentGranted = hasAnalyticsConsent();

    if (consentGranted) {
      initializeTags();
    } else {
      renderConsentBanner();
    }

    document.addEventListener('click', handleDocumentClick, true);
    document.addEventListener('submit', handleFormSubmit, true);
  }

  window.AtlasAnalytics = {
    getConfig: function () {
      return config;
    },
    getPageContext: function () {
      return pageContext;
    },
    hasConsent: function () {
      return consentGranted;
    },
    trackEvent: trackEvent
  };

  init();
})();
