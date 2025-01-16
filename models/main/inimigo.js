const mongoose = require('mongoose');
const Xregexp = require('xregexp');
const initiativeParticipantSchema = require('../base/initiativeParticipant');

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
    ownerUUID: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
});

enemySchema.add(initiativeParticipantSchema);

enemySchema.index({ name: 1, ownerUUID: 1}, { unique: true });

const Enemy = mongoose.model('Enemy', enemySchema);
module.exports = Enemy;