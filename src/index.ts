import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const existingSeed = await strapi.entityService.findMany('api::job.job', {
      filters: {
        title: { $eq: 'Mechanical Labor' },
        rcsTemplateCode: { $eq: 'tspl_job_apply_thanks' },
      },
      fields: ['id'],
      pagination: {
        page: 1,
        pageSize: 1,
      },
    });

    if (existingSeed.length > 0) {
      const publishedDraftStatusJobs = await strapi.entityService.findMany('api::job.job', {
        filters: {
          publishedAt: { $notNull: true },
          status: { $ne: 'published' },
        },
        select: ['id'],
      });

      for (const job of publishedDraftStatusJobs) {
        await strapi.entityService.update('api::job.job', job.id, {
          data: {
            status: 'published',
          },
        });
      }

      return;
    }

    await strapi.entityService.create('api::job.job', {
      data: {
        title: 'Mechanical Labor',
        status: 'published',
        rcsTemplateCode: 'tspl_job_apply_thanks',
        description:
          'Seed job created automatically for initial API and frontend integration testing.',
        publishedAt: new Date(),
      },
    });

    strapi.log.info('Seeded initial Job entry for testing flow.');
  },
};
