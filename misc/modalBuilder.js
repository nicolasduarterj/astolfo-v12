const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Returns a modal with the submitted inputs
 * @param {String} modalID 
 * @param {String} modalTitle
 * @param {[{label: String, id: String}]} inputs -- Objects with a label and id for each input
 */
function modalBuilder(modalID, modalTitle, inputs) {
    const modal = new ModalBuilder().setCustomId(modalID).setTitle(modalTitle);

    for (const inputObject of inputs) {
        const input = new TextInputBuilder().setCustomId(inputObject.id).setLabel(inputObject.label).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder().addComponents(input);
        modal.addComponents(actionRow);
    }

    return modal;
}

module.exports = modalBuilder;