'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      // Fetch the linked job to resolve the dynamic RCS template selected in dashboard.
      const applicantWithJob = await strapi.entityService.findOne(
        'api::applicant.applicant',
        result.id,
        {
          populate: {
            job: {
              fields: ['id', 'title', 'rcsTemplateCode'],
            },
          },
        }
      );

      const templateCode = applicantWithJob?.job?.rcsTemplateCode;
      await strapi
        .service('api::rcs.rcs')
        .dispatch(result.mobile, result.name, templateCode);
    } catch (err) {
      strapi.log.error('RCS Bridge Failed', err);
    }
  },
};
