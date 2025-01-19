const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');
const Enemy = require('../../models/main/inimigo');
const date = require('date-and-time');

const commandData = new SlashCommandBuilder()
                            .setName('statusplayer')
                            .setDescription('Mostra as estatísticas da sua conta no bot')

async function execute(interaction) {
    await interaction.reply({ content: 'Processando', ephemeral: true });
    const runDate = new Date();
    const runDateString = date.format(runDate, 'DD/MM HH:mm');
    let message = '```md\n> Estátisticas de ' + interaction.user.username + '\n';
    message += 'Lista de personagens:';
    const chars = await PlayerCharacter.find({ ownerUUID: interaction.user.id });
    for (const char of chars) {
        message += `\n[${char.name}]${char.worn ? '(atual)' : ''}:\n`;
        message += ` |------ HP: ${char.hp}\n`
        message += ` |------ HP base: ${char.baseHP}\n`
        message += ` |------ Bônus de iniciativa ${char.initiativeBonus}\n`
        message += ` |------ ${char.initiativeAdvantage ? 'Possui vantagem na iniciativa' : 'Não possui vantagem na iniciativa'}\n`
    }

    message += chars.length > 0 ? '\n' : '\tN/A\n\n';

    message += 'Lista de inimigos:'
    const enemies = await Enemy.find({ ownerUUID: interaction.user.id });
    for (const enemy of enemies) {
        message += `\n<${enemy.name}>:\n`;
        message += ` |------ Bônus de iniciativa: ${enemy.initiativeBonus}\n`
        message += ` |------ ${enemy.initiativeAdvantage ? 'Possui vantagem na iniciativa' : 'Não possui vantagem na iniciativa'}\n`
    }

    message += enemies.length > 0 ? '\n' : '\tN/A\n\n';

    message += `Comando executado em ${runDateString}` + '\n```';
    await interaction.editReply(message);
}

module.exports = {
    data: commandData,
    execute: execute,
};
