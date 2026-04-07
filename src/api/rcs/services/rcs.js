'use strict';

const axios = require('axios');

const DEFAULT_SEND_ENDPOINT = 'https://wabasmsbox.com/REST/direct/sendRCS';
const DEFAULT_TEMPLATE_ENDPOINT = 'https://wabasmsbox.com/REST/direct/getRcsTemplateJson';

const normalizeMobile = (mobile) => (mobile || '').toString().replace(/\D/g, '');
const formatLeadMobile = (mobile) => {
  const digits = normalizeMobile(mobile);

  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+91${digits.slice(1)}`;
  return `+${digits}`;
};

const getApiKey = () => process.env.WABA_API_KEY || process.env.WABASMSBOX_API_KEY;
const getSendEndpoint = () => process.env.WABASMSBOX_RCS_ENDPOINT || DEFAULT_SEND_ENDPOINT;
const getTemplateEndpoint = () => process.env.WABASMSBOX_TEMPLATE_ENDPOINT || DEFAULT_TEMPLATE_ENDPOINT;
const getLeadSmsSenderId = () => process.env.LEAD_SMS_SENDER_ID || process.env.WABA_SMS_SENDER_ID;
const getLeadSmsEntityId = () => process.env.LEAD_SMS_ENTITY_ID || process.env.WABA_SMS_ENTITY_ID;
const getLeadSmsTempId = () => process.env.LEAD_SMS_TEMP_ID || process.env.WABA_SMS_TEMP_ID;
const getLeadSmsText = (userName) =>
  process.env.LEAD_SMS_TEXT ||
  `Hi ${userName || 'there'}, thank you for contacting TSPL Group. Our team will connect with you shortly.`;

const postToProvider = async (strapi, endpoint, apiKey, body, contextLabel) => {
  try {
    const response = await axios.post(endpoint, body, {
      headers: {
        key: apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data?.status === false) {
      strapi.log.warn(`${contextLabel} provider returned status=false`, response.data);
    } else {
      strapi.log.info(`${contextLabel} succeeded`, response.data);
    }

    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const providerData = error.response?.data;

    strapi.log.error(
      `${contextLabel} failed${status ? ` (${status})` : ''}`,
      providerData || error.message,
    );

    throw error;
  }
};

module.exports = ({ strapi }) => ({
  async sendLeadSmsFallback(mobile, userName, reason) {
    const senderid = getLeadSmsSenderId();
    const entityid = getLeadSmsEntityId();
    const tempid = getLeadSmsTempId();

    if (!senderid || !entityid || !tempid) {
      strapi.log.warn(
        'SMS fallback skipped because LEAD_SMS_SENDER_ID, LEAD_SMS_ENTITY_ID, or LEAD_SMS_TEMP_ID is missing.',
      );
      return {
        sent: false,
        channel: 'sms',
        status: 'fallback-config-missing',
        messageId: null,
        response: null,
      };
    }

    const mobileForSms = formatLeadMobile(mobile);

    if (!mobileForSms || mobileForSms.length < 12) {
      strapi.log.warn('SMS fallback skipped because phone number is invalid.');
      return {
        sent: false,
        channel: 'sms',
        status: 'fallback-invalid-mobile',
        messageId: null,
        response: null,
      };
    }

    try {
      const smsResponse = await strapi.service('api::waba.waba').sendSms({
        listsms: [
          {
            sms: getLeadSmsText(userName),
            mobiles: mobileForSms,
            senderid,
            entityid,
            tempid,
          },
        ],
        unicode: 1,
        isShortUrl: 1,
        clientsmsid: Date.now(),
        encryptContent: 1,
      });

      strapi.log.info(`Lead SMS fallback succeeded (reason: ${reason || 'unknown'})`, smsResponse);

      const smsPayload = Array.isArray(smsResponse?.smslist?.sms)
        ? smsResponse.smslist.sms[0]
        : smsResponse?.smslist?.sms || null;

      return {
        sent: smsPayload?.status === 'success' || smsPayload?.code === '000',
        channel: 'sms',
        status: smsPayload?.reason || smsPayload?.status || 'sms-fallback-attempted',
        messageId: smsPayload?.messageid ? String(smsPayload.messageid) : null,
        response: smsResponse,
      };
    } catch (error) {
      strapi.log.error('Lead SMS fallback failed', error.response?.data || error.message);
      return {
        sent: false,
        channel: 'sms',
        status: 'fallback-error',
        messageId: null,
        response: error.response?.data || error.message,
      };
    }
  },

  async dispatch(mobile, userName, templateCode) {
    const apiKey = getApiKey();
    const botId = process.env.WABA_BOT_ID || process.env.WABASMSBOX_BOT_ID || 'TSPL_BOT_01';
    const endpoint = getSendEndpoint();

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

    return postToProvider(strapi, endpoint, apiKey, body, 'RCS dispatch');
  },

  async send({ mobile, templateCode, userName }) {
    return this.dispatch(mobile, userName, templateCode);
  },

  async sendUniversalLead(mobile, userName) {
    const logLeadResult = (result) => {
      strapi.log.info(
        `Lead delivery summary: sent=${Boolean(result?.sent)} channel=${result?.channel || 'none'} status=${result?.status || 'unknown'} messageId=${result?.messageId || 'n/a'}`,
      );

      return result;
    };

    const apiKey = getApiKey();
    const endpoint = getSendEndpoint();
    const botId =
      process.env.LEAD_RCS_BOT_ID ||
      process.env.WABA_BOT_ID ||
      process.env.WABASMSBOX_BOT_ID ||
      '69c684ab80cbf50614fe36dd';
    const templateCode = process.env.LEAD_TEMPLATE_CODE || 'Universal';

    if (!apiKey) {
      strapi.log.warn('WABA_API_KEY/WABASMSBOX_API_KEY is not configured. Skipping contact lead dispatch.');
      return logLeadResult({
        sent: false,
        channel: 'none',
        status: 'api-key-missing',
        messageId: null,
        response: null,
      });
    }

    const sanitizedMobile = formatLeadMobile(mobile);

    if (!sanitizedMobile || sanitizedMobile.length < 12) {
      strapi.log.warn('Invalid mobile number for contact lead. Skipping dispatch.');
      return logLeadResult({
        sent: false,
        channel: 'none',
        status: 'invalid-mobile',
        messageId: null,
        response: null,
      });
    }

    const body = {
      contentMessage: {
        templateMessage: {
          templateCode,
        },
        mobileno: sanitizedMobile,
        botId,
      },
    };

    try {
      const rcsResponse = await postToProvider(strapi, endpoint, apiKey, body, 'Contact lead RCS dispatch');

      if (rcsResponse && rcsResponse.status === false) {
        strapi.log.warn('RCS provider rejected contact lead dispatch. Triggering SMS fallback.');
        const smsFallback = await this.sendLeadSmsFallback(
          sanitizedMobile,
          userName,
          rcsResponse.message || 'rcs-rejected',
        );

        return logLeadResult({
          sent: Boolean(smsFallback?.sent),
          channel: smsFallback?.channel || 'none',
          status: smsFallback?.status || 'rcs-rejected',
          messageId: smsFallback?.messageId || null,
          response: {
            rcs: rcsResponse,
            smsFallback: smsFallback?.response || null,
          },
        });
      }

      return logLeadResult({
        sent: true,
        channel: 'rcs',
        status: rcsResponse?.message || 'sent',
        messageId: rcsResponse?.messageId ? String(rcsResponse.messageId) : null,
        response: rcsResponse,
      });
    } catch (error) {
      strapi.log.warn('Contact lead RCS dispatch failed. Triggering SMS fallback.');
      const smsFallback = await this.sendLeadSmsFallback(sanitizedMobile, userName, 'rcs-error');

      return logLeadResult({
        sent: Boolean(smsFallback?.sent),
        channel: smsFallback?.channel || 'none',
        status: smsFallback?.status || 'rcs-error',
        messageId: smsFallback?.messageId || null,
        response: {
          rcs: error.response?.data || error.message,
          smsFallback: smsFallback?.response || null,
        },
      });
    }
  },

  async fetchTemplateJson(templateCode) {
    const apiKey = getApiKey();

    if (!apiKey) {
      strapi.log.warn('WABA_API_KEY/WABASMSBOX_API_KEY is not configured. Skipping template lookup.');
      return null;
    }

    if (!templateCode) {
      strapi.log.warn('No template code provided for template lookup.');
      return null;
    }

    const endpoint = getTemplateEndpoint();

    return postToProvider(
      strapi,
      endpoint,
      apiKey,
      { templateCode },
      `RCS template lookup (${templateCode})`,
    );
  },
});
