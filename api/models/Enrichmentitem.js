/**
 * Enrichment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        datasetId: {
            type: 'string',
            required: true
        },

        datasetName: {
            type: 'string',
            required: true
        },

        resourceId: {
            type: 'string',
            required: true
        },

        resourceUri: {
            type: 'string',
            required: true
        },

        propertyUri: {
            type: 'string',
            required: true
        },

        enrichment: {
            model: 'enrichment'
        }
    }
};