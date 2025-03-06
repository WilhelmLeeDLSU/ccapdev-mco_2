const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    authorProfileName: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorPfp: { type: String, default: '/public/common/defaultpfp.png' },
    timeCreated: { type: Date, default: Date.now },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'community', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    replies: { type: mongoose.Schema.Types.ObjectId, ref: 'reply' }
});

// get the time diff
postSchema.virtual('timeAgo').get(function(){
    const diffMins = Date.now() - this.timeCreated.getTime();
    const diffHrs = Math.floor(diffMins / (1000 * 60 * 60));
    return diffHrs > 0 ? `${diffHrs}h` :  "Just now";
});

const postModel = mongoose.model('post', postSchema);
module.exports = postModel;