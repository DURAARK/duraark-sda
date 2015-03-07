/**
 * Enrichment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		originatingFile: {
			type: 'string',
			required: true
		},

		status: {
			type: 'string',
			required: false
		},

		selectedItems: 'array',
		
		availableItems: 'array',

		session: 'string'
	}
};