/**
 * Returns an object with a property corresponding to every input in the modal listed in IDs
 * @param {Interaction} modalResponse Response from the modal
 * @param {[String]} IDs IDs of the text inputs
 */
function modalRetrieve(modalResponse, IDs) {
    const items = {};
    for (const id of IDs) {
        items[id] = modalResponse.fields.getTextInputValue(id);
    }
    return items;
}

module.exports = modalRetrieve;