'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/applicants/export',
      handler: 'applicant-export.exportByJob',
      config: {
        auth: false,
      },
    },
  ],
};
