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
                        res.status(404).send("Не найдены тесты");
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
                        res.sendFile(path.join(__dirname, '../pages/students/student_test_page.html'));//TODO добавить
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
        res.sendFile(path.join(__dirname, '../pages/students/add_student_test_page.html')); //TODO добавить
    } else {
        res.redirect('/login');
    }
});

studentsRouter.post('/:id/add/test', (req, res) => {
    if (req.body.number !== "") {
        con.query("INSERT INTO student_test (`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`, `Number_of_questions_in_test`) "
            + `VALUES ('${req.body.attempt}','${req.params.id}', '${req.body.testId}', '${req.body.professorId}', '${req.body.number}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                    res.status(400).json("Копия имеющегося теста у студента");
                } else {
                    res.end();
                }
            }
        );
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
}); //TODO решить насчет удаления попытки решения теста у студента

module.exports = studentsRouter;