'use strict';

module.exports = {
  async createPublic(ctx) {
    const data = ctx.request.body?.data;

    if (!data || typeof data !== 'object') {
      return ctx.badRequest('Missing request body data.');
    }

    const jobId = data.job;
    if (typeof jobId !== 'number') {
      return ctx.badRequest('Invalid job id.');
    }

    const job = await strapi.db.query('api::job.job').findOne({
      where: { id: jobId },
      select: ['documentId'],
    });

    if (!job?.documentId) {
      return ctx.badRequest('Invalid job id.');
    }

    const created = await strapi.documents('api::applicant.applicant').create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        job: job.documentId,
      },
    });

    ctx.status = 201;
    ctx.body = { data: created };
  },
};
