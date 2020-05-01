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

professorsRouter.get('/:id/delete', (req, res) => {
    if (req.session.user.type === 'admin') {
        con.query(`DELETE FROM professor WHERE Professor_id='${req.params.id}'`, err => {
            if (err)
                console.error(err);
            else
                res.end();
        });
    } else
        res.redirect('/professors');
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
            res.status(500).json("Недопустимый логин: admin");
        } else {
            con.query("UPDATE professor SET Login" + `='${req.body.login}' WHERE Professor_id='${req.params.id}'`, err => {
                if (err) {
                    console.error(err);
                    f = false;
                    res.status(500).json("Копия имеющегося преподавателя");
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

module.exports = professorsRouter;