const mongoose = require('mongoose');
const { beforeAll, describe, expect, test, afterAll } = require('@jest/globals');
const dotenv = require('dotenv')
const BasicAction = require('../models/testing/basicAction');
dotenv.config();

beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
});

describe('Initialization of rollable actions', () => {
    test('Initialing an attack with a single dice works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20');
        expect(action.dice[0].diceType).toBe(20);
    });

    test('Initializing an attack with multiple dice works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20,3d4,2d12');
        expect(action.dice[0]).toMatchObject({
            diceType: 20,
            diceNumber: 2,
            bonus: 0
        });
        expect(action.dice[1]).toMatchObject({
            diceType: 4,
            diceNumber: 3,
            bonus: 0,
        });
        expect(action.dice[2]).toMatchObject({
            diceType: 12,
            diceNumber: 2,
            bonus: 0
        });
    });

    test('Setting the separate flag works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20/s');
        expect(action.flags.separate).toBe(true);
    });

    test('Setting the heal flag works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20/h');
        expect(action.flags.heal).toBe(true);
    });

    test('Setting both flags works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20/sh');
        expect(action.flags.heal).toBe(true);
        expect(action.flags.separate).toBe(true);
    });

    test('Bonus for a single dice works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20+2');
        expect(action.dice[0].bonus).toBe(2);
    });

    test('Bonus with many dice works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20+2,4d12+4');
        expect(action.dice[0].bonus).toBe(2);
        expect(action.dice[1].bonus).toBe(4);
    });

    test('Negative bonus works', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20-2');
        expect(action.dice[0].bonus).toBe(-2);
    });

    test('Full expressions work', async () => {
        const action = new BasicAction({ name: 'Teste' });
        action.initialize('2d20+2,3d4-2,2d12+24/s');
        expect(action.dice[0]).toMatchObject({
            diceType: 20,
            diceNumber: 2,
            bonus: 2
        });
        expect(action.dice[1]).toMatchObject({
            diceType: 4,
            diceNumber: 3,
            bonus: -2,
        });
        expect(action.dice[2]).toMatchObject({
            diceType: 12,
            diceNumber: 2,
            bonus: 24
        });
        expect(action.flags.separate).toBe(true);
        expect(action.flags.heal).toBe(false);
    });

    test('Clearly invalid expressions throw errors', async () => {
        const action = new BasicAction({ name: 'Teste' });
        expect(() => action.initialize('dwadad')).toThrow(/validation failed/);
    });

    test('Subtly invalid expressions throw errors', async () => {
        const action = new BasicAction({ name: 'Teste' });
        expect(() => action.initialize('2d20,2d4+2,,3d6/s')).toThrow(/validation failed/);
    });
})

afterAll(async () => {
    await mongoose.connection.close();
})
