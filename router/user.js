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

router.post('/login', async (req, res) => {
    const find_user = await User.findOne({ $or: [{ email: req.body.email }, { phone: req.body.email }] });
    if (find_user) {
        bcrypt.compare(req.body.password, find_user.password, (err, result) => {
            if (!result) {
                return res.status(500).json({
                    msg: "password not match"
                })
            }
            if (result) {
                const token = jwt.sign({
                    _id: find_user._id,
                    username: find_user.username,
                    email: find_user.email,
                    phone: find_user.phone
                },
                    'this is dummy text',
                    {
                        expiresIn: "24h"
                    }
                );
                res.status(200).json({
                    _id: find_user._id,
                    username: find_user.username,
                    email: find_user.email,
                    phone: find_user.phone,
                    token: token
                })
            }
        })
    }
    else {
        res.status(500).json({
            msg: 'user not exist'
        })
    }
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


