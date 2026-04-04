'use strict';

const axios = require('axios');

const normalizeMobile = (mobile) => (mobile || '').toString().replace(/\D/g, '');

module.exports = ({ strapi }) => ({
  async dispatch(mobile, userName, templateCode) {
    const apiKey = process.env.WABA_API_KEY || process.env.WABASMSBOX_API_KEY;
    const botId = process.env.WABA_BOT_ID || process.env.WABASMSBOX_BOT_ID || 'TSPL_BOT_01';
    const endpoint =
      process.env.WABASMSBOX_RCS_ENDPOINT ||
      'https://wabasmsbox.com/REST/direct/sendRCS';

    if (!apiKey) {
      strapi.log.warn('WABA_API_KEY/WABASMSBOX_API_KEY is not configured. Skipping RCS dispatch.');
      return;
    }

    if (!templateCode) {
      strapi.log.warn('No template code found for applicant/job. Skipping RCS dispatch.');
      return;
    }

    const sanitizedMobile = normalizeMobile(mobile);

    if (!sanitizedMobile || sanitizedMobile.length < 10) {
      strapi.log.warn('Invalid mobile number. Skipping RCS dispatch.');
      return;
    }

    const body = {
      contentMessage: {
        templateMessage: {
          templateCode,
          customParams: JSON.stringify({ userName: userName || 'Candidate' }),
        },
        mobileno: sanitizedMobile,
        botId,
        messageId: `TSPL_${Date.now()}`,
      },
    };

    await axios.post(endpoint, body, {
      headers: {
        key: apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  },

  async send({ mobile, templateCode, userName }) {
    return this.dispatch(mobile, userName, templateCode);
  },

  async sendUniversalLead(mobile) {
    const apiKey = process.env.WABA_API_KEY || process.env.WABASMSBOX_API_KEY;
    const endpoint =
      process.env.WABASMSBOX_RCS_ENDPOINT ||
      'https://wabasmsbox.com/REST/direct/sendRCS';
    const botId = process.env.LEAD_RCS_BOT_ID || '69c684ab80cbf50614fe36dd';

    if (!apiKey) {
      strapi.log.warn('WABA_API_KEY/WABASMSBOX_API_KEY is not configured. Skipping contact lead dispatch.');
      return;
    }

    const sanitizedMobile = normalizeMobile(mobile);

    if (!sanitizedMobile || sanitizedMobile.length < 10) {
      strapi.log.warn('Invalid mobile number for contact lead. Skipping dispatch.');
      return;
    }

    const body = {
      contentMessage: {
        templateMessage: {
          templateCode: 'Universal',
        },
        mobileno: sanitizedMobile,
        botId,
      },
    };

    await axios.post(endpoint, body, {
      headers: {
        key: apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  },
});
