const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('dano')
                            .setDescription('Reduz o hp do personagem que você está usando')
                            .addNumberOption(option => 
                                option
                                    .setName('dano')
                                    .setDescription('Pontos de dano a ser causado')
                                    .setRequired(true)
                                    .setMinValue(1));

async function execute(interaction) {
    await interaction.reply('Processando...');
    const damagePoints = interaction.options.getNumber('dano');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true })
    if (!currentChar) {
        await interaction.editReply('```diff\n- Você não está jogando como um personagem. Use /jogarcomo.\n```');
        return;
    }
    currentChar.damage(damagePoints);
    try {
        await currentChar.save();
        await interaction.editReply('```elm\n' + `${currentChar.name} sofreu ${damagePoints} de dano e ficou com ${currentChar.hp} pontos de vida\n` + '```');
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