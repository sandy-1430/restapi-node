const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    email: String,
    phone: Number,
    password: String
});

module.exports = mongoose.model('User', userSchema);