const { SlashCommandBuilder } = require('discord.js');
const modalBuilder = require('../../misc/modalBuilder');
const modalRetrieve = require('../../misc/modalRetrieve');
const Enemy = require('../../models/inimigo');

const commandData = new SlashCommandBuilder()
                            .setName('novoinimigo')
                            .setDescription('Cria um inimigo e o insere na iniciativa da sua party');

async function execute(interaction) {
    const modalInputs = [
        { id: 'name', label: 'Nome do inimigo' },
        { id: 'initiativeBonus', label: 'Bônus de iniciativa' },
        { id: 'initiativeAdvantage', label: 'Possui vantagem na iniciativa (S/N)' }
    ];
    const modal = modalBuilder(`enemy${interaction.user.id}`, 'Novo inimigo', modalInputs);
    await interaction.showModal(modal);

    const filter = (newInteraction) => newInteraction.customId === `enemy${interaction.user.id}`;
    const modalResponse = await interaction.awaitModalSubmit({ filter, time: 9000_00 });
    await modalResponse.reply('Processando...');
    const { name, initiativeBonus, initiativeAdvantage } = modalRetrieve(modalResponse, modalInputs.map(input => input.id));
    const newEnemy = new Enemy({
        name,
        initiativeBonus,
        initiativeAdvantage: initiativeAdvantage.toLowerCase() === 's',
        ownerUUID: interaction.user.id,
    });
    try {
        await newEnemy.save();
        await modalResponse.editReply('```fix\n' + `${newEnemy.name} foi criado.\n` + '```' );
    } catch (error) {
        console.log(error)
        if (error.message.startsWith('Enemy validation failed:')) {
            await modalResponse.editReply('```diff\n-' + error.message + '\n```');
        }
        else if (error.message.startsWith('E11000')) {
            await modalResponse.editReply('```diff\n- Já existe um inimigo seu com esse nome\n```');
        } else {
            await modalResponse.editReply('```diff\n- Ocorreu um erro inesperado.\n```');
        }
    }
}

module.exports = {
    data: commandData,
    execute: execute
}