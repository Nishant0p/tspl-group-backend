'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      const deliveryResult = await strapi
        .service('api::rcs.rcs')
        .sendUniversalLead(result.phone, result.name);

      await strapi.entityService.update('api::lead.lead', result.id, {
        data: {
          notificationSent: Boolean(deliveryResult?.sent),
          notificationChannel: deliveryResult?.channel || 'none',
          notificationStatus: deliveryResult?.status || 'not-attempted',
          notificationMessageId: deliveryResult?.messageId || null,
          notificationResponse: deliveryResult?.response || null,
        },
      });

      strapi.log.info(
        `Lead notification result: leadId=${result.id} sent=${Boolean(deliveryResult?.sent)} channel=${deliveryResult?.channel || 'none'} status=${deliveryResult?.status || 'not-attempted'} messageId=${deliveryResult?.messageId || 'n/a'}`,
      );
    } catch (err) {
      strapi.log.error('Contact Auto-Responder Failed', err);

      await strapi.entityService.update('api::lead.lead', result.id, {
        data: {
          notificationSent: false,
          notificationChannel: 'none',
          notificationStatus: 'lifecycle-error',
          notificationResponse: err?.message || 'unknown-error',
        },
      });
    }
  },
};
