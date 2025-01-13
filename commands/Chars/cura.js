const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('cura')
                            .setDescription('Recupera o hp do personagem que você está usando')
                            .addNumberOption(option => 
                                option
                                    .setName('cura')
                                    .setDescription('Pontos de vida a serem curados')
                                    .setRequired(true)
                                    .setMinValue(1));

async function execute(interaction) {
    await interaction.reply('Processando...');
    const healPoints = interaction.options.getNumber('cura');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true })
    if (!currentChar) {
        await interaction.editReply('```diff\n- Você não está jogando como um personagem. Use /jogarcomo.\n```');
        return;
    }
    currentChar.heal(healPoints);
    try {
        await currentChar.save();
        await interaction.editReply('```elm\n' + `${currentChar.name} curou ${healPoints} pontos de vida e ficou com ${currentChar.hp} pontos de vida\n` + '```');
    } catch(error) {
        console.log(error);
        await interaction.editReply('```diff\n- Houve um erro inesperado\n```');
    }
    return;
}

module.exports = {
    data: commandData,
    execute: execute
}