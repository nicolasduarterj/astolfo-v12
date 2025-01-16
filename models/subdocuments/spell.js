const mongoose = require('mongoose');

const spellSchema = mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    level: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        min: 0,
        max: 9,
    },
    diceCode: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    }
});

module.exports = spellSchema;