class FakeInteraction {
    options = {
        optionsHashMap: {},
        getString(name) {
            return this.optionsHashMap[name];
        },
        getUser(name) {
            return this.optionsHashMap[name];
        },
        getNumber(name) {
            return this.optionsHashMap[name];
        }
    }
    fields = {
        fieldsHashMap: {},
        getTextInputValue(id) {
            return this.fieldsHashMap[id];
        }
    }
    results = [];
    user = {};
    replied = false;
    async reply(string) {
        if (this.replied) {
            throw new Error('already replied');
        }
        this.results.push(string);
        this.replied = true;
        return string;
    }

    async editReply(string) {
        this.results.push(string);
        return string;
    }

    async showModal() {
        return;
    }

    constructor(options, userid) {
        for (const option of options) {
            this.options.optionsHashMap[option.name] = option.value;
        }
        this.user.id = userid;
    }

    setModalResponses(options) {
        for (const option of options) {
            this.fields.fieldsHashMap[option.id] = option.value;
        }
    }

    async awaitModalSubmit() {
        this.replied = false;
        return this;
    }
};

module.exports = FakeInteraction;