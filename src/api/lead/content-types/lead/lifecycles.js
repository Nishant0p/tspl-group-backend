'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      await strapi.service('api::rcs.rcs').sendUniversalLead(result.phone);
    } catch (err) {
      strapi.log.error('Contact Auto-Responder Failed', err);
    }
  },
};
