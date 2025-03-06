const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    profileName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    pfp: { type: String, defaut: 'public/common/defaultpfp.png' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post'}],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reply' }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post'}]
});

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;