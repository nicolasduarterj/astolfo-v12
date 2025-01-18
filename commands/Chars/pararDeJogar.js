const PlayerCharacter = require('../../models/main/playerCharacter');
const { SlashCommandBuilder } = require('discord.js');

const commandData = new SlashCommandBuilder()
                            .setName('parardejogar')
                            .setDescription('Para de jogar como o seu personagem atual');

async function execute(interaction) {
    await interaction.reply({ content: 'Processando...', ephemeral: true });
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    if (!currentChar) {
        await interaction.editReply('```fix\nVocê já não está jogando com um personagem\n```');
        return;
    }
    try {
        currentChar.worn = false;
        await currentChar.save();
        await interaction.editReply('```fix\nVocê parou de jogar como ' + currentChar.name + '.\n```');
    } catch (error) {
        console.log(error);
        await interaction.editReply('```diff\n- Houve um erro inesperado\n```');
    }
    return;
}

module.exports = {
    data: commandData,
    execute: execute
};
