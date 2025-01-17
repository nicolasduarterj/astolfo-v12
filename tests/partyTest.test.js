const mongoose = require('mongoose');
const PlayerCharacter = require('../models/main/playerCharacter');
const { beforeAll, describe, expect, test, afterEach, afterAll } = require('@jest/globals');
const dotenv = require('dotenv')
dotenv.config();
const FakeInteraction = require('./testUtils/fakeInteraction');
const partyUtils = require('./testUtils/partyUtils');
const entrarParty = require('../commands/Party/entrarParty');
const sairParty = require('../commands/Party/sairParty');
const iniciativa = require('../commands/Party/iniciativa');


beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    await PlayerCharacter.deleteMany({});
});

afterEach(async () => {
    await PlayerCharacter.deleteMany({});
})

describe('Entering and leaving a party', () => {
    test('Entering a party works', async () => {
        await PlayerCharacter.create({
            name: 'Raz-alki',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: true,
            ownerUUID: '111',
            partyID: null,
            worn: true,
        });

        const interaction = new FakeInteraction([{ name: 'dm', value: { id: '222', username: 'teste' }}], '111');
        await entrarParty.execute(interaction);
        const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
        expect(endChar.partyID).toBe('222');
        expect(interaction.results[interaction.results.length - 1]).toMatch(/entrou na party de teste/);
    })

    test('Cannot enter a party without a worn character', async () => {
        await PlayerCharacter.create({
            name: 'Raz-alki',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: true,
            ownerUUID: '111',
            partyID: null,
            worn: false,
        });

        const interaction = new FakeInteraction([{ name: 'dm', value: { id: '222', username: 'teste' }}], '111');
        await entrarParty.execute(interaction);
        const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
        expect(endChar.partyID).toBeNull();
        expect(interaction.results[interaction.results.length - 1]).toMatch(/Use o comando \/jogarcomo/);
    })

    test('Exiting a party works', async () => {
        await PlayerCharacter.create({
            name: 'Raz-alki',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: true,
            ownerUUID: '111',
            partyID: '222',
            worn: true,
        });

        const interaction = new FakeInteraction([], '111');
        await sairParty.execute(interaction);
        const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
        expect(endChar.partyID).toBeNull();
        expect(interaction.results[interaction.results.length - 1]).toMatch(/saiu da party/);
    })

    test('Cannot exit a party without wearing a character', async () => {
        await PlayerCharacter.create({
            name: 'Raz-alki',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: true,
            ownerUUID: '111',
            partyID: '222',
            worn: false,
        });

        const interaction = new FakeInteraction([], '111');
        await sairParty.execute(interaction);
        const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
        expect(endChar.partyID).toBe('222');
        expect(interaction.results[interaction.results.length - 1]).toMatch(/use \/jogarcomo/);
    })
})

describe('Rolling initiative', () => {
    test('Rolling init. with a worn character rolls for the char\'s party', async () => {
        await partyUtils.registerBaseParty(); //razalki, ilia, sinep.ownerUUID = '222' & partyID = '333'
        await PlayerCharacter.create({
            name: 'VAAR',
            ownerUUID: '111',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: false,
            partyID: '333',
            worn: true
        });
        const interaction = new FakeInteraction([], '111');
        await iniciativa.execute(interaction);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/party do personagem/);
    })

    test('Rolling init. without a worn character rolls for the player\'s party', async () => {
        await partyUtils.registerBaseParty();
        const interaction = new FakeInteraction([], '333');
        await iniciativa.execute(interaction);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/party do user/);
    })
})

afterAll(async () => {
    await mongoose.connection.close();
})