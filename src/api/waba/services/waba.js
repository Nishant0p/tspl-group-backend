'use strict';

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const withLeadingSlash = (path) => (path.startsWith('/') ? path : `/${path}`);

const buildUrl = (path, fallbackAbsoluteUrl) => {
  if (fallbackAbsoluteUrl) {
    return fallbackAbsoluteUrl;
  }

  const baseUrl = process.env.WABA_BASE_URL || 'https://wabasmsbox.com';
  return `${baseUrl}${withLeadingSlash(path)}`;
};

const normalizeMobile = (mobile) => (mobile || '').toString().replace(/\s+/g, '');

module.exports = ({ strapi }) => ({
  getApiKey() {
    return process.env.WABA_API_KEY || process.env.WABASMSBOX_API_KEY;
  },

  getDefaultHeaders(extraHeaders = {}) {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('WABA_API_KEY/WABASMSBOX_API_KEY is not configured');
    }

    return {
      key,
      ...extraHeaders,
    };
  },

  async sendSms({ listsms, unicode, isShortUrl, clientsmsid, encryptContent, time }) {
    if (!Array.isArray(listsms) || listsms.length === 0) {
      throw new Error('listsms must be a non-empty array');
    }

    const payload = {
      listsms: listsms.map((item) => ({
        sms: item.sms,
        mobiles: normalizeMobile(item.mobiles),
        senderid: item.senderid,
        entityid: item.entityid,
        tempid: item.tempid,
      })),
    };

    if (unicode !== undefined) payload.unicode = unicode;
    if (isShortUrl !== undefined) payload.isShortUrl = isShortUrl;
    if (clientsmsid !== undefined) payload.clientsmsid = clientsmsid;
    if (encryptContent !== undefined) payload.encryptContent = encryptContent;
    if (time !== undefined) payload.time = time;

    const response = await axios.post(
      buildUrl('/api/json/sendsms/', process.env.WABA_SMS_SEND_ENDPOINT),
      payload,
      {
        headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
        timeout: 15000,
      }
    );

    return response.data;
  },

  async uploadFile({ filePath, fileName }) {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('Valid filePath is required for uploadFile');
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), fileName || 'campaign.xlsx');

    const response = await axios.post(
      buildUrl('/api/uploadFile', process.env.WABA_FILE_UPLOAD_ENDPOINT),
      formData,
      {
        headers: {
          ...this.getDefaultHeaders(),
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        timeout: 30000,
      }
    );

    return response.data;
  },

  async bulkPush({
    campaingName,
    templateId,
    entityId,
    senderId,
    message,
    fileId,
    mobilenoFiled,
    unicode,
    countryCode,
    isSchedule,
    scheduleDateTime,
  }) {
    const payload = {
      campaingName,
      templateId,
      entityId,
      senderId,
      message,
      fileId,
      mobilenoFiled,
    };

    if (unicode !== undefined) payload.unicode = unicode;
    if (countryCode !== undefined) payload.countryCode = countryCode;
    if (isSchedule !== undefined) payload.isSchedule = isSchedule;
    if (scheduleDateTime !== undefined) payload.scheduleDateTime = scheduleDateTime;

    const response = await axios.post(
      buildUrl('/api/bulk-push', process.env.WABA_BULK_PUSH_ENDPOINT),
      payload,
      {
        headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
        timeout: 30000,
      }
    );

    return response.data;
  },

  async getSmsTemplates() {
    const key = this.getApiKey();
    const response = await axios.get(
      buildUrl('/api/getSmsTemplates', process.env.WABA_SMS_TEMPLATES_ENDPOINT),
      {
        params: { key },
        timeout: 10000,
      }
    );

    return response.data;
  },

  async sendRcs({ mobile, templateCode, customParams, botId, messageId }) {
    const resolvedBotId = botId || process.env.WABA_BOT_ID || process.env.WABASMSBOX_BOT_ID;

    if (!resolvedBotId) {
      throw new Error('WABA_BOT_ID/WABASMSBOX_BOT_ID is not configured');
    }

    const payload = {
      contentMessage: {
        templateMessage: {
          templateCode,
          customParams: JSON.stringify(customParams || {}),
        },
        mobileno: normalizeMobile(mobile),
        botId: resolvedBotId,
        messageId: messageId || `TSPL_${Date.now()}`,
      },
    };

    const response = await axios.post(
      buildUrl('/REST/direct/sendRCS', process.env.WABA_RCS_SEND_ENDPOINT),
      payload,
      {
        headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
        timeout: 15000,
      }
    );

    return response.data;
  },

  async getRcsTemplateJson({ templateName, agentId }) {
    const payload = {
      templateName,
      agentId: agentId || process.env.WABA_AGENT_ID,
    };

    const response = await axios.post(
      buildUrl('/REST/direct/getRcsTemplateJson', process.env.WABA_RCS_TEMPLATE_ENDPOINT),
      payload,
      {
        headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
        timeout: 15000,
      }
    );

    return response.data;
  },
});
