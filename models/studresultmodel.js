const mongoose = require('mongoose');

const Studresult_Schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    semester: String,
    students: Array
});

module.exports = mongoose.model('Result', Studresult_Schema);
