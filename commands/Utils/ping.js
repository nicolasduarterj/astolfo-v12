//TEST COMMAND

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Pings!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    }
};