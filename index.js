const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');



//-----------------[Startup]---------------------------------------//
dotenv.config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[AVISO] Comando ${filePath} está incompleto`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Comando não encontrado! (${interaction.commandName})`);
        return;
    }
    if (interaction.isChatInputCommand()) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Erro processando seu comando' });
            } else {
                await interaction.reply({ content: 'Erro processando seu comando'});
            }
        }
    } else if (interaction.isAutocomplete()) {
        console.log('autocomplete')
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
})

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB')
});

client.login(process.env.BOT_TOKEN);
