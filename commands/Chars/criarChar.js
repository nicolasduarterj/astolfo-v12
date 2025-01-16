const { SlashCommandBuilder } = require('discord.js');
const modalBuilder = require('../../misc/modalBuilder');
const PlayerCharacter = require('../../models/main/playerCharacter');
const modalRetrieve = require('../../misc/modalRetrieve');

const commandData = new SlashCommandBuilder()
    .setName('novochar')
    .setDescription('Cria um novo personagem vinculado à sua conta');

async function execute(interaction) {
    const modalInputs = [
        { id: 'name', label: 'Nome'},
        { id: 'baseHP', label: 'HP base' },
        { id: 'initiative', label: 'Bônus de iniciativa'},
        { id: 'initiativeAdvantage', label: 'Possui vantagem na iniciativa (S/N)' }
    ];
    const modal = modalBuilder(`pcmodal${interaction.user.id}`, 'Novo personagem', modalInputs);
    await interaction.showModal(modal);


    const filter = (newInteraction) => newInteraction.customId === `pcmodal${interaction.user.id}`;
    const modalResponse = await interaction.awaitModalSubmit({ filter, time: 9000_00 });
    //---------------[MODAL HANDLING]-----------------------------------------------------------------//
    await modalResponse.reply('Processando...');
    let responses = modalRetrieve(modalResponse, modalInputs.map(input => input.id));
    const PlayerChar = new PlayerCharacter({
        name: responses.name,
        baseHP: responses.baseHP,
        hp: responses.baseHP,
        initiativeBonus: Number(responses.initiative),
        initiativeAdvantage: responses.initiativeAdvantage.toLowerCase() === 's',
        ownerUUID: interaction.user.id
    });

    try {
        await PlayerChar.save();
        await modalResponse.editReply('Cadastrado!');
    } catch (error) {
        if (error.message.startsWith('PlayerCharacter validation failed:')) {
            const message = '```diff\n ' + error.message + '\n```';
            await modalResponse.editReply(message);
        }
        else if (error.message.startsWith('E11000')) {
            await modalResponse.editReply('```diff\n-Já existe um personagem seu com esse nome.\n```');
        }
        else {
            await modalResponse.editReply('```diff\n-Ocorreu um erro inesperado.\n```');
            console.log(error.message);
        }
    }
    return;
}

module.exports = {
    data: commandData,
    execute: execute
};