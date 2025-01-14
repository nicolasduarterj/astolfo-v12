/**
 * Rolls diceNumber dDiceType (e.g. 2 d20)
 * @param {Number} diceType 
 * @param {Number} diceNumber  
 * @param {'advantage' | 'neutral' | 'disadvantage'} advantage 
 * @returns {{rolls: [Number], biggest: Number, smallest: Number, }}
 */
function rollDice(diceNumber, diceType) {
    const rolls = [];
    for (let i = 0; i < diceNumber; i++)
        rolls[i] = Math.floor(Math.random() * diceType) + 1;
    return {
        rolls,
        biggest: Math.max(...rolls),
        smallest: Math.min(...rolls),
    };
}

module.exports = { rollDice };
