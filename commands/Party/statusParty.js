const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');
const date = require('date-and-time');

const commandData = new SlashCommandBuilder()
                            .setName('statusparty')
                            .setDescription('Exibe o status da party do seu personagem atual, ou da sua party caso aquela não exista');

async function execute(interaction) {
    await interaction.reply('Processando...');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    const partyID = currentChar?.partyID || interaction.user.id;
    const type = currentChar?.partyID ? 'personagem' : 'user';
    const party = await PlayerCharacter.find({ partyID: partyID });
    const rollDate = new Date();
    const rollDateString = date.format(rollDate, 'DD/MM HH:mm');
    if (!party || party.length === 0) {
        await interaction.editReply('```\nNão consegui achar nenhum player na party. Verifique:\n\n' +
            '1)Você não está jogando como um personagem, use /jogarcomo\n' +
            '2)Seu personagem atual não está em uma party.\n' +
            '3)Sua party não tem nenhum jogador.\n```');
        return;
    }

    const hpString = party.map(char => `${char.name}: ${char.hp}`).join('\n');
    const response = '```elm\n' + `Status da party do ${type} (${rollDateString})\n\n` + hpString + '\n```';
    await interaction.editReply(response);
}

module.exports = {
    data: commandData,
    execute: execute
};