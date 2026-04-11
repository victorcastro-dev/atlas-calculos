window.ATLAS_TRACKING_CONFIG = window.ATLAS_TRACKING_CONFIG || {
  // Insert the real GA4 Measurement ID.
  // Example: 'G-XXXXXXXXXX'
  ga4MeasurementId: '',

  // Insert the real Google Ads tag ID.
  // Example: 'AW-123456789'
  googleAdsId: '',

  googleAdsConversions: {
    // Insert the Google Ads conversion label used for WhatsApp lead clicks.
    // Example: 'AW-123456789/AbCdEfGhIjkLmNoP'
    whatsappLead: '',

    // Insert the Google Ads conversion label used for the contact form submit.
    // Example: 'AW-123456789/QrStUvWxYz123456'
    contactFormLead: ''
  },

  consent: {
    enabled: true,
    storageKey: 'atlas-cookie-consent-v1'
  },

  // Enable only when you want to inspect the events in the browser console.
  debug: false
};
