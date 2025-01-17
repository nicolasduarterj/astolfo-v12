const { SlashCommandBuilder } = require('discord.js');
const PlayerCharacter = require('../../models/main/playerCharacter');

const commandData = new SlashCommandBuilder()
                            .setName('addataque')
                            .setDescription('Adiciona um ataque ao repertório do seu personagem atual')
                            .addStringOption(option =>
                                option
                                    .setName('name')
                                    .setDescription('Nome do ataque')
                                    .setRequired(true))
                            .addStringOption(option =>
                                option
                                    .setName('dice')
                                    .setDescription('Dados a serem rodados para o dano do ataque')
                                    .setRequired(true));

async function execute(interaction) {
    await interaction.reply('Processando...');
    const name = interaction.options.getString('name');
    const diceString = interaction.options.getString('dice');
    const currentChar = await PlayerCharacter.findOne({ ownerUUID: interaction.user.id, worn: true });
    if (!currentChar) {
        await interaction.editReply('```diff\n- Você não está jogando como um personagem, use /jogarcomo.\n```');
        return;
    }
    if(currentChar.attacks.find(attack => attack.name === name)) {
        await interaction.editReply('```diff\n- Você já tem um ataque com esse nome.\n```');
        return;
    }

    try {
        currentChar.attacks.push({ name });
        currentChar.attacks[currentChar.attacks.length - 1].initialize(diceString);
        await currentChar.save();
        await interaction.editReply('```fix\n' + `${currentChar.name} aprendeu ${name}` + '\n```');
    } catch (error) {
        if (/Nome inválido/i.test(error.message) || /validation/.test(error.message))
            await interaction.editReply('```diff\n- ' + error.message + '\n```');
        
        else 
            await interaction.editReply('```diff\n- Houve um erro inesperado.\n```');
    }
    return;
}

module.exports = {
    data: commandData,
    execute: execute
};