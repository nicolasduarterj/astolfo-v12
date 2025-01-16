const { SlashCommandBuilder } = require('discord.js');
const Enemy = require('../../models/main/inimigo');

const commandData = new SlashCommandBuilder()
                            .setName('excluirinimigo')
                            .setDescription('Exclui um inimigo')
                            .addStringOption(option =>
                                option
                                    .setName('name')
                                    .setDescription('Nome do inimigo a ser excluído')
                                    .setRequired(true)
                                    .setAutocomplete(true));

async function autocomplete(interaction) {
    const enemies = await Enemy.find({ ownerUUID: interaction.user.id });
    await interaction.respond(enemies.map(enemy => ({ name: enemy.name, value: enemy.name })));
}

async function execute(interaction) {
    await interaction.reply({ content: 'Processando...', ephemeral: true });
    const enemyName = interaction.options.getString('name');
    try {
        await Enemy.findOneAndDelete({ ownerUUID: interaction.user.id, name: enemyName });
        await interaction.editReply('```fix\nInimigo deletado\n```');
    } catch (error) {
        console.log(error);
        await interaction.editReply('```diff\n- Houve um erro inesperado\n```');
    }
    return;
}

module.exports = {
    data: commandData,
    autocomplete: autocomplete,
    execute: execute
};
