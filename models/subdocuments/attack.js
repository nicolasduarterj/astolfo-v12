const mongoose = require('mongoose');
const rollableActionSchema = require('../base/rollableAction');
const Xregexp = require('xregexp');

const attackSchema = mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: [true, 'O ataque precisa de um nome.'],
        validate: {
            validator: function(text) {
                const nameregex = Xregexp("^[\\pL\\pM][\\pL\\pM -]*$", 'u');
                return Xregexp.test(text, nameregex);
            },
            message: 'Nome inválido'
        }
    },
});

attackSchema.add(rollableActionSchema);
module.exports = attackSchema;