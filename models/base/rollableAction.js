const mongoose = require('mongoose');
const diceSchema = require('./dice')

const rollableActionSchema = mongoose.Schema({
    dice: {
        type: [diceSchema],
        default: []
    },
    flags: {
        separate: {
            type: mongoose.SchemaTypes.Boolean,
            default: false
        },
        heal: {
            type: mongoose.SchemaTypes.Boolean,
            default: false
        }
    }
});

rollableActionSchema.methods.initialize = function(diceString) {
    const diceStringRegex = /^(?<rollsString>(\d*d\d+(?:[+-]\d+)?)(,\d*d\d+(?:[+-]\d+)?)*)(?<flags>\/[sh]+)*$/i;
    const matchResult = diceString.match(diceStringRegex);
    if (!matchResult) {
        throw new Error('Dicestring validation failed, check your string again.');
    }
    const { rollsString, flags } = matchResult.groups;
    if (flags?.match(/s/))
        this.flags.separate = true;
    if (flags?.match(/h/))
        this.flags.heal = true;
    const separateRollStrings = rollsString.split(',');
    const diceRolls = separateRollStrings.map(rollString => 
        rollString.match(/(?<diceNumber>\d+)?d(?<diceType>\d+)(?<bonus>[+-]\d+)?/i).groups);
    this.dice = diceRolls;
}

module.exports = rollableActionSchema;
