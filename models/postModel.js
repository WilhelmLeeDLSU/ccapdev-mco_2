const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    timeCreated: { type: Date, default: Date.now },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'community', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    isEdited: { type: Boolean, default: false }
}, { versionKey: false });

// get the time diff
postSchema.virtual('timeAgo').get(function(){
    const diffMins = Date.now() - this.timeCreated.getTime();
    const diffHrs = Math.floor(diffMins / (1000 * 60 * 60));
    return diffHrs > 0 ? `${diffHrs}h` :  "Just now";
});

const postModel = mongoose.model('post', postSchema);
module.exports = postModel;