'use strict';

module.exports = {
  async sendSms(ctx) {
    const payload = ctx.request.body || {};
    const data = await strapi.service('api::waba.waba').sendSms(payload);
    ctx.body = data;
  },

  async uploadFile(ctx) {
    const uploadedFile = ctx.request.files?.file;

    if (!uploadedFile) {
      return ctx.badRequest('file is required in form-data');
    }

    const filePath = uploadedFile.filepath || uploadedFile.path;
    const fileName = uploadedFile.originalFilename || uploadedFile.name;

    const data = await strapi.service('api::waba.waba').uploadFile({ filePath, fileName });
    ctx.body = data;
  },

  async bulkPush(ctx) {
    const payload = ctx.request.body || {};
    const data = await strapi.service('api::waba.waba').bulkPush(payload);
    ctx.body = data;
  },

  async getSmsTemplates(ctx) {
    const data = await strapi.service('api::waba.waba').getSmsTemplates();
    ctx.body = data;
  },

  async sendRcs(ctx) {
    const payload = ctx.request.body || {};

    const data = await strapi.service('api::waba.waba').sendRcs({
      mobile: payload.mobile,
      templateCode: payload.templateCode,
      customParams: payload.customParams,
      botId: payload.botId,
      messageId: payload.messageId,
    });

    ctx.body = data;
  },

  async getRcsTemplateJson(ctx) {
    const payload = ctx.request.body || {};
    const data = await strapi.service('api::waba.waba').getRcsTemplateJson(payload);
    ctx.body = data;
  },
};
