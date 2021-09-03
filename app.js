const express = require('express');
const app = express();
var cors = require('cors');


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
const studresultRouter = require('./router/studentresult');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(cors({ credentials: true, origin: 'https://sandy-node-restapi.herokuapp.com/' }));
app.use('/user', userRouter);
app.use('/student', studentRouter);
app.use('/result', studresultRouter);


module.exports = app;
