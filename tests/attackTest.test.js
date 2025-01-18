const mongoose = require('mongoose');
const { beforeAll, describe, expect, afterEach, test, afterAll } = require('@jest/globals');
const dotenv = require('dotenv')
const PlayerCharacter = require('../models/main/playerCharacter')
const addAttack = require('../commands/Attacks/addAttack');
const FakeInteraction = require('./testUtils/fakeInteraction');
dotenv.config();

beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    await PlayerCharacter.deleteMany({});
})

afterEach(async () => {
    await PlayerCharacter.deleteMany({});
})

describe('Adding attacks', () => {
    test('Adding attacks works', async () => {
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

        const interaction = new FakeInteraction([{ name: 'name', value: 'Punch' }, { name: 'dice', value: '2d4' }], '111');
        await addAttack.execute(interaction);
        const Razalki = await PlayerCharacter.findOne({ ownerUUID: '111', name: 'Raz-alki' });
        expect(Razalki.attacks[0]).toMatchObject({
            dice: [{
                diceNumber: 2,
                diceType: 4,
                bonus: 0
            }],
            flags: {
                separate: false,
                heal: false
            }
        })
        expect(interaction.results[interaction.results.length - 1]).toMatch(/aprendeu/);
    })

    test('Cannot add an attack without a worn character', async () => {
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

        const interaction = new FakeInteraction([{ name: 'name', value: 'Punch' }, { name: 'dice', value: '2d4' }], '111');
        await addAttack.execute(interaction);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/\/jogarcomo/);
    })

    test('Cannot add an attack with an invalid name', async () => {
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

        const interaction = new FakeInteraction([{ name: 'name', value: '~~   wd~ ~$12' }, { name: 'dice', value: '2d4' }], '111');
        await addAttack.execute(interaction);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/inválido/);
    })

    test('Cannot add two attacks with the same name', async () => {
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

        const interaction = new FakeInteraction([{ name: 'name', value: 'Punch' }, { name: 'dice', value: '2d4' }], '111');
        await addAttack.execute(interaction);
        const secondInteraction = new FakeInteraction([{ name: 'name', value: 'Punch' }, { name: 'dice', value: '2d4' }], '111');
        await addAttack.execute(secondInteraction);
        expect(secondInteraction.results[secondInteraction.results.length - 1]).toMatch(/já tem um ataque com esse nome/);
    })

    test('Cannot add an attack with invalid diceCode', async () => {
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

        const interaction = new FakeInteraction([{ name: 'name', value: 'Punch' }, { name: 'dice', value: '2d4,,2d8' }], '111');
        await addAttack.execute(interaction);
        expect(interaction.results[interaction.results.length - 1]).toMatch(/validation failed/);
    })
})

afterAll(async () => {
    await mongoose.connection.close();
})