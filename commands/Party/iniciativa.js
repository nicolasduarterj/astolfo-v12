const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/playerCharacter');
const date = require('date-and-time')

const commandData = new SlashCommandBuilder()
                            .setName('iniciativa')
                            .setDescription('Roda a iniciativa da party do seu personagem atual, ou da sua party caso esta não exista');

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

    const rollings = party.map(char => ({ name: char.name, roll: char.rollInitiative() })).toSorted((rollA, rollB) => rollB.roll - rollA.roll);
    
    let message = rollings.reduce(
        (acc, char) => acc + `${char.name}: ${char.roll}\n`,
        '```elm\nIniciativa' + ` (${rollDateString}, tipo: party do ${type})\n\n`);
    message += '```';
    await interaction.editReply(message);
    return;
}

module.exports = {
    data: commandData,
    execute: execute
};