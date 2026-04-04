'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/waba/sms/send',
      handler: 'waba.sendSms',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/waba/upload-file',
      handler: 'waba.uploadFile',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/waba/bulk-push',
      handler: 'waba.bulkPush',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/waba/templates/sms',
      handler: 'waba.getSmsTemplates',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/waba/rcs/send',
      handler: 'waba.sendRcs',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/waba/rcs/template-json',
      handler: 'waba.getRcsTemplateJson',
      config: { auth: false },
    },
  ],
};
