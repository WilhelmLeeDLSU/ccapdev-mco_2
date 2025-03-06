const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    authorProfileName: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorPfp: { type: String, default: '/public/common/defaultpfp.png' },
    timeCreated: { type: Date, default: Date.now },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
});

// get the time diff
replySchema.virtual('timeAgo').get(function(){
    const diffMins = Date.now() - this.timeCreated.getTime();
    const diffHrs = Math.floor(diffMins / (1000 * 60 * 60));
    return diffHrs > 0 ? `${diffHrs}h` :  "Just now";
});

const replyModel = mongoose.model('reply', replySchema);
module.exports = replyModel;