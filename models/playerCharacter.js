const mongoose = require('mongoose');
const spellsInfoSchema = require('./spellsInfo');
const Xregexp = require('xregexp');

const PlayerCharacterSchema = mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
        minLength: 1,
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
    baseHP: {
        type: mongoose.SchemaTypes.Number,
        cast: 'O HP base deve ser um número',
        required: [true, 'Está faltando o HP base'],
        min: [1, 'HP base não pode ser menor que 1'],
    },
    hp: {
        type: mongoose.SchemaTypes.Number,
        cast: 'O HP deve ser um número',
        required: [true, 'Está faltando o hp'],
    },
    initiativeBonus: {
        cast: 'O bônus de iniciativa deve ser um número',
        type: mongoose.SchemaTypes.Number,
        default: 0,
    },
    initiativeAdvantage: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
    partyID: {
        type: mongoose.SchemaTypes.String,
        default: null,
    },
    worn: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
    spellsInfo: {
        type: spellsInfoSchema,
        default: null,        
    },
});

PlayerCharacterSchema.index({ name: 1, ownerUUID: 1}, { unique: true });

/**
 * 
 * @param {Number} damage 
 * @returns {Number} current hp
 */
PlayerCharacterSchema.methods.damage = function(damage) {
    this.hp = Math.max(0, this.hp - damage);
    return this.hp;
}

const PlayerCharacter = mongoose.model('PlayerCharacter', PlayerCharacterSchema);
module.exports= PlayerCharacter;