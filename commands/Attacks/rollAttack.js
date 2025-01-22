const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');
const DiceQueue = require('../../misc/diceQueue');


const commandData = new SlashCommandBuilder()
                            .setName('rolarataque')
                            .setDescription('Rola um d20 e, caso passe, rola o dano do ataque')
                            .addStringOption(option =>
                                option
                                    .setName('name')
                                    .setDescription('Nome do  ataque a ser rolado')
                                    .setRequired(true)
                                    .setAutocomplete(true))
                            .addNumberOption(option =>
                                option
                                    .setName('d20bonus')
                                    .setDescription('Bônus do d20 para descobrir se acertou o ataque')
                                    .setRequired(true)
                            )

async function autocomplete(interaction) {
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    const focusedValue = interaction.options.getFocused();
    const validAttacks = currentChar.attacks.map(attack => attack.name).filter(attackName => attackName.startsWith(focusedValue));
    await interaction.respond(validAttacks.map(attackName => ({ name: attackName, value: attackName })));
}

async function execute(interaction) {
    const response = await interaction.reply({ content: 'Processando...', withResponse: true });
    const desiredAttackName = interaction.options.getString('name');
    const d20Bonus = interaction.options.getNumber('d20bonus');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    const desiredAttack = currentChar?.attacks?.find(attack => attack.name === desiredAttackName);
    if (!currentChar || !desiredAttack) {
        await interaction.editReply('```diff\n- Não consegui achar essa ataque ou você não está jogando como um personagem. Use /jogarcomo');
        return;
    }

    await interaction.editReply('```fix\nRolando ataque ' + desiredAttack.name + '...\n```');
    const queue = new DiceQueue(desiredAttack.dice, desiredAttack.flags.separate);

    const resultsLog = [];
    while(!queue.isEmpty) {
        await response.resource.message.reactions.removeAll()
        const roll = queue.rollAndPop();
        const d20 = Math.floor(Math.random() * 20) + 1;
        const message = '```md\n' + `#Rolagem de d20 para causar ${roll.rolledDice} com ${desiredAttackName}\n\n` +
        `> Resultado: ${d20 + d20Bonus} (${d20}${d20Bonus >= 0 ? '+' : ''}${d20Bonus})\n\n` +
            `✅: Passou; ❌: Não passou\n` + '```';
        interaction.editReply(message);
        await response.resource.message.react('✅');
        await response.resource.message.react('❌');

        const collectionFilter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        }
        const collected = await response.resource.message.awaitReactions({ filter: collectionFilter, max: 1, time: 240_000, errors: ['time']})
        const reaction = collected.first();
        if (reaction.emoji.name !== '✅') {
            resultsLog.push(`[${roll.rolledDice}]: Errou`)
            await interaction.editReply('```elm\n' + `${currentChar.name} errou seu ataque!` + '\n\nContinuar:✅\n```');
            await response.resource.message.reactions.removeAll()
            await response.resource.message.react('✅');
            const secondCollectionFilter = (reaction, user) => {
                return ['✅'].includes(reaction.emoji.name) && user.id === interaction.user.id;
            }
            await response.resource.message.awaitReactions({ filter: secondCollectionFilter, max: 1, time: 240_000});
            continue;
        }

        resultsLog.push(`[${roll.rolledDice}]: ${roll.total}`);
        let reply = '```md\n> ' + `${currentChar.name} acertou o ataque ${desiredAttack.name}, rolando ${roll.rolledDice} de dano!\n\n`
        for (const individualRoll of roll.rolls) {
            reply += `[${individualRoll.diceString}]: ${individualRoll.sumWithBonus}` + 
            `([${individualRoll.results}]${individualRoll.bonus >= 0 ? '+' : ''}${individualRoll.bonus})\n`
        }
        reply += '\nContinuar: ✅```'
        await interaction.editReply(reply);
        await response.resource.message.reactions.removeAll()
        await response.resource.message.react('✅');
        const secondCollectionFilter = (reaction, user) => {
            return ['✅'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        }
        await response.resource.message.awaitReactions({ filter: secondCollectionFilter, max: 1, time: 240_000});
    }

    await response.resource.message.reactions.removeAll();
    await interaction.editReply('```md\n' + `#Resultado final do ataque ${desiredAttackName}, de ${currentChar.name}:\n\n` +
        resultsLog.join('\n') + '\n```');
    return;

}

module.exports = {
    data: commandData,
    autocomplete: autocomplete,
    execute: execute
};
