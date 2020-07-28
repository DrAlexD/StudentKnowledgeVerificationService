const path = require('path');
const express = require('express');
const mysql = require('mysql');

const professorsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "1234",
    database: "knowledge_verification_service"
});

con.connect(err => err ? console.error(err) : console.log("ProfessorsRouter connected to MySQL database!"));

professorsRouter.get('/:id', (req, res) => {
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
});

professorsRouter.get('/:id/info.json', (req, res) => {
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
});

professorsRouter.post('/:id/edit', (req, res) => {
    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            res.status(400).json("Недопустимый логин: admin");
        } else {
            con.query("UPDATE professor SET Login" + `='${req.body.login}' WHERE Professor_id='${req.params.id}'`, err => {
                if (err)
                    res.status(400).json("Копия имеющегося преподавателя");
                else
                    res.end();
            });
        }
    } else
        res.end();

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
});

professorsRouter.get('/:id/tests/info.json', (req, res) => {
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
});

professorsRouter.get('/:id/add/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/professors/add_test_page.html'));
});

professorsRouter.post('/:id/add/test', (req, res) => {
    if (req.body.title !== "" && req.body.subject !== "" && req.body.percent !== "") {
        con.query("INSERT INTO test (`Professor_id`, `Title`, `Subject_title`, `Total_number_of_questions`, `Percentage_for_test_passing`) "
            + `VALUES ('${req.params.id}','${req.body.title}', '${req.body.subject}', '0', '${req.body.percent}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                } else {
                    con.query(`SELECT * FROM test WHERE Title='${req.body.title}' AND Professor_id='${req.params.id}' AND Subject_title='${req.body.subject}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                res.status(200).json(result[0]);
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
    con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined')
                    res.sendFile(path.join(__dirname, '../pages/professors/test_page.html'));
                else
                    res.redirect(`/professor/${req.params.id}`);
            }
        }
    );
});

professorsRouter.get('/:id/test/:code/info.json', (req, res) => {
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
    con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.sendFile(path.join(__dirname, '../pages/professors/test_edit_page.html'));
                } else {
                    res.redirect(`/professor/${req.params.id}`);
                }
            }
        }
    );
});

professorsRouter.post('/:id/test/:code/edit', (req, res) => {
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

    if (req.body.percent !== "") {
        con.query("UPDATE test SET Percentage_for_test_passing" + `='${req.body.percent}' WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`, err => {
            if (err)
                console.error(err);
        });
    }

    res.end();
});

professorsRouter.get('/:id/test/:code/questions/info.json', (req, res) => {
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
});

professorsRouter.get('/:id/test/:code/add/question', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/professors/add_question_page.html'));
});

professorsRouter.post('/:id/test/:code/add/question', (req, res) => {
    if (req.body.text !== "") {
        let is_has_true_answer = false;
        let is_has_false_answer = false;
        let is_no_empty_answers = true;

        let answers = req.body.answers;
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].is_correct_answer) {
                is_has_true_answer = true;
            }
            if (!answers[i].is_correct_answer) {
                is_has_false_answer = true;
            }
            if (answers[i].text === "") {
                is_no_empty_answers = false;
            }
            answers[i].is_correct_answer = answers[i].is_correct_answer ? 1 : 0;
        }

        if (is_no_empty_answers) {
            if (is_has_true_answer && is_has_false_answer) {
                con.query("INSERT INTO question (`Professor_id`, `Test_id`, `Question_text`) "
                    + `VALUES ('${req.params.id}','${req.params.code}', '${req.body.text}')`, function (err1) {
                        if (err1) {
                            console.error(err1);
                        } else {
                            con.query(`SELECT * FROM question WHERE Test_id='${req.params.code}' AND Professor_id='${req.params.id}' AND Question_text='${req.body.text}'`,
                                function (err2, result) {
                                    if (err2)
                                        console.error(err2);
                                    else {
                                        for (let i = 0; i < answers.length; i++) {
                                            con.query("INSERT INTO answer (`Question_id`,`Professor_id`, `Test_id`, `Answer_text`,`Is_correct_answer`) "
                                                + `VALUES ('${result[0].Question_id}','${req.params.id}','${req.params.code}', '${answers[i].text}','${answers[i].is_correct_answer}')`,
                                                function (err3) {
                                                    if (err3)
                                                        console.error(err3);
                                                }
                                            );
                                        }
                                        res.status(200).json(result[0]);
                                    }
                                }
                            );

                            con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
                                function (err2, result) {
                                    if (err2)
                                        console.error(err2);
                                    else {
                                        con.query("UPDATE test SET Total_number_of_questions" + `='${result[0].Total_number_of_questions + 1}'` +
                                            ` WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
                                            function (err3) {
                                                if (err3)
                                                    console.error(err3);
                                            }
                                        );
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
            res.status(400).json("Каждый ответ не должен быть пустым");
        }
    } else {
        res.status(400).json("Не введен текст вопроса");
    }
});

professorsRouter.get('/:id/test/:code/question/:numb', (req, res) => {
    con.query(`SELECT * FROM question WHERE Professor_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined')
                    res.sendFile(path.join(__dirname, '../pages/professors/question_page.html'));
                else
                    res.redirect(`/professor/${req.params.id}/test/${req.params.code}`);
            }
        }
    );
});

professorsRouter.get('/:id/test/:code/question/:numb/info.json', (req, res) => {
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
});

professorsRouter.get('/:id/test/:code/question/:numb/delete', (req, res) => {
    con.query(`DELETE FROM question WHERE Professor_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`, err => {
        if (err)
            console.error(err);
    });

    con.query(`SELECT * FROM test WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
        function (err2, result) {
            if (err2)
                console.error(err2);
            else {
                con.query("UPDATE test SET Total_number_of_questions" + `='${result[0].Total_number_of_questions - 1}'` +
                    ` WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'`,
                    function (err3) {
                        if (err3)
                            console.error(err3);
                    }
                );
            }
        }
    );

    res.end();
});

professorsRouter.get('/:id/test/:code/question/:numb/edit', (req, res) => {
    con.query(`SELECT * FROM question WHERE Professor_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.sendFile(path.join(__dirname, '../pages/professors/question_edit_page.html'));
                } else {
                    res.redirect(`/professor/${req.params.id}/test/${req.params.code}`);
                }
            }
        }
    );
});

professorsRouter.post('/:id/test/:code/question/:numb/edit', (req, res) => {
    if (req.body.text !== "") {
        con.query("UPDATE question SET Question_text" + `='${req.body.text}'` +
            ` WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`, err => {
            if (err)
                console.error(err);
        });
    }

    let is_has_true_answer = false;
    let is_has_false_answer = false;
    let is_no_empty_answers = true;

    let answers = req.body.answers;
    for (let i = 0; i < answers.length; i++) {
        if (answers[i].is_correct_answer) {
            is_has_true_answer = true;
        }
        if (!answers[i].is_correct_answer) {
            is_has_false_answer = true;
        }
        if (answers[i].text === "") {
            is_no_empty_answers = false;
        }
        answers[i].is_correct_answer = answers[i].is_correct_answer ? 1 : 0;
    }

    if (is_no_empty_answers) {
        if (is_has_true_answer && is_has_false_answer) {
            for (let i = 0; i < answers.length; i++) {
                con.query("UPDATE answer SET Answer_text" + `='${answers[i].text}' WHERE Professor_id='${req.params.id}'` +
                    ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}' AND Answer_id='${answers[i].id}'`,
                    function (err) {
                        if (err)
                            console.error(err);
                    }
                );

                con.query("UPDATE answer SET Is_correct_answer" + `='${answers[i].is_correct_answer}' WHERE Professor_id='${req.params.id}'` +
                    ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}' AND Answer_id='${answers[i].id}'`,
                    function (err) {
                        if (err)
                            console.error(err);
                    }
                );
            }
            res.end();
        } else {
            res.status(400).json("Вопрос должен содержать хотя бы один правильный и один неправильный ответы");
        }
    } else {
        res.status(400).json("Каждый ответ не должен быть пустым");
    }
});

professorsRouter.get('/:id/test/:code/question/:numb/answers/info.json', (req, res) => {
    con.query(`SELECT * FROM answer WHERE Professor_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).send("Не найдены ответы на вопрос у теста преподавателя");
                }
            }
        }
    );
});

professorsRouter.post('/:id/test/:code/question/:numb/add/answer', (req, res) => {
    if (req.body.text !== "") {
        con.query("INSERT INTO answer (`Question_id`,`Test_id`,`Professor_id`, `Answer_text`, `Is_correct_answer`) "
            + `VALUES ('${req.params.numb}','${req.params.code}','${req.params.id}','${req.body.text}', '${req.body.is_correct_answer ? 1 : 0}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                } else {
                    con.query(`SELECT * FROM answer WHERE Answer_text='${req.body.text}' AND Professor_id='${req.params.id}'` +
                        ` AND Question_id='${req.params.numb}' AND Test_id='${req.params.code}' AND Is_correct_answer='${req.body.is_correct_answer ? 1 : 0}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                res.status(200).json(result[0]);
                            }
                        }
                    );
                }
            }
        );
    } else {
        res.status(400).json("Не введен текст ответа");
    }
});

professorsRouter.get('/:id/test/:code/question/:numb/answer/:vers/delete', (req, res) => {
    con.query(`DELETE FROM answer WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'` +
        ` AND Question_id='${req.params.numb}' AND Answer_id='${req.params.vers}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

professorsRouter.get('/:id/test/:code/question/:numb/answer/:vers/info.json', (req, res) => {
    con.query(`SELECT * FROM answer WHERE Professor_id='${req.params.id}' AND Test_id='${req.params.code}'` +
        ` AND Question_id='${req.params.numb}' AND Answer_id='${req.params.vers}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result[0]);
                } else {
                    res.redirect(`/professor/${req.params.id}/test/${req.params.code}/question/${req.params.numb}`);
                }
            }
        }
    );
});

module.exports = professorsRouter;