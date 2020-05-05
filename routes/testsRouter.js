const path = require('path');
const express = require('express');
const mysql = require('mysql');

const testsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "knowledge_verification_service"
});

con.connect(err => err ? console.error(err) : console.log("TestsRouter connected to MySQL database!"));

testsRouter.get('/:id', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Test_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.sendFile(path.join(__dirname, '../pages/tests/test_page.html'));
                    else
                        res.redirect('/tests');
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

testsRouter.get('/:id/info.json', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Test_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined')
                        res.status(200).json(result[0]);
                    else
                        res.redirect('/tests');
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

testsRouter.get('/:id/delete', (req, res) => {
    con.query(`DELETE FROM test WHERE Test_id='${req.params.id}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

testsRouter.get('/:id/edit', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        con.query(`SELECT * FROM test WHERE Test_id='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__dirname, '../pages/tests/test_edit_page.html'));
                    } else {
                        res.redirect('/tests');
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
    }
});

testsRouter.post('/:id/edit', (req, res) => {
    let f = true;

    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            f = false;
            res.status(500).json("Недопустимый логин: admin");
        } else {
            con.query("UPDATE test SET Login" + `='${req.body.login}' WHERE Test_id='${req.params.id}'`, err => {
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
                con.query("UPDATE test SET First_name" + `='${req.body.firstName}' WHERE Test_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.secondName !== "") {
                con.query("UPDATE test SET Second_name" + `='${req.body.secondName}' WHERE Test_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }

            if (req.body.password !== "") {
                con.query("UPDATE test SET Password" + `='${req.body.password}' WHERE Test_id='${req.params.id}'`, err => {
                    if (err)
                        console.error(err);
                });
            }
        }

        setAllFiels().then(res.end());
    }
});

module.exports = testsRouter;