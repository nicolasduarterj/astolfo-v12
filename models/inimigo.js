const mongoose = require('mongoose');
const Xregexp = require('xregexp');

const enemySchema = mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: [true, 'O inimigo precisa de um nome'],
        validate: {
            validator: function(text) {
                const nameregex = Xregexp("^[\\pL\\pM][\\pL\\pM -]*$", 'u');
                return Xregexp.test(text, nameregex);
            },
            message: 'Nome inválido'
        }
    },
    initiativeBonus: {
        type: mongoose.SchemaTypes.Number,
        cast: 'O bônus de iniciativa deve ser um número',
        default: 0,
    },
    initiativeAdvantage: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    ownerUUID: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
});

enemySchema.index({ name: 1, ownerUUID: 1}, { unique: true });

const Enemy = mongoose.model('Enemy', enemySchema);
module.exports = Enemy;