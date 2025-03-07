# Astolfo: a discord bot for Dungeons & Dragons

Astolfo is designed to make playing DnD over Discord, providing:
- Player Character management
- Initiative and turn management
- Attack and roll management

## Setup

1. Clone this repository.
2. Run npm install.
3. Setup a .env file with the following env vars:
    1. "BOT_TOKEN": discord bot token
    2. "CLIENT_ID": rest client ID for registering the commands
    3. "TEST_SERVER_ID": ID of the discord server where the commands shall be registered
    4. "MONGODB_URI": URI of your MongoDB instance
    5. "TEST_DB_URI": URI of your test MongoDB instance
4. Run node index.js

