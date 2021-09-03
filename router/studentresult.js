const express = require('express');
const student = express.Router();
const mongoose = require('mongoose');
const Result = require('../models/studresultmodel');
var cors = require('cors');


student.get('/', async (req, res, next) => {
    await Result.find({}, (err, result) => {
        if (result) {
            res.status(200).json({
                result: result
            })
        } else {
            res.status(500).json({
                err: err
            })
        }
    })
});

student.get('/:course', async (req, res, next) => {
    console.log(req.params.course);
    await Result.find({ course: req.params.course }, (err, result) => {
        if (result.length) {
            res.status(200).json({
                result: result
            })
        } else {
            res.status(500).json({
                msg: "Invalid Creditionals"
            })
        }
    })
});

student.get('/:course/:sem', async (req, res, next) => {
    await Result.find({ course: req.params.course, semester: req.params.sem }, (err, result) => {
        if (result.length) {
            res.status(200).json({
                result: result
            })
        } else {
            res.status(500).json({
                msg: "Invalid Creditionals"
            })
        }
    })
});

student.get('/:course/:sem/:rollno', async (req, res, next) => {
    await Result.find({ course: req.params.course, semester: req.params.sem }, (err, result) => {
        if (result.length) {
            const find_stud = result[0].students.filter((x) => x.rollno === req.params.rollno);
            if (find_stud.length) {
                return res.status(200).json({
                    result: find_stud
                })
            } else {
                res.status(500).json({
                    msg: "Student does not exist"
                })
            }
        } else {
            res.status(500).json({
                msg: "Invalid Creditionals"
            })
        }
    })
});

student.post('/', async (req, res) => {
    const course = await Result.findOne({ "course": req.body.course, "semester": req.body.semester });
    if (course) {
        return res.status(500).json({
            msg: "this course is already added"
        })
    } else {
        const new_result = new Result({
            _id: new mongoose.Types.ObjectId,
            semester: req.body.semester,
            course: req.body.course,
            students: req.body.students
        })
        new_result.save()
            .then(result => {
                res.status(200).json({
                    msg: "Course Add Successfully",
                    result: result
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
    }
})

student.put('/subject', async (req, res) => {
    const find_course = await Result.findOne({ "course": req.body.course, "semester": req.body.semester });
    if (find_course) {
        const find_stud = find_course.students.filter((x) => x.rollno === req.body.rollno);
        if (find_stud.length) {
            await Result.findOneAndUpdate({ "course": req.body.course, "semester": req.body.semester }, {
                $set: {
                    "students.$[o].result.$[i].marks": req.body.marks,
                    "students.$[o].result.$[i].subject": req.body.subject
                }
            },
                { arrayFilters: [{ 'o.rollno': req.body.rollno }, { 'i.code': req.body.code }] }, (err, result) => {
                    if (result) {
                        return res.status(200).json({
                            result: result
                        })
                    } else {
                        return res.status(500).json({
                            err: err
                        })
                    }
                });
        } else {
            return res.status(500).json({
                message: "Enter Valid Creditonals"
            })
        }
    }
    else {
        return res.status(500).json({
            message: "Enter Valid Creditonals"
        })
    }
})

student.post('/student', async (req, res) => {
    const validate_stud = await Result.findOne({ "course": req.body.course, "semester": req.body.semester });
    if (validate_stud) {
        const update_stud = req.body.students.filter((x) => !validate_stud.students.find(({ rollno }) => x.rollno === rollno));
        if (update_stud.length) {
            const getcourse = await Result.findOneAndUpdate({ "course": req.body.course, "semester": req.body.semester }, {
                $push: {
                    "students": update_stud
                }
            });
            if (getcourse) {
                const get_stud = await Result.findOne({ "course": req.body.course, "semester": req.body.semester });
                if (get_stud.students.length > validate_stud.students.length) {
                    return res.status(200).json({
                        students: get_stud.students
                    })
                }
            }
        }
    }
})

student.post('/subject', async (req, res) => {
    const find_course = await Result.findOne({ "course": req.body.course, "semester": req.body.semester });
    if (find_course) {
        const find_stud = find_course.students.filter((x) => x.rollno === req.body.rollno);
        if (find_stud.length) {
            await Result.findOneAndUpdate({ "course": req.body.course, "semester": req.body.semester }, {
                $push: {
                    "students.$[o].result": {
                        "code": req.body.code,
                        "subject": req.body.subject,
                        "marks": req.body.marks,
                    }
                }
            }, { arrayFilters: [{ 'o.rollno': req.body.rollno }] }, (err, result) => {
                if (result) {
                    return res.status(200).json({
                        result: result
                    })
                } else {
                    return res.status(500).json({
                        err: err
                    })
                }
            });
        } else {
            return res.status(500).json({
                message: "Enter Valid Creditonals"
            })
        }
    }
    else {
        return res.status(500).json({
            message: "Enter Valid Creditonals"
        })
    }

})

module.exports = student;