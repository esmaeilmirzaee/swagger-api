const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const booksRouter = require('./routes/books');

var PORT = process.env.PORT || 8080;

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapters = new FileSync('db.json');
const db = low(adapters);

if (!db.get('books')) {
    db.defaults({ books: [] }).write();
}

app.db = db;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Swagger Simple API',
            description: '',
        },
        servers: [{ url: 'http://localhost:8080' }],
    },
    apis: ['./routes/*.js'],
};

let specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/books', booksRouter);

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}.`);
});
