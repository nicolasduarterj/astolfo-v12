const { describe, expect, test, } = require('@jest/globals');
const dotenv = require('dotenv')
const DiceQueue = require('../misc/diceQueue');
const BasicAction = require('../models/testing/basicAction');
dotenv.config();

describe('DiceQueue creation', () => {
    test('Creating a DiceQueue with non-separate dice works', async () => {
        const punch = new BasicAction({ name: 'Punch' });
        punch.initialize('2d20+2,4d4-2');
        const dq = new DiceQueue(punch.dice, punch.flags.separate);
        expect(dq.items).toEqual([punch.dice]);
    })
    test('Creating a DiceQueue with separate dice works', async () => {
        const punch = new BasicAction({ name: 'Punch' });
        punch.initialize('2d20+2,4d4-2/s');
        const dq = new DiceQueue(punch.dice, punch.flags.separate);
        console.log(dq.items);
        expect(dq.items).toEqual(punch.dice.map(dice => [dice]));
    })
})

describe('DiceQueue popping', () => {
    test('Popping an item removes it from the DiceQueue', async () => {
        const punch = new BasicAction({ name: 'Punch' });
        punch.initialize('2d20+2,4d4-2/s');
        const dq = new DiceQueue(punch.dice, punch.flags.separate);
        const firstItem = dq.items[0];
        const oldDqLength = dq.length;
        dq.rollAndPop();
        const newFirstItem = dq.items[0];
        expect(firstItem).not.toMatchObject(newFirstItem);
        expect(dq.items.length).not.toBe(oldDqLength);
    })
    test('Cannot pop an empty queue', () => { 
        const punch = new BasicAction({ name: 'Punch' });
        punch.initialize('2d20+2');
        const dq = new DiceQueue(punch.dice, punch.flags.separate);
        dq.rollAndPop();
        expect(() => dq.rollAndPop()).toThrow();
    })
    test('Rolling an item from a single-item queue works', async () => {
        const punch = new BasicAction({ name: 'Punch' });
        punch.initialize('2d20+2,4d4-2');
        const dq = new DiceQueue(punch.dice, punch.flags.separate);
        const roll = dq.rollAndPop();
        expect(roll.rolledDice).toMatch(/2d20\+2/);
        expect(roll.isQueueEmpty).toBe(true);
        expect(roll.rolls.length).not.toBe(0);
        console.log(roll);
    })
    test('Rolling an item from a multi-item queue works', async () => {
        const punch = new BasicAction({ name: 'Punch' });
        punch.initialize('2d20+2,4d4-2/s');
        const dq = new DiceQueue(punch.dice, punch.flags.separate);
        const roll = dq.rollAndPop();
        expect(roll.rolledDice).toMatch(/2d20\+2/);
        expect(roll.isQueueEmpty).toBe(false);
        expect(roll.rolls.length).not.toBe(0);
        expect(dq.items.length).toBe(1);
    })
})