const mongoose = require('mongoose');
const rollableActionSchema = require('../base/rollableAction');

const basicActionSchema = mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: [true, 'A ação precisa de um nome']
    }
});

basicActionSchema.add(rollableActionSchema);

const BasicAction = mongoose.model('BasicAction', basicActionSchema);
module.exports = BasicAction;
