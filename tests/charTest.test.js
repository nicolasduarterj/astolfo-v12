const mongoose = require('mongoose');
const PlayerCharacter = require('../models/main/playerCharacter');
const { beforeAll, expect, test, afterEach, afterAll } = require('@jest/globals');
const dotenv = require('dotenv')
dotenv.config();
const FakeInteraction = require('./testUtils/fakeInteraction');
const createChar = require('../commands/Chars/criarChar');
const dano = require('../commands/Chars/dano');
const cura = require('../commands/Chars/cura');
const excluirChar = require('../commands/Chars/excluirChar');
const jogarcomo = require('../commands/Chars/jogarComo');

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

test('Causing damage works', async () => {
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

    const interaction = new FakeInteraction([{ name: 'dano', value: 2 }], '111');
    await dano.execute(interaction);
    const newChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/sofreu 2 de dano/);
    expect(newChar.hp).toBe(10);
})

test('A character\'s hp cannot drop below zero', async () => {
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

    const interaction = new FakeInteraction([{ name: 'dano', value: 11000 }], '111');
    await dano.execute(interaction);
    const newChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/ficou com 0 pontos de vida/);
    expect(newChar.hp).toBe(0);
})

test('Cannot cause damage without a worn character', async () => {
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

    const interaction = new FakeInteraction([{ name: 'dano', value: 2 }], '111');
    await dano.execute(interaction);
    const newChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/Use \/jogarcomo\./);
    expect(newChar.hp).toBe(12);
})

test('Healing works', async () => {
    await PlayerCharacter.create({
        name: 'Raz-alki',
        baseHP: 12,
        hp: 10,
        initiativeBonus: 2,
        initiativeAdvantage: true,
        ownerUUID: '111',
        partyID: null,
        worn: true,
    });

    const interaction = new FakeInteraction([{ name: 'cura', value: 2 }], '111');
    await cura.execute(interaction);
    const newChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/curou 2 pontos de vida/);
    expect(newChar.hp).toBe(12);
})

test('Cannot heal without a worn character', async () => {
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

    const interaction = new FakeInteraction([{ name: 'cura', value: 2 }], '111');
    await cura.execute(interaction);
    const newChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(interaction.results[interaction.results.length - 1]).toMatch(/Use \/jogarcomo\./);
    expect(newChar.hp).toBe(12);
})

test('Excluding a character works', async () => {
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

    const interaction = new FakeInteraction([{ name: 'char', value: 'Raz-alki' }], '111');
    await excluirChar.execute(interaction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki'});
    expect(endChar).toBe(null);
    expect(interaction.results[interaction.results.length - 1]).toMatch(/Personagem deletado/);
});

test('Wearing a character works', async () => {
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

    const interaction = new FakeInteraction([{ name: 'char', value: 'Raz-alki' }], '111');
    await jogarcomo.execute(interaction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(endChar.worn).toBe(true);
    expect(interaction.results[interaction.results.length - 1]).toMatch(/agora está jogando como/);
})

test('Wearing the same character twice works', async () => {
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

    const interaction = new FakeInteraction([{ name: 'char', value: 'Raz-alki' }], '111');
    await jogarcomo.execute(interaction);
    const secondInteraction = new FakeInteraction([{ name: 'char', value: 'Raz-alki' }], '111');
    await jogarcomo.execute(secondInteraction);
    const endChar = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    expect(endChar.worn).toBe(true);
    expect(secondInteraction.results[secondInteraction.results.length - 1]).toMatch(/já está jogando como/);

})

test('Swapping between characters works', async () => {
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

    await PlayerCharacter.create({
        name: 'Ilia',
        baseHP: 12,
        hp: 12,
        initiativeBonus: 2,
        initiativeAdvantage: true,
        ownerUUID: '111',
        partyID: null,
        worn: false,
    });
    const interaction = new FakeInteraction([{ name: 'char', value: 'Raz-alki' }], '111');
    const secondInteraction = new FakeInteraction([{ name: 'char', value: 'Ilia' }], '111');

    await jogarcomo.execute(interaction);
    await jogarcomo.execute(secondInteraction);
    const endCharRaz = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
    const endCharIlia = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Ilia' });
    expect(endCharRaz.worn).toBe(false);
    expect(endCharIlia.worn).toBe(true);
})

afterAll(async () => {
    await mongoose.connection.close();
})