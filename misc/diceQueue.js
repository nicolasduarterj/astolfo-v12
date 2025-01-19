/*
Nicolas's notes:
Each item in the queue is an array of DiceSchema
This is so that it may run a single dice or all of them at a given step
maybe even run a subgroup of them in the future
*/

class DiceQueue {
    /**
     * Creates a DiceQueue with the provided dice to roll
     * @param {[diceSchema]} dices 
     * @param {Boolean} isSeparate 
     */
    constructor(dices, isSeparate) {
        if (dices.length < 1)
            throw new Error('The queue must start with at least one dice');
        this.items = isSeparate ? dices.map(dice => [dice]) : [dices];
        this.isEmpty = false;
    }

    /**
     * Rolls the first item in queue and pops it
     */
    rollAndPop() {
        if (this.items.length === 0)
            throw new Error('Cannot pop from empty queue');
        const target = this.items[0]; //target: [diceSchema]
        const rolls = target.map(dice => dice.roll());
        this.items.shift();
        this.isEmpty = !(this.items.length);
        return {
            rolledDice: rolls.map(roll => roll.diceString).join(','),
            rolls: rolls,
        }
    }
}

module.exports = DiceQueue;
