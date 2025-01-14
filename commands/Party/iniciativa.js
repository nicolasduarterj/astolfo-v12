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
        await interaction.editReply('```\nNão consegui achar nenhum player na party. Verifique:\n\n1)Você não está jogando como um personagem, use /jogarcomo\n2)Seu personagem atual não está em uma party.\n3)Sua party não tem nenhum jogador.\n```');
        return;
    }

    const rollings = party
        .map(char => {
            const dice1 = Math.floor(Math.random() * 20) + 1;
            let finaldice = dice1;
            if (char.initiativeAdvantage) {
                const dice2 = Math.floor(Math.random() * 20) + 1;
                finaldice = Math.max(dice1, dice2);
            }
            return { name: char.name, roll: finaldice + char.initiativeBonus };
        })
        .toSorted((rollA, rollB) => rollB.roll - rollA.roll);
    let message = rollings.reduce(
        (acc, char) => acc + `${char.name}: ${char.roll}\n`,
        '```elm\nIniciativa' + ` (${rollDateString}, tipo: party do ${type})\n\n`
    );
    message += '```';
    await interaction.editReply(message);
    return;
}

module.exports = {
    data: commandData,
    execute: execute
};