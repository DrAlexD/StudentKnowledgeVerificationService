const path = require('path');
const express = require('express');
const mysql = require('mysql');

const professorsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "knowledge_verification_service"
});

con.connect(err => err ? console.error(err) : console.log("ProfessorsRouter connected to MySQL database!"));

professorsRouter.get('/:id', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM professor WHERE Professor_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/professors/professor_page.html'));
                    else
                        res.redirect('/professors');
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM professor WHERE Professor_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.status(200).json(result[0]);
                    else
                        res.redirect('/professors');
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/delete', (req, res) => {
    con.query(`DELETE FROM professor WHERE Professor_id='${req.params.id}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

professorsRouter.get('/:id/edit', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM professor WHERE Professor_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__dirname, '../pages/professors/professor_edit_page.html'));
                    } else {
                        res.redirect('/professors');
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.post('/:id/edit', (req, res) => {
    let f = true;

    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            f = false;
            res.status(400).json("Недопустимый логин: admin");
        } else {
            con.query("UPDATE professor SET Login" + `='${req.body.login}' WHERE Professor_id='${req.params.id}'`, err => {
                if (err) {
                    console.error(err);
                    f = false;
                    res.status(400).json("Копия имеющегося преподавателя");
                }
            });
        }
    }

    if (f) {
        let setAllFiels = async function () {
            if (req.body.firstName !== "") {
                con.query("UPDATE professor SET First_name" + `='${req.body.firstName}' WHERE Professor_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.secondName !== "") {
                con.query("UPDATE professor SET Second_name" + `='${req.body.secondName}' WHERE Professor_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.password !== "") {
                con.query("UPDATE professor SET Password" + `='${req.body.password}' WHERE Professor_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }
        }

        setAllFiels().then(res.end());
    }
});

professorsRouter.get('/:id/tests/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result);
                    } else {
                        res.status(404).send("Не найдены тесты преподавателя");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/add/test', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        res.sendFile(path.join(__dirname, '../pages/professors/add_test_page.html')); //TODO добавить
    } else {
        res.redirect('/login');
    }
});

professorsRouter.post('/:id/add/test', (req, res) => {
    if (req.body.title !== "" && req.body.subject !== "" && req.body.number !== "" && req.body.percent !== "") {
        con.query("INSERT INTO test (`Professor_id`, `Title`, `Subject_title`, `Total_number_of_questions`, `Percentage_for_test_passing`) "
            + `VALUES ('${req.params.id}','${req.body.title}', '${req.body.subject}', '${req.body.number}', '${req.body.percent}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                } else {
                    con.query(`SELECT * FROM test WHERE Title='${req.body.title}' AND Professor_id='${req.params.id}' AND Subject_title='${req.body.title}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                res.status(200).json(result[0].Test_id);
                            }
                        }
                    );
                }
            }
        );
    } else {
        res.status(400).json("Не введены название, предмет, количество вопросов или процент выполнения");
    }
});

professorsRouter.get('/:id/test/:code', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/professors/test_page.html'));//TODO добавить
                    else
                        res.redirect(`/professor/${req.params.id}`);
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/test/:code/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result[0]);
                    } else {
                        res.redirect(`/professor/${req.params.id}`);
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/test/:code/delete', (req, res) => {
    con.query(`DELETE FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

professorsRouter.get('/:id/test/:code/edit', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__dirname, '../pages/professors/test_edit_page.html')); //TODO добавить
                    } else {
                        res.redirect(`/professor/${req.params.id}`);
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.post('/:id/test/:code/edit', (req, res) => {
    let setAllFiels = async function () {
        if (req.body.title !== "") {
            con.query("UPDATE test SET Title" + `='${req.body.title}' WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`, err => {
                if (err)
                    console.error(err);
            });
        }

        if (req.body.subject !== "") {
            con.query("UPDATE test SET Subject_title" + `='${req.body.subject}' WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`, err => {
                if (err)
                    console.error(err);
            });
        }

        if (req.body.number !== "") {
            con.query("UPDATE test SET Total_number_of_questions" + `='${req.body.number}' WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`, err => {
                if (err)
                    console.error(err);
            });
        }

        if (req.body.percent !== "") {
            con.query("UPDATE test SET Percentage_for_test_passing" + `='${req.body.percent}' WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`, err => {
                if (err)
                    console.error(err);
            });
        }
    }

    setAllFiels().then(res.end());
});

professorsRouter.get('/:id/test/:code/questions/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM question WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result);
                    } else {
                        res.status(404).send("Не найдены вопросы у теста преподавателя");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/test/:code/add/question', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        res.sendFile(path.join(__dirname, '../pages/professors/add_question_page.html')); //TODO добавить
    } else {
        res.redirect('/login');
    }
});

professorsRouter.post('/:id/test/:code/add/question', (req, res) => {
    if (req.body.text !== "") {
        let is_has_true_answer = false;
        let is_has_false_answer = false;

        for (answer of req.body.answers) {
            if (answer.Is_correct_answer) {
                is_has_true_answer = true;
            }
            if (!answer.Is_correct_answer) {
                is_has_false_answer = true;
            }
        }

        if (is_has_true_answer && is_has_false_answer) {
            con.query("INSERT INTO question (`Professor_id`, `Test_id`, `Question_text`) "
                + `VALUES ('${req.params.id}','${req.params.code}', '${req.body.text}')`,
                function (err1) {
                    if (err1) {
                        console.error(err1);
                    } else {
                        con.query(`SELECT * FROM question WHERE Test_id='${req.params.code}' AND Professor_id='${req.params.id}' AND Question_text='${req.body.text}'`,
                            function (err2, result) {
                                if (err2)
                                    console.error(err2);
                                else {
                                    let setAllAnswers = async function () {
                                        for (answer of req.body.answers) {
                                            con.query("INSERT INTO answer (`Question_id`,`Professor_id`, `Test_id`, `Answer_text`,`Is_correct_answer`) "
                                                + `VALUES ('${result[0].Question_id}','${req.params.id}','${req.params.code}', '${answer.text}','${answer.Is_correct_answer}')`,
                                                function (err3) {
                                                    if (err3)
                                                        console.error(err3);
                                                }
                                            );
                                        }
                                    }

                                    setAllAnswers().then(res.status(200).json(result[0].Question_id));
                                }
                            }
                        );
                    }
                }
            );
        } else {
            res.status(400).json("Вопрос должен содержать хотя бы один правильный и один неправильный ответы");
        }
    } else {
        res.status(400).json("Не введен текст вопроса");
    }
});

professorsRouter.get('/:id/test/:code/question/:numb', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM question WHERE Professor_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/professors/question_page.html'));//TODO добавить
                    else
                        res.redirect(`/professor/${req.params.id}/test/${req.params.code}`);
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/test/:code/question/:numb/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM question WHERE Professor_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).json(result[0]);
                    } else {
                        res.redirect(`/professor/${req.params.id}/test/${req.params.code}`);
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.get('/:id/test/:code/question/:numb/delete', (req, res) => {
    con.query(`DELETE FROM question WHERE Professor_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

professorsRouter.get('/:id/test/:code/question/:numb/edit', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM question WHERE Professor_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__dirname, '../pages/professors/question_edit_page.html')); //TODO добавить
                    } else {
                        res.redirect(`/professor/${req.params.id}/test/${req.params.code}`);
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

professorsRouter.post('/:id/test/:code/question/:numb/edit', (req, res) => {
    let setAllFiels = async function () {
        if (req.body.text !== "") {
            con.query("UPDATE question SET Question_text" + `='${req.body.text}'` +
                ` WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`, err => {
                if (err)
                    console.error(err);
            });
        }

        if (req.body.answers !== "") {
            let is_has_true_answer = false;
            let is_has_false_answer = false;

            for (answer of req.body.answers) {
                if (answer.Is_correct_answer) {
                    is_has_true_answer = true;
                }
                if (!answer.Is_correct_answer) {
                    is_has_false_answer = true;
                }
            }

            if (is_has_true_answer && is_has_false_answer) {
                for (answer of req.body.answers) {

                    if (answer.text !== "") {
                        con.query("UPDATE answer SET Answer_text" + `='${answer.text}' WHERE Professor_id='${req.params.id}'` +
                            ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb} AND Answer_id='${answer.id}''`,
                            function (err) {
                                if (err)
                                    console.error(err);
                            }
                        );
                    }

                    con.query("UPDATE answer SET Is_correct_answer" + `='${answer.Is_correct_answer}' WHERE Professor_id='${req.params.id}'` +
                        `AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}' AND Answer_id='${answer.id}'`,
                        function (err) {
                            if (err)
                                console.error(err);
                        }
                    );
                }
            }
        }
    }

    setAllFiels().then(res.end());
});

module.exports = professorsRouter;