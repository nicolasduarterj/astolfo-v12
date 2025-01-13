const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/playerCharacter');
const mongoose = require('mongoose');

const commandData = new SlashCommandBuilder()
                            .setName('jogarcomo')
                            .setDescription('Começa a jogar como um certo personagem')
                            .addStringOption(option => 
                                option.setName('char')
                                      .setDescription('Personagem desejado')
                                      .setAutocomplete(true)
                                      .setRequired(true));

async function autocomplete(interaction) {
    const playerChars = await PlayerCharacter.find({ ownerUUID: interaction.user.id });
    const focusedValue = interaction.options.getFocused();
    const filteredPlayerChars = playerChars.filter(char => char.name.startsWith(focusedValue)).map(char => char.name);
    await interaction.respond(filteredPlayerChars.map(name => ({ name, value: name })))
}

async function execute(interaction) {
    await interaction.reply({ content: 'Processando...', ephemeral: true });
    const desiredCharName = interaction.options.getString('char');
    console.log(desiredCharName);
    const desiredChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, name: desiredCharName })
    if (!desiredChar) {
        await interaction.editReply('```diff\n- Não achei esse personagem.\n```');
        return;
    }
    const mongooseSession = await mongoose.startSession();
    mongooseSession.startTransaction();
    try {
        await PlayerCharacter.updateOne({ ownerUUID: interaction.user.id, worn: true}, { worn: false });
        desiredChar.worn = true;
        await desiredChar.save();
        await mongooseSession.commitTransaction();
    } catch (error) {
        console.log(error);
        await interaction.editReply('```diff\n- Houve um erro inesperado.\n```');
        await mongooseSession.abortTransaction();
    } finally {
        await mongooseSession.endSession();
    }
    await interaction.editReply('```fix\nVocê agora está jogando como ' + desiredChar.name + '.\n```');
    return;
}

module.exports = {
    data: commandData,
    autocomplete: autocomplete,
    execute: execute
};