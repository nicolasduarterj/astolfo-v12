const mongoose = require('mongoose');
const spellSchema = require('./spell');

const spellsInfoSchema = mongoose.Schema({
    spellSlots: {
        type: mongoose.SchemaTypes.Array,
        required: true,
    },
    spells: {
        type: [spellSchema],
        default: null,
    },
});

module.exports = spellsInfoSchema;