/**
 * Enrichment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		seeds: {
			type: 'array',
			required: true
		},

		depth: {
			type: 'string',
			required: true
		},

		user: {
			type: 'string',
			required: true
		},

		candidates: 'array',

		status: 'string'
	}

};