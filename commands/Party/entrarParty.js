const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('entrarparty')
                            .setDescription('Insere seu personagem atual na party de um usuário')
                            .addUserOption(option =>
                                option
                                    .setName('dm')
                                    .setDescription('Dungeon Master da party')
                                    .setRequired(true));

async function execute(interaction) {
    await interaction.reply('Processando...');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    if (!currentChar) {
        await interaction.editReply('```diff\nVocê não está usando um personagem. Use o comando /jogarcomo primeiro\n```');
        return;
    }
    const dm = interaction.options.getUser('dm');
    try {
        currentChar.partyID = dm.id;
        await currentChar.save();
        await interaction.editReply('```fix\n' + `${currentChar.name} entrou na party de ${dm.username}\n` + '```')
    } catch (error) {
        console.log(error);
        await interaction.editReply('Houve um erro inesperado.');
    }
    return;
}

module.exports = {
    data: commandData,
    execute: execute
}