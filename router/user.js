const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

router.get('/', (req, res, next) => {
    res.status(200).json({
        msg: 'User get method'
    });
});

router.post('/signup', (req, res, next) => {

    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user.length > 0) {
                console.log(user.length);
                res.status(500).json({
                    msg: "This Email is already exists"
                })
            }
            else {
                User.find({ phone: req.body.phone })
                    .exec()
                    .then((exists) => {
                        if (exists.length > 0) {
                            console.log(user.length);
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
                                    const newUser = new User({
                                        _id: new mongoose.Types.ObjectId,
                                        username: req.body.username,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        password: hash
                                    });
                                    newUser.save()
                                        .then(result => {
                                            res.status(200).json({
                                                msg: 'User register Successfully'
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

router.post('/login', (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    msg: 'user not exist'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (!result) {
                    return res.status(500).json({
                        msg: "password not match"
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        _id: user[0]._id,
                        username: user[0].username,
                        email: user[0].email,
                        phone: user[0].phone
                    },
                        'this is dummy text',
                        {
                            expiresIn: "24h"
                        }
                    );
                    res.status(200).json({
                        token: token
                    })
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.put('/login', (req, res) => {
    User.findOneAndUpdate({ _id: req.body._id }, {
        $set: {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone
        }
    })
        .then(result => {
            const token = jwt.sign({
                _id: result._id,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone
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

module.exports = router;


