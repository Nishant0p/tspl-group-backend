'use strict';

const ExcelJS = require('exceljs');

const safeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

module.exports = {
  async exportByJob(ctx) {
    const { jobId } = ctx.query;

    const filters = {};
    if (jobId) {
      filters.job = { id: { $eq: Number(jobId) } };
    }

    const applicants = await strapi.entityService.findMany('api::applicant.applicant', {
      filters,
      populate: {
        job: {
          fields: ['id', 'title'],
        },
      },
      sort: { createdAt: 'desc' },
      fields: ['id', 'name', 'mobile', 'email', 'createdAt'],
      pagination: {
        page: 1,
        pageSize: 10000,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applicants');

    worksheet.columns = [
      { header: 'Applicant ID', key: 'id', width: 14 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Phone', key: 'mobile', width: 18 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Job ID', key: 'jobId', width: 10 },
      { header: 'Job Title', key: 'jobTitle', width: 28 },
      { header: 'Applied At', key: 'createdAt', width: 24 },
    ];

    applicants.forEach((applicant) => {
      worksheet.addRow({
        id: applicant.id,
        name: safeText(applicant.name),
        mobile: safeText(applicant.mobile),
        email: safeText(applicant.email),
        jobId: applicant.job?.id || '',
        jobTitle: safeText(applicant.job?.title),
        createdAt: applicant.createdAt ? new Date(applicant.createdAt).toISOString() : '',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const fileName = jobId
      ? `applicants-job-${jobId}.xlsx`
      : `applicants-all-${Date.now()}.xlsx`;

    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.set('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(ctx.res);
    ctx.res.end();
  },
};
