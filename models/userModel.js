const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    profileName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    pfp: { type: String, defaut: 'public/common/defaultpfp.png' }
});

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;