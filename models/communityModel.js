const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String, required: true }
});

const communityModel = mongoose.model('community', communitySchema);
module.exports = communityModel;