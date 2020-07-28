let mocha = require('mocha');
let chai = require('chai');
let chaiHttp = require('chai-http');
const express = require('express');
let app = require('../app.js');
let should = chai.should();

chai.use(chaiHttp)

describe('Автоматическое тестирование веб-сервиса', () => {
    let testStudentId = 1;
    let testProfessorId = 1;
    let testTestId = 1;
    let testQuestionId = 1;
    let testAnswerId = 3;
    let testAttemptNumber = 1;
    let testNumberOfQuestionsInTest = 0;

    describe('Проверка добавления сущностей', () => {
        it('Проверка добавления студента', (done) => {
            let studentData = {
                firstName: "studentName",
                secondName: "studentSurname",
                studentGroup: "studGroup"
            };
            chai.request(app)
                .post('/add/student')
                .send(studentData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    testStudentId = res.body.Student_id;
                    done();
                })
        });
        it('Проверка добавления преподавателя', (done) => {
            let professorData = {
                firstName: "professorName",
                secondName: "professorSurname"
            };
            chai.request(app)
                .post('/add/professor')
                .send(professorData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    testProfessorId = res.body.Professor_id;
                    done();
                })
        });
        it('Проверка добавления теста', (done) => {
            let testData = {
                title: "testTitle",
                subject: "testSubject",
                percent: "66"
            };
            chai.request(app)
                .post(`/professor/${testProfessorId}/add/test`)
                .send(testData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    testTestId = res.body.Test_id;
                    done();
                })
        });
        it('Проверка добавления вопроса', (done) => {
            let questionData = {
                text: "testTitle",
                answers: [{text: "answerText1", is_correct_answer: true},
                    {text: "answerText2", is_correct_answer: false}]
            };
            chai.request(app)
                .post(`/professor/${testProfessorId}/test/${testTestId}/add/question`)
                .send(questionData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    testQuestionId = res.body.Question_id;
                    testNumberOfQuestionsInTest++;
                    done();
                })
        });
        it('Проверка добавления ответа', (done) => {
            let answerData = {
                text: "answerText3",
                is_correct_answer: true
            };
            chai.request(app)
                .post(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/add/answer`)
                .send(answerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    testAnswerId = res.body.Answer_id;
                    done();
                })
        });
        it('Проверка добавления теста студента', (done) => {
            let testData = {
                attempt: testAttemptNumber,
                testId: testTestId,
                professorId: testProfessorId,
                createdById: testProfessorId,
                number: testNumberOfQuestionsInTest
            };
            chai.request(app)
                .post(`/student/${testStudentId}/add/test`)
                .send(testData)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        });
    });

    describe('Доступ ко всем страницам по /GET', () => {
        describe('Проверка страниц общих действий', () => {
            it('Проверка страницы входа', (done) => {
                chai.request(app)
                    .get('/login')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы выхода', (done) => {
                chai.request(app)
                    .get('/logout')
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы действий', (done) => {
                chai.request(app)
                    .get('/actions')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe('Проверка страниц, связанных со студентами', () => {
            it('Проверка страницы списка студентов', (done) => {
                chai.request(app)
                    .get('/students')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы добавления студента', (done) => {
                chai.request(app)
                    .get('/add/student')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы изменения информации о студенте', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/edit`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe('Проверка страниц, связанных с преподавателями', () => {
            it('Проверка страницы списка преподавателей', (done) => {
                chai.request(app)
                    .get('/professors')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы добавления преподавателя', (done) => {
                chai.request(app)
                    .get('/add/professor')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы преподавателя', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы изменения информации о преподавателе', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/edit`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe('Проверка страниц, связанных с тестами', () => {
            it('Проверка страницы списка тестов', (done) => {
                chai.request(app)
                    .get('/tests')
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы добавления теста', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/add/test`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы теста', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы изменения информации о тесте', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/edit`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы добавления вопроса', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/add/question`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы вопроса', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы изменения информации о вопросе', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/edit`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe('Проверка страниц, связанных с тестами студентов', () => {
            it('Проверка страницы для добавления студента к тесту', (done) => {
                chai.request(app)
                    .get(`/add/student/professor/${testProfessorId}/test/${testTestId}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы для добавления теста к студенту', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/add/test`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы теста студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
            it('Проверка страницы отображения вопроса при решении теста студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/question/${testQuestionId}`)
                    .end((err, res) => {
                        res.should.have.header('Content-Type', 'text/html; charset=UTF-8');
                        res.should.have.status(200);
                        done();
                    });
            });
        });
    });

    describe('Проверка запросов на получение информации', () => {
        describe('Проверка запросов общих действий', () => {
            it('Проверка получения информации о сессии', (done) => {
                chai.request(app)
                    .get('/session/info.json')
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe('Проверка запросов, связанных со студентами', () => {
            it('Проверка получения информации о списке студентов', (done) => {
                chai.request(app)
                    .get('/students/all.json')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о студенте', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });

        describe('Проверка запросов, связанных с преподавателями', () => {
            it('Проверка получения информации о списке преподавателей', (done) => {
                chai.request(app)
                    .get('/professors/all.json')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о преподавателе', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });

        describe('Проверка запросов, связанных с тестами', () => {
            it('Проверка получения информации о списке тестов', (done) => {
                chai.request(app)
                    .get('/tests/all.json')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о тестах преподавателя', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/tests/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о тесте', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
            it('Проверка получения информации о вопросах в тесте', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/questions/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о вопросе', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
            it('Проверка получения информации об ответах в вопросе', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/answers/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации об ответе', (done) => {
                chai.request(app)
                    .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/answer/${testAnswerId}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });

        describe('Проверка запросов, связанных с тестами студентов', () => {
            it('Проверка получения информации о тестах студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/tests/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о тесте студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
            it('Проверка получения информации о вопросах в тесте студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/questions/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка получения информации о вопросе студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/question/${testQuestionId}/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        done();
                    });
            });
            it('Проверка получения информации об ответах в вопросе студента', (done) => {
                chai.request(app)
                    .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/question/${testQuestionId}/answers/info.json`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
        });
    });

    describe('Проверка выполнения POST-запросов', () => {
        describe('Проверка общих действий', () => {
            it('Проверка входа в приложение', (done) => {
                let userData = {
                    username: "admin",
                    password: "admin",
                };
                chai.request(app)
                    .post('/login')
                    .send(userData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe('Проверка действий, связанных со студентами', () => {
            it('Проверка поиска студента в списке студентов', (done) => {
                let studentData = {
                    firstName: "studentName",
                    secondName: "studentSurname",
                    studentGroup: "studGroup"
                };
                chai.request(app)
                    .post('/students')
                    .send(studentData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка изменения информации о студенте', (done) => {
                let studentEditData = {
                    firstName: "studentNameEdited",
                    secondName: "studentSurnameEdited",
                    studentGroup: "",
                    login: "",
                    password: ""
                };
                chai.request(app)
                    .post(`/student/${testStudentId}/edit`)
                    .send(studentEditData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
        });

        describe('Проверка действий, связанных с преподавателями', () => {
            it('Проверка поиска преподавателя в списке преподавателей', (done) => {
                let professorData = {
                    firstName: "professorName",
                    secondName: "professorSurname"
                };
                chai.request(app)
                    .post('/professors')
                    .send(professorData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка изменения информации о преподавателе', (done) => {
                let professorEditData = {
                    firstName: "professorNameEdited",
                    secondName: "professorSurnameEdited",
                    login: "",
                    password: ""
                };
                chai.request(app)
                    .post(`/professor/${testProfessorId}/edit`)
                    .send(professorEditData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
        });

        describe('Проверка действий, связанных с тестами', () => {
            it('Проверка поиска теста в списке тестов', (done) => {
                let testData = {
                    professorId: testProfessorId,
                    title: "testTitle",
                    subject: "testSubject"
                };
                chai.request(app)
                    .post('/tests')
                    .send(testData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    });
            });
            it('Проверка изменения информации о тесте', (done) => {
                let testEditData = {
                    title: "testTitleEdited",
                    subject: "testSubjectEdited",
                    percent: "50"
                };
                chai.request(app)
                    .post(`/professor/${testProfessorId}/test/${testTestId}/edit`)
                    .send(testEditData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
            it('Проверка изменения информации о вопросе', (done) => {
                let questionEditData = {
                    text: "",
                    answers: [{text: "answerTextEdited1", is_correct_answer: true},
                        {text: "answerTextEdited2", is_correct_answer: false},
                        {text: "answerTextEdited3", is_correct_answer: true}]
                };
                chai.request(app)
                    .post(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/edit`)
                    .send(questionEditData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
        });

        describe('Проверка действий, связанных с тестами студентов', () => {
            it('Проверяется определение правильности ответа на вопрос', (done) => {
                let questionData = {
                    answers: [{sel: true, id: testAnswerId - 2},
                        {sel: false, id: testAnswerId - 1},
                        {sel: false, id: testAnswerId}]
                };
                chai.request(app)
                    .post(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/question/${testQuestionId}/solve`)
                    .send(questionData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
            it('Проверяется определение количества правильных ответов в тесте', (done) => {
                let testData = {correct_answers: 0};
                chai.request(app)
                    .post(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/solve`)
                    .send(testData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
        });
    });

    describe('Проверка удаления сущностей', () => {
        it('Проверка удаления теста студента', (done) => {
            chai.request(app)
                .get(`/student/${testStudentId}/test/${testTestId}/${testAttemptNumber}/delete`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('Проверка удаления ответа', (done) => {
            chai.request(app)
                .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/answer/${testAnswerId}/delete`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('Проверка удаления вопроса', (done) => {
            chai.request(app)
                .get(`/professor/${testProfessorId}/test/${testTestId}/question/${testQuestionId}/delete`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('Проверка удаления теста', (done) => {
            chai.request(app)
                .get(`/professor/${testProfessorId}/test/${testTestId}/delete`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('Проверка удаления преподавателя', (done) => {
            chai.request(app)
                .get(`/professor/${testProfessorId}/delete`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('Проверка удаления студента', (done) => {
            chai.request(app)
                .get(`/student/${testStudentId}/delete`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});