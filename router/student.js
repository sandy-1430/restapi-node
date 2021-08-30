const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/studentmodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
var cors = require('cors');


router.get('/', (req, res, next) => {
    res.status(200).json({
        msg: 'Student get method'
    });
});

router.post('/signup', (req, res, next) => {
    Student.find({ email: req.body.email })
        .exec()
        .then((student) => {
            if (student.length > 0) {
                res.status(500).json({
                    msg: "This Email is already exists"
                })
            }
            else {
                Student.find({ phone: req.body.phone })
                    .exec()
                    .then((exists) => {
                        if (exists.length > 0) {
                            res.status(500).json({
                                msg: "This Phone is already exists"
                            })
                        }
                        else {
                            bcrypt.hash(req.body.password, 10, (err, hash) => {
                                if (err) {
                                    return res.status(500).json({
                                        error: err
                                    })
                                }
                                else {
                                    const newStudent = new Student({
                                        _id: new mongoose.Types.ObjectId,
                                        username: req.body.username,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        gender: req.body.gender,
                                        rollno: req.body.rollno,
                                        course: req.body.course,
                                        address: req.body.address,
                                        fathername: req.body.fathername,
                                        mothername: req.body.mothername,
                                        password: hash
                                    });
                                    newStudent.save()
                                        .then(result => {
                                            res.status(200).json({
                                                msg: 'User register Successfully',
                                                Student: result,
                                            });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            res.status(500).json({
                                                error: err
                                            })
                                        })
                                }
                            });
                        }
                    })

            }
        })

});

router.post('/login', cors(), (req, res) => {
    Student.find({ email: req.body.email })
        .exec()
        .then(student => {
            if (student.length < 1) {
                return res.status(401).json({
                    msg: 'user not exist'
                })
            }
            else {
                bcrypt.compare(req.body.password, student[0].password, (err, result) => {
                    if (!result) {
                        return res.status(500).json({
                            msg: "password not match"
                        })
                    }
                    if (result) {
                        const token = jwt.sign({
                            _id: student[0]._id,
                            username: student[0].username,
                            email: student[0].email,
                            phone: student[0].phone,
                            gender: student[0].gender,
                            rollno: student[0].rollno,
                            course: student[0].course,
                            address: student[0].address,
                            fathername: student[0].fathername,
                            mothername: student[0].mothername
                        },
                            'this is dummy text',
                            {
                                expiresIn: 60 * 1
                            }
                        );
                        res.status(200).json({
                            token: token
                        })
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.put('/login', cors(), (req, res) => {
    console.log(req.body.email);
    Student.findOneAndUpdate({ _id: req.body._id }, {
        $set: {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            rollno: req.body.rollno,
            course: req.body.course,
            address: req.body.address,
            fathername: req.body.fathername,
            mothername: req.body.mothername
        }
    })
        .then(result => {
            console.log(result);
            const token = jwt.sign({
                _id: result._id,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                gender: req.body.gender,
                rollno: req.body.rollno,
                course: req.body.course,
                address: req.body.address,
                fathername: req.body.fathername,
                mothername: req.body.mothername,
            },
                'this is dummy text',
                {
                    expiresIn: "24h"
                }
            );
            res.status(200).json({
                token: token
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post('/forget-password', (req, res) => {
    console.log(req.body.email);
    Student.find({ email: req.body.email })
        .exec()
        .then((student) => {
            if (student.length > 0) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    }
                    else {
                        Student.findOneAndUpdate({ email: req.body.email }, {
                            $set: {
                                password: hash,
                            }
                        })
                            .then(result => {
                                console.log(result);
                                if (result) {
                                    res.status(200).json({
                                        msg: "Password Changed Successfully"
                                    })
                                }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
            else {
                res.status(500).json({
                    msg: "This Email is not exists"
                })
            }
        })
})

router.post('/forget', (req, res) => {
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        requireTLS: true,
        auth: {
            user: "sathishsandy8124@gmail.com",
            pass: "Sandy@1430",
        },
    });

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            res.status(500).json({
                err: error
            })
        } else {
            console.log("Server is ready to take our messages");
        }
    });

    // var mailOptions = {
    //     from: 'sathishsandy8124@gmail.com',
    //     to: req.body.email,
    //     subject: 'Sending Email using Node.js',
    //     text: 'That was easy!'
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //         res.status(500).json({
    //             err: error
    //         })
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });
})



module.exports = router;


