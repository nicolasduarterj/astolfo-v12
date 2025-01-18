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
const addInimigo = require('../commands/Party/addInimigo');
const excluirInimigo = require('../commands/Party/excluirInimigo');
const Enemy = require('../models/main/inimigo');
const statusParty = require('../commands/Party/statusParty');


beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    await PlayerCharacter.deleteMany({});
    await Enemy.deleteMany({});
});

afterEach(async () => {
    await PlayerCharacter.deleteMany({});
    await Enemy.deleteMany({});
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

describe('Adding and deleting enemies', () => {
    test('Adding an enemy works', async () => {
        const interaction = new FakeInteraction([], '111');
        interaction.setModalResponses([
            { id: 'name', value: 'Orc' },
            { id: 'initiativeBonus', value: 2 },
            { id: 'initiativeAdvantage', value: 'S' }
        ]);

        await addInimigo.execute(interaction);
        const endEnemy = await Enemy.findOne({ ownerUUID: '111', name: 'Orc' });
        expect(endEnemy).not.toBeNull();
        expect(endEnemy.initiativeAdvantage).toBe(true);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/foi criado/);
    })

    test('Cannot add an enemy with an invalid name', async () => {
        const interaction = new FakeInteraction([], '111');
        interaction.setModalResponses([
            { id: 'name', value: '      Orc' },
            { id: 'initiativeBonus', value: 2 },
            { id: 'initiativeAdvantage', value: 'S' }
        ]);

        await addInimigo.execute(interaction);
        const endEnemy = await Enemy.findOne({ ownerUUID: '111', name: '      Orc' });
        expect(endEnemy).toBeNull();
        expect(interaction.results[interaction.results.length - 1]).toMatch(/validation failed/);
    })

    test('Cannot add an enemy with a NaN initiativeBonus', async () => {
        const interaction = new FakeInteraction([], '111');
        interaction.setModalResponses([
            { id: 'name', value: 'Orc' },
            { id: 'initiativeBonus', value: 'aidawdad' },
            { id: 'initiativeAdvantage', value: 'S' }
        ]);

        await addInimigo.execute(interaction);
        const endEnemy = await Enemy.findOne({ ownerUUID: '111', name: 'Orc' });
        expect(endEnemy).toBeNull();
        expect(interaction.results[interaction.results.length - 1]).toMatch(/validation failed/);
    })

    test('Deleting an enemy works', async () => {
        await Enemy.create({
            name: 'Orc',
            ownerUUID: '111',
            initiativeBonus: 2,
            initiativeAdvantage: false
        });

        const interaction = new FakeInteraction([{ name: 'name', value: 'Orc' }], '111');
        await excluirInimigo.execute(interaction);
        const endEnemy = await Enemy.findOne({ ownerUUID: '111', name: 'Orc' });
        expect(endEnemy).toBeNull();
        expect(interaction.results[interaction.results.length - 1]).toMatch(/deletado/);
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

    test('Rolling init. returns the rolls in decreasing order', async () => {
        await partyUtils.registerBaseParty();
        const interaction = new FakeInteraction([], '333');
        await iniciativa.execute(interaction);
        const result = interaction.results[interaction.results.length - 1];
        const rollLines = result.split('\n').filter(line => /.+: \d+/.test(line));
        const rolls = rollLines.map(line => line.match(/.+: (?<roll>\d+)/).groups.roll).map(roll => Number(roll));
        const biggestRoll = rolls.reduce((biggest, next) => biggest > next ? biggest : next, rolls[0]);
        expect(biggestRoll).toBe(rolls[0]);
    })

    test('Rolling init. with an enemy works', async () => {
        await partyUtils.registerBaseParty();
        await Enemy.create({
            name: 'Orc',
            ownerUUID: '333',
            initiatveBonus: 2,
            initiativeAdvantage: false,
        });

        const interaction = new FakeInteraction([], '333');
        await iniciativa.execute(interaction);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/Orc: \d+/);
    })

    test('Rolling init. with an enemy returns the rolls in decreasing order', async () => {
        await Enemy.create({
            name: 'Orc',
            ownerUUID: '333',
            initiatveBonus: 2,
            initiativeAdvantage: false,
        });
        await partyUtils.registerBaseParty();
        const interaction = new FakeInteraction([], '333');
        await iniciativa.execute(interaction);
        const result = interaction.results[interaction.results.length - 1];
        const rollLines = result.split('\n').filter(line => /.+: \d+/.test(line));
        const rolls = rollLines.map(line => line.match(/.+: (?<roll>\d+)/).groups.roll).map(roll => Number(roll));
        const biggestRoll = rolls.reduce((biggest, next) => biggest > next ? biggest : next, rolls[0]);
        expect(biggestRoll).toBe(rolls[0]);
    })
})

describe('Status commands', () => {
    test('Party status with a worn character returns the worn character\'s party status', async () => {
        const [razalki, ilia, sinep] = await partyUtils.registerBaseParty();
        const newChar = await PlayerCharacter.create({
            name: 'VAAR',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: false,
            ownerUUID: '111',
            partyID: '333',
            worn: true
        });

        const interaction = new FakeInteraction([], '111');
        await statusParty.execute(interaction);
        const response = interaction.results[interaction.results.length - 1];
        const statuses = response.match(/^(.+: \d+)$/mg)
            .map(statusString => statusString.match(/(?<name>.+): (?<hp>\d+)/).groups);
        const iliaStatusObj = statuses.find(statusObj => statusObj.name === ilia.name);
        const razalkiStatusObj = statuses.find(statusObj => statusObj.name === razalki.name);
        const sinepStatusObj = statuses.find(statusObj => statusObj.name === sinep.name);
        const newCharStatusObj = statuses.find(statusObj => statusObj.name === newChar.name);

        expect(Number(iliaStatusObj.hp)).toBe(ilia.hp);
        expect(Number(razalkiStatusObj.hp)).toBe(razalki.hp);
        expect(Number(sinepStatusObj.hp)).toBe(sinep.hp);
        expect(Number(newCharStatusObj.hp)).toBe(newChar.hp);
    })

    test('Party status without a worn character returns the player\'s party status', async () => {
        const [razalki, ilia, sinep] = await partyUtils.registerBaseParty();
        const interaction = new FakeInteraction([], '333');
        await statusParty.execute(interaction);
        const response = interaction.results[interaction.results.length - 1];
        const statuses = response.match(/^(.+: \d+)$/mg)
            .map(statusString => statusString.match(/(?<name>.+): (?<hp>\d+)/).groups);
        const iliaStatusObj = statuses.find(statusObj => statusObj.name === ilia.name);
        const razalkiStatusObj = statuses.find(statusObj => statusObj.name === razalki.name);
        const sinepStatusObj = statuses.find(statusObj => statusObj.name === sinep.name);

        expect(Number(iliaStatusObj.hp)).toBe(ilia.hp);
        expect(Number(razalkiStatusObj.hp)).toBe(razalki.hp);
        expect(Number(sinepStatusObj.hp)).toBe(sinep.hp);
    })

    test('Party status with a party-less worn character return\'s a player\'s party status', async () => {
        await partyUtils.registerBaseParty();
        await PlayerCharacter.create({
            name: 'VAAR',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: false,
            ownerUUID: '333',
            partyID: null,
            worn: true
        });

        const interaction = new FakeInteraction([], '333');
        await statusParty.execute(interaction);
        const response = interaction.results[interaction.results.length - 1];
        expect(response).toMatch(/party do user/m);
    })

    test('Party status with a party-less worn character and an empty player party returns an error message', async () => {
        await partyUtils.registerBaseParty();
        await PlayerCharacter.create({
            name: 'VAAR',
            baseHP: 12,
            hp: 12,
            initiativeBonus: 2,
            initiativeAdvantage: false,
            ownerUUID: '111',
            partyID: null,
            worn: true
        });

        const interaction = new FakeInteraction([], '111');
        await statusParty.execute(interaction);
        const response = interaction.results[interaction.results.length - 1];
        expect(response).toMatch(/Não consegui achar/m);
    })

    test('Party status without a worn character and an empty player party returns an error message', async () => {
        await partyUtils.registerBaseParty();
        const interaction = new FakeInteraction([], '111');
        await statusParty.execute(interaction);
        const response = interaction.results[interaction.results.length - 1];
        expect(response).toMatch(/Não consegui achar/m);
    })

})

afterAll(async () => {
    await mongoose.connection.close();
})