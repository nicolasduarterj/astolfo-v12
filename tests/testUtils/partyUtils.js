const PlayerCharacter = require('../../models/main/playerCharacter');

async function registerBaseParty() {
    const razalki = await PlayerCharacter.create({
        name: 'Raz-alki',
        ownerUUID: '222',
        baseHP: 12,
        hp: 12,
        initiativeBonus: 2,
        initiativeAdvantage: false,
        partyID: '333',
        worn: false
    });

    const ilia = await PlayerCharacter.create({
        name: 'Ilia',
        ownerUUID: '222',
        baseHP: 12,
        hp: 12,
        initiativeBonus: 2,
        initiativeAdvantage: false,
        partyID: '333',
        worn: false
    });

    const sinep = await PlayerCharacter.create({
        name: 'Sinep',
        ownerUUID: '222',
        baseHP: 12,
        hp: 12,
        initiativeBonus: 2,
        initiativeAdvantage: false,
        partyID: '333',
        worn: false
    });

    return [razalki, ilia, sinep];
}

module.exports = { registerBaseParty };