const mongoose = require('mongoose');

const initiativeParticipantSchema = mongoose.Schema({
    initiativeBonus: {
        type: mongoose.SchemaTypes.Number,
        default: 0,
        cast: 'O bônus de iniciativa deve ser um número'
    },
    initiativeAdvantage: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
});

initiativeParticipantSchema.methods.rollInitiative = function() {
    const dice1 = Math.floor(Math.random() * 20) + 1;
    if (this.initiativeAdvantage) {
        const dice2 = Math.floor(Math.random() * 20) + 1;
        return Math.max(dice1, dice2) + this.initiativeBonus;
    }
    return dice1 + this.initiativeBonus;
}

module.exports = initiativeParticipantSchema;