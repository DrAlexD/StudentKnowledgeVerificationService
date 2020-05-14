const path = require('path');
const express = require('express');
const mysql = require('mysql');

const studentsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "knowledge_verification_service"
});

con.connect(err => err ? console.error(err) : console.log("StudentsRouter connected to MySQL database!"));

studentsRouter.get('/:id', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student WHERE Student_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/students/student_page.html'));
                    else
                        res.redirect('/students');
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student WHERE Student_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.status(200).json(result[0]);
                    else
                        res.redirect('/students');
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/delete', (req, res) => {
    con.query(`DELETE FROM student WHERE Student_id='${req.params.id}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

studentsRouter.get('/:id/edit', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student WHERE Student_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__dirname, '../pages/students/student_edit_page.html'));
                    } else {
                        res.redirect('/students');
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.post('/:id/edit', (req, res) => {
    let f = true;

    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            f = false;
            res.status(400).json("Недопустимый логин: admin");
        } else {
            con.query("UPDATE student SET Login" + `='${req.body.login}' WHERE Student_id='${req.params.id}'`, err => {
                if (err) {
                    console.error(err);
                    f = false;
                    res.status(400).json("Копия имеющегося студента");
                }
            });
        }
    }

    if (f) {
        let setAllFiels = async function () {
            if (req.body.firstName !== "") {
                con.query("UPDATE student SET First_name" + `='${req.body.firstName}' WHERE Student_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.secondName !== "") {
                con.query("UPDATE student SET Second_name" + `='${req.body.secondName}' WHERE Student_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.studentGroup !== "") {
                con.query("UPDATE student SET `Group`" + `='${req.body.studentGroup}' WHERE Student_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.password !== "") {
                con.query("UPDATE student SET Password" + `='${req.body.password}' WHERE Student_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }
        }

        setAllFiels().then(res.end());
    }
});

studentsRouter.get('/:id/tests/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student_test WHERE Student_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result);
                    } else {
                        res.status(404).send("Не найдены тесты студента");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/test/:code/:attempt', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student_test WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}'AND Attempt_number='${req.params.attempt}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/students/student_test_page.html'));
                    else
                        res.redirect(`/student/${req.params.id}`);
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/test/:code/:attempt/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student_test WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result[0]);
                    } else {
                        res.redirect(`/student/${req.params.id}`);
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/add/test', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        res.sendFile(path.join(__dirname, '../pages/students/add_test_to_student_page.html'));
    } else {
        res.redirect('/login');
    }
});

studentsRouter.post('/:id/add/test', (req, res) => {
    if (req.body.number !== "") {
        let setAllFiels = async function () {
            con.query("INSERT INTO student_test (`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`,`Created_by_id`,`Number_of_questions_in_test`) "
                + `VALUES ('${req.body.attempt}','${req.body.studentId}', '${req.body.testId}', '${req.body.professorId}','${req.body.createdById}', '${req.body.number}')`,
                function (err1) {
                    if (err1)
                        console.error(err1);
                }
            );

            let questionsIds = [];
            for (let i = 0; i < req.body.number; i++) {
                questionsIds.push(0);
            }

            function getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            }

            con.query(`SELECT * FROM question WHERE Professor_id='${req.body.professorId}' AND Test_id='${req.body.testId}'`,
                function (err, result) {
                    if (err)
                        console.error(err);
                    else {
                        if (typeof result[0] != 'undefined') {
                            let mask = [];
                            for (let i = 0; i < result.length; i++) {
                                mask.push(0);
                            }
                            let current_number = 0;
                            while (current_number !== req.body.number) {
                                for (let i = 0; i < result.length; i++) {
                                    if (current_number !== req.body.number) {
                                        if (mask[i] === 0 && getRandomInt(result.length / req.body.number + 1) === 0) {
                                            mask[i] = 1;
                                            current_number++;
                                        }
                                    } else
                                        break;
                                }
                            }

                            let posMask = []

                            function isHasPos(randomPos) {
                                for (let i = 0; i < posMask.length; i++) {
                                    if (posMask[i] === randomPos)
                                        return true
                                }
                                return false
                            }

                            for (let i = 0; i < result.length; i++) {
                                if (mask[i] === 1) {
                                    let randomPos = getRandomInt(req.body.number)
                                    while (isHasPos(randomPos)) {
                                        randomPos = getRandomInt(req.body.number)
                                    }
                                    posMask.push(randomPos)
                                } else
                                    posMask.push(-1);
                            }

                            for (let i = 0; i < result.length; i++) {
                                if (posMask[i] !== -1) {
                                    questionsIds[posMask[i]] = result[i].Question_id
                                }
                            }
                        } else {
                            console.error("Не найдены вопросы у теста преподавателя");
                        }
                    }
                }
            );

            for (let i = 0; i < questionsIds.length; i++) {
                con.query("INSERT INTO student_question (`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`,`Question_id`) "
                    + `VALUES ('${req.body.attempt}','${req.params.id}', '${req.body.testId}', '${req.body.professorId}', '${questionsIds[i]}')`,
                    function (err1) {
                        if (err1)
                            console.error(err1);
                    }
                );
            }

            for (let j = 0; j < questionsIds.length; j++) {
                let answersIds = [];

                con.query(`SELECT * FROM answer WHERE Professor_id='${req.body.professorId}' AND Test_id='${req.body.testId}'` +
                    `AND Question_id='${questionsIds[j]}'`,
                    function (err, result) {
                        if (err)
                            console.error(err);
                        else {
                            if (typeof result[0] != 'undefined') {
                                let mask = [];
                                for (let i = 0; i < result.length; i++) {
                                    mask.push(1);
                                }

                                let right_number = 0;
                                let wrong_number = 0;
                                while (right_number < 1 || wrong_number < 1) {
                                    for (let i = 0; i < mask.length; i++) {
                                        mask[i] = 1;
                                    }
                                    for (let i = 0; i < result.length; i++) {
                                        if (getRandomInt(result.length < 9 ? 11 - result.length : 2) === 0) {
                                            mask[i] = 0;
                                        } else {
                                            if (result[i].Is_correct_answer)
                                                right_number++;
                                            else
                                                wrong_number++;
                                        }
                                    }
                                }

                                let posMask = []

                                function isHasPos(randomPos) {
                                    for (let i = 0; i < posMask.length; i++) {
                                        if (posMask[i] === randomPos)
                                            return true
                                    }
                                    return false
                                }

                                for (let i = 0; i < result.length; i++) {
                                    if (mask[i] === 1) {
                                        let randomPos = getRandomInt(right_number + wrong_number)
                                        while (isHasPos(randomPos)) {
                                            randomPos = getRandomInt(right_number + wrong_number)
                                        }
                                        posMask.push(randomPos)
                                    } else
                                        posMask.push(-1);
                                }

                                for (let i = 0; i < right_number + wrong_number; i++) {
                                    answersIds.push(0);
                                }

                                for (let i = 0; i < result.length; i++) {
                                    if (posMask[i] !== -1) {
                                        answersIds[posMask[i]] = result[i].Answer_id
                                    }
                                }
                            } else {
                                console.error("Не найдены вопросы у теста преподавателя");
                            }
                        }
                    }
                );

                for (let i = 0; i < answersIds.length; i++) {
                    con.query("INSERT INTO student_answer (`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`,`Question_id`,`Answer_id`) "
                        + `VALUES ('${req.body.attempt}','${req.params.id}', '${req.body.testId}', '${req.body.professorId}', '${questionsIds[j]}', '${answersIds[i]}')`,
                        function (err1) {
                            if (err1)
                                console.error(err1);
                        }
                    );
                }
            }
        }

        setAllFiels().then(res.end());
    } else {
        res.status(400).json("Не введено количество вопросов в тесте");
    }
});

studentsRouter.get('/:id/test/:code/:attempt/delete', (req, res) => {
    con.query(`DELETE FROM student_test WHERE Student_id='${req.params.id}' AND Test_id='${req.params.code}'` +
        ` AND Attempt_number='${req.params.attempt}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

studentsRouter.get('/:id/test/:code/:attempt/questions/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}'  AND Attempt_number='${req.params.attempt}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result);
                    } else {
                        res.status(404).send("Не найдены вопросы студента");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/test/:code/:attempt/question/:numb', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}'AND Attempt_number='${req.params.attempt}'` +
            ` AND Question_id='${req.params.numb}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/students/student_question_page.html')); //TODO добавить
                    else
                        res.redirect(`/student/${req.params.id}/test/${req.params.code}/${req.params.attempt}`);
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

studentsRouter.get('/:id/test/:code/:attempt/question/:numb/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}'` +
            ` AND Question_id='${req.params.numb}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result[0]);
                    } else {
                        res.redirect(`/student/${req.params.id}/test/${req.params.code}/${req.params.attempt}`);
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});


module.exports = studentsRouter;