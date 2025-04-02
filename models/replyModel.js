const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    timeCreated: { type: Date, default: Date.now },
    content: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    isEdited: { type: Boolean, default: false }
}, { versionKey: false });

// get the time diff
replySchema.virtual('timeAgo').get(function(){
    const diffMins = Date.now() - this.timeCreated.getTime();
    const diffHrs = Math.floor(diffMins / (1000 * 60 * 60));
    return diffHrs > 0 ? `${diffHrs}h` :  "Just now";
});

const replyModel = mongoose.model('reply', replySchema);
module.exports = replyModel;