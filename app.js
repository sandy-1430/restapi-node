const express = require('express');
const app = express();


// app.use((req, res, next) => {
//     res.status(200).json({
//         msg: "app is running"
//     })
// })

const mangoose = require('mongoose');
mangoose.connect('mongodb+srv://sandy:sandy1234@sandy.o8vni.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const userRouter = require('./router/user');
const studentRouter = require('./router/student');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use('/user', userRouter);
app.use('/student', studentRouter);


module.exports = app;
