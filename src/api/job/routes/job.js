'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::job.job', {
	config: {
		find: {
			auth: false,
		},
		findOne: {
			auth: false,
		},
	},
});
