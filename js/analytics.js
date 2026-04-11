(function () {
  'use strict';

  if (window.__ATLAS_ANALYTICS_INITIALIZED__) {
    return;
  }

  window.__ATLAS_ANALYTICS_INITIALIZED__ = true;

  function hasGtag() {
    return typeof window.gtag === 'function';
  }

  function cleanText(value, maxLength) {
    if (value === undefined || value === null) {
      return '';
    }

    return String(value)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength || 160);
  }

  function normalizeText(value) {
    var text = cleanText(value, 160);

    if (!text) {
      return '';
    }

    if (typeof text.normalize === 'function') {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    return text.toLowerCase();
  }

  function cleanParams(params) {
    var output = {};

    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];

      if (value === undefined || value === null) {
        return;
      }

      if (typeof value === 'string') {
        value = cleanText(value, 200);

        if (!value) {
          return;
        }
      }

      output[key] = value;
    });

    return output;
  }

  function sendEvent(eventName, params) {
    if (!hasGtag()) {
      return false;
    }

    window.gtag('event', eventName, cleanParams(params));
    return true;
  }

  function getButtonText(element) {
    if (!element) {
      return '';
    }

    return cleanText(
      element.getAttribute('aria-label') ||
        element.getAttribute('title') ||
        element.textContent ||
        '',
      140
    );
  }

  function getLinkUrl(element) {
    if (!element || !element.getAttribute) {
      return '';
    }

    var href = element.getAttribute('href') || '';

    if (!href) {
      return '';
    }

    try {
      return new URL(href, window.location.href).href;
    } catch (error) {
      return cleanText(href, 200);
    }
  }

  function isWhatsAppUrl(url) {
    return /(?:wa\.me|api\.whatsapp\.com|whatsapp\.com)/i.test(url || '');
  }

  function inferLocation(element) {
    if (!element || !element.closest) {
      return 'site';
    }

    if (element.classList && element.classList.contains('whatsapp-float')) {
      return 'whatsapp_float';
    }

    if (element.closest('.whatsapp-float')) {
      return 'whatsapp_float';
    }

    if (element.closest('.header')) {
      return 'header';
    }

    if (element.closest('.hero')) {
      return 'hero';
    }

    if (element.closest('.page-hero')) {
      return 'page_hero';
    }

    if (element.closest('.cta-band')) {
      return 'cta_band';
    }

    if (element.closest('.faq__sidebar-cta')) {
      return 'faq_sidebar';
    }

    if (element.closest('.contact')) {
      return 'contact';
    }

    if (element.closest('footer')) {
      return 'footer';
    }

    if (element.closest('nav')) {
      return 'nav';
    }

    return 'site';
  }

  function hasCtaClass(element) {
    if (!element || !element.classList) {
      return false;
    }

    return (
      element.classList.contains('btn') ||
      element.classList.contains('nav-cta') ||
      element.classList.contains('header__cta')
    );
  }

  function shouldTrackSolicitarAnalise(element, buttonText, linkUrl) {
    var normalizedText = normalizeText(buttonText);
    var explicitLabel = normalizeText(
      element && element.getAttribute ? element.getAttribute('data-whatsapp-label') : ''
    );

    if (normalizedText.indexOf('solicitar') === -1 && explicitLabel.indexOf('solicitar') === -1) {
      return false;
    }

    return isWhatsAppUrl(linkUrl) || hasCtaClass(element);
  }

  function getCommonParams(element) {
    var params = {
      page_location: window.location.href,
      page_path: window.location.pathname || '/',
      page_title: cleanText(document.title, 120),
      cta_location: inferLocation(element)
    };

    var buttonText = getButtonText(element);
    var linkUrl = getLinkUrl(element);

    if (buttonText) {
      params.button_text = buttonText;
    }

    if (linkUrl) {
      params.link_url = linkUrl;
    }

    return params;
  }

  function handleDocumentClick(event) {
    var element = event.target && event.target.closest ? event.target.closest('a, button') : null;

    if (!element) {
      return;
    }

    var buttonText = getButtonText(element);
    var linkUrl = getLinkUrl(element);
    var commonParams = getCommonParams(element);

    if (linkUrl && isWhatsAppUrl(linkUrl)) {
      sendEvent('whatsapp_click', commonParams);
    }

    if (shouldTrackSolicitarAnalise(element, buttonText, linkUrl)) {
      sendEvent('solicitar_analise_click', commonParams);
    }
  }

  function getSubmitButtonText(event, form) {
    if (event && event.submitter) {
      return getButtonText(event.submitter);
    }

    return getButtonText(form.querySelector('[type="submit"]'));
  }

  function getSelectedService(form) {
    var field = form.querySelector('#tipo, [name="tipo"]');
    return field ? cleanText(field.value, 120) : '';
  }

  function handleFormSubmit(event) {
    var form = event.target;

    if (!form || form.id !== 'contactForm') {
      return;
    }

    sendEvent('generate_lead', {
      page_location: window.location.href,
      page_path: window.location.pathname || '/',
      page_title: cleanText(document.title, 120),
      form_id: form.id,
      form_location: inferLocation(form),
      lead_channel: 'whatsapp',
      button_text: getSubmitButtonText(event, form),
      selected_service: getSelectedService(form)
    });
  }

  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('submit', handleFormSubmit, true);

  window.AtlasAnalytics = {
    trackEvent: sendEvent
  };
})();
