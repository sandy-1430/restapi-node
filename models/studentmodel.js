const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    email: String,
    phone: String,
    gender: String,
    rollno: String,
    course: String,
    address: String,
    fathername: String,
    mothername: String,
    password: String
});

module.exports = mongoose.model('Studentdetail', StudentSchema);
