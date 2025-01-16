const mongoose = require('mongoose');
const PlayerCharacter = require('../models/main/playerCharacter');
const { beforeAll, expect, test, afterEach, afterAll } = require('@jest/globals');
const dotenv = require('dotenv')
dotenv.config();
const FakeInteraction = require('./testUtils/fakeInteraction');
const createChar = require('../commands/Chars/criarChar');

beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    await PlayerCharacter.deleteMany({});
});

afterEach(async () => {
    await PlayerCharacter.deleteMany({});
})

test('Create a character works', async () => {
    const interaction = new FakeInteraction([], '111');
    interaction.setModalResponses([
        { id: 'name', value: 'Raz-alki' },
        { id: 'baseHP', value: '12'},
        { id: 'initiative', value: '2'},
        { id: 'initiativeAdvantage', value: 'n' }
    ]);
    await createChar.execute(interaction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toBe('Cadastrado!');
    expect(endChar).not.toBeNull();
    expect(endChar).toMatchObject({
        name: 'Raz-alki',
        ownerUUID: '111',
        baseHP: 12,
        hp: 12,
        partyID: null,
        initiativeBonus: 2,
        initiativeAdvantage: false
    });
});

test('Cannot create a character with an invalid name', async () => {
    const interaction = new FakeInteraction([], '111');
    interaction.setModalResponses([
        { id: 'name', value: '   12Raz-alki' },
        { id: 'baseHP', value: '12'},
        { id: 'initiative', value: '2'},
        { id: 'initiativeAdvantage', value: 'n' }
    ]);
    await createChar.execute(interaction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: '   12Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/validation failed/);
    expect(endChar).toBeNull();
})

test('Cannot create a character with a NaN baseHP', async () => {
    const interaction = new FakeInteraction([], '111');
    interaction.setModalResponses([
        { id: 'name', value: 'Raz-alki' },
        { id: 'baseHP', value: 'testeteste'},
        { id: 'initiative', value: '2'},
        { id: 'initiativeAdvantage', value: 'n' }
    ]);
    await createChar.execute(interaction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: '   12Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/validation failed/);
    expect(endChar).toBeNull();
})

test('Cannot create a character with a NaN initiativeBonus', async () => {
    const interaction = new FakeInteraction([], '111');
    interaction.setModalResponses([
        { id: 'name', value: 'Raz-alki' },
        { id: 'baseHP', value: '12'},
        { id: 'initiative', value: 'testeteste'},
        { id: 'initiativeAdvantage', value: 'n' }
    ]);
    await createChar.execute(interaction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: '   12Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/validation failed/);
    expect(endChar).toBeNull();
})

afterAll(async () => {
    await mongoose.connection.close();
})