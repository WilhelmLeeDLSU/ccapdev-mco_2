const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    profileName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    pfp: { type: String, default: 'https://cdn.pfps.gg/pfps/2301-default-2.png' }
}, { versionKey: false });

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;