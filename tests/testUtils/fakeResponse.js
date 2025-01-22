class FakeResponse {
    constructor(userid) {
        this.resource = {
            message: {
                reactions: {
                    reactArr: [],
                    removeAll: function() {
                        this.reactArr = [];
                    },
                    reactionQueue: []
                },
                react: function(str) {
                    this.reactions.reactArr.push({ emoji: { name: str}, user: { id: this.userid} })
                },
                userid,
                setReactions: function(reactions) {
                    this.reactions.reactionQueue = reactions;
                }
            }
        }
    }
}

module.exports = FakeResponse;
