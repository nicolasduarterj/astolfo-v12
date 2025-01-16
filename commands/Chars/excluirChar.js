const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('excluirchar')
                            .setDescription('Exclui um personagem')
                            .addStringOption(option =>
                                option
                                    .setName('char')
                                    .setDescription('Personagem a ser excluído')
                                    .setRequired(true)
                                    .setAutocomplete(true));
                
async function autocomplete(interaction) {
    const chars = await PlayerCharacter.find({ ownerUUID: interaction.user.id });
    await interaction.respond(chars.map(char => ({ name: char.name, value: char.name })));
}

async function execute(interaction) {
    await interaction.reply({ content: 'Processando...', ephemeral: true });
    const charName = interaction.options.getString('char');
    try {
        await PlayerCharacter.findOneAndDelete({ ownerUUID: interaction.user.id, name: charName });
        await interaction.editReply('```fix\nPersonagem deletado.\n```');
    } catch (error) {
        console.log(error)
        await interaction.editReply('Houve um erro inesperado.');
    }
    return;
}

module.exports = {
    data: commandData,
    autocomplete: autocomplete,
    execute: execute
}