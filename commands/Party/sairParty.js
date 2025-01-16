const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('sairparty')
                            .setDescription('Remove o seu personagem atual da sua party');

async function execute(interaction) {
    await interaction.reply('Processando...');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    if (!currentChar) {
        await interaction.editReply('```diff\n-Você não está jogando com um personagem, use /jogarcomo```');
        return;
    }
    currentChar.partyID = null;
    try {
        await currentChar.save();
        await interaction.editReply('```fix\n' + `${currentChar.name} saiu da party!` + '\n```');
    } catch (error) {
        console.log(error);
        await interaction.editReply('```diff\n- Houve um erro inesperado\n```');
    }
}

module.exports = {
    data: commandData,
    execute: execute
};