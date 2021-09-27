const express = require('express');
const student = express.Router();
const mongoose = require('mongoose');
const Result = require('../models/studresultmodel');


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

student.get('/:sem', async (req, res, next) => {
    await Result.find({ semester: req.params.sem }, (err, result) => {
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

student.get('/:sem/:rollno', async (req, res, next) => {
    await Result.find({ semester: req.params.sem }, (err, result) => {
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
    const course = await Result.findOne({ semester: req.body.semester });
    if (course) {
        return res.status(500).json({
            msg: "this semester is already added"
        })
    } else {
        const new_result = new Result({
            _id: new mongoose.Types.ObjectId,
            semester: req.body.semester,
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
    const find_course = await Result.findOne({ "semester": req.body.semester });
    if (find_course) {
        const find_stud = find_course.students.filter((x) => x.rollno === req.body.rollno);
        if (find_stud.length) {
            const check_code = find_stud[0].result.filter((c) => c.code === req.body.code);
            if (check_code.length) {
                await Result.findOneAndUpdate({ "semester": req.body.semester }, {
                    $set: {
                        "students.$[o].result.$[i].marks": req.body.marks,
                        "students.$[o].result.$[i].subject": req.body.subject
                    }
                }, { arrayFilters: [{ 'o.rollno': req.body.rollno }, { 'i.code': req.body.code }] }, (err, result) => {
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
                show_err("Subject Code");
            }
        } else {
            show_err("Roll No");
        }
    }
    else {
        show_err("semester");
    }

    function show_err(data) {
        return res.status(500).json({
            message: "Enter Valid " + data
        })
    }
})

student.post('/student', async (req, res) => {
    const validate_stud = await Result.findOne({ "semester": req.body.semester });
    if (validate_stud) {
        const update_stud = req.body.students.filter((x) => !validate_stud.students.find(({ rollno }) => x.rollno === rollno));
        if (update_stud.length === req.body.students.length) {
            await Result.findOneAndUpdate({ "semester": req.body.semester }, {
                $push: {
                    "students": update_stud
                }
            }, (err, result) => {
                if (result) {
                    return res.status(200).json({
                        message: "Student Updated Successfully"
                    })
                } else {
                    return res.status(500).json({
                        err: err
                    })
                }
            });
        }
        else {
            return res.status(500).json({
                message: "This Students are Already Exists"
            })
        }
    }
})

student.post('/subject', async (req, res) => {
    const find_course = await Result.findOne({ "semester": req.body.semester });
    if (find_course) {
        const find_stud = find_course.students.filter((x) => x.rollno === req.body.rollno);
        if (find_stud.length) {
            const check_code = find_stud[0].result.filter((c) => c.code === req.body.code);
            if (!check_code.length) {
                await Result.findOneAndUpdate({ "semester": req.body.semester }, {
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
            }
            else {
                show_err("Subject Code");
            }
        } else {
            show_err("Roll No");
        }
    }
    else {
        show_err("semester");
    }

    function show_err(data) {
        return res.status(500).json({
            message: "Enter Valid " + data
        })
    }

})

student.delete('/:sem/:rollno/:code', async (req, res) => {
    const find_course = await Result.findOne({ "semester": req.params.sem });
    if (find_course) {
        const find_stud = find_course.students.filter((x) => x.rollno === req.params.rollno);
        if (find_stud.length) {
            const check_code = find_stud[0].result.filter((c) => c.code === req.params.code);
            if (check_code.length) {
                await Result.findOneAndUpdate({"semester": req.params.sem }, 
                        { $pull: {"students.$[o].result": {"code": req.params.code} } },
                        { arrayFilters: [{ 'o.rollno': req.params.rollno }] },
                        (err, result) => {
                            if (result) {
                                console.log(result);
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
                show_err("Subject Code");
            }
        } else {
            show_err("Roll No");
        }
    }
    else {
        show_err("semester");
    }

    function show_err(data) {
        return res.status(500).json({
            message: "Enter Valid " + data
        })
    }
    
})

module.exports = student;
