'use strict';

module.exports = {
	routes: [
		{
			method: 'POST',
			path: '/applicants',
			handler: 'applicant.createPublic',
			config: {
				auth: false,
			},
		},
	],
};
