const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const actionsRouter = require('./routes/actionsRouter');
const studentsRouter = require('./routes/studentsRouter');
const professorsRouter = require('./routes/professorsRouter');

const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'knowledge_verification_service',
    schema: {
        tableName: 'userSession',
        columnNames: {
            session_id: 'sessionId',
            expires: 'expires',
            data: 'data'
        }
    }
};

const sessionStore = new MySQLStore(options);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use('/', actionsRouter);
app.use('/student', studentsRouter);
app.use('/professor', professorsRouter);

module.exports = app;
