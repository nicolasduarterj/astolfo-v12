const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('editarchar')
                            .setDescription('Edita um stat do seu personagem atual')
                            .addStringOption(option =>
                                option
                                    .setName('stat')
                                    .setDescription('Stat a ser mudado')
                                    .setRequired(true)
                                    .addChoices(
                                        { name: 'Nome', value: 'name' },
                                        { name: 'HP base', value: 'baseHP' },
                                        { name: 'Bônus de iniciativa', value: 'initiativeBonus' },
                                        { name: 'Vantagem na iniciativa (S/N)', value: 'initiativeAdvantage' }))
                            .addStringOption(option =>
                                option
                                    .setName('novo_valor')
                                    .setDescription('Novo valor para o stat')
                                    .setRequired(true));

async function execute(interaction) {
    await interaction.reply('Processando...');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    if (!currentChar) {
        await interaction.editReply('``diff\n- Você não está jogando como um personagem. Use /jogarcomo\n```diff');
        return;
    }
    
    const stat = interaction.options.getString('stat');
    let novoValor = interaction.options.getString('novo_valor');
    if (stat === 'initiativeAdvantage')
        novoValor = novoValor.toLowerCase() === 's';
    
    currentChar[stat] = novoValor;
    try {
        await currentChar.save();
        await interaction.editReply('```fix\n' + `Valor do stat do personagem ${currentChar.name} alterado.\n` + '```' );
    } catch (error) {
        await interaction.editReply('```diff\n- ' + error.message + '\n```');
    }
    return;
}

module.exports = {
    data: commandData,
    execute: execute
};