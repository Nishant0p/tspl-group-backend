'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::lead.lead', {
	config: {
		create: {
			auth: false,
		},
	},
});
