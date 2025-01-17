const mongoose = require('mongoose');

const diceSchema = mongoose.Schema({
    diceType: {
        type: mongoose.SchemaTypes.Number,
        required: [true, 'Todos os dados devem ter um tipo']
    },
    diceNumber: {
        type: mongoose.SchemaTypes.Number,
        required: [true, 'Todos os dados devem ter um número.']
    },
    bonus: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    }
})

diceSchema.methods.roll = function() {
    const results = [];
    for (let i = 0; i < this.diceNumber; i++) {
        results.push(Math.floor(Math.random() * this.diceType + 1));
    }
    const sum = results.reduce((acc, next) => acc + next);
    return {
        results,
        sum,
        sumWithBonus: sum + this.bonus,
        diceString: `${this.diceNumber}d${this.diceType}+${this.bonus}`
    };
}

module.exports = diceSchema;
