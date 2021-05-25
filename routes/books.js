const express = require('express');
const { nanoid } = require('nanoid');
const router = express.Router();

const idLength = 8;

/**
 * @swagger
 *  components:
 *      schemas:
 *          Book:
 *              type: object
 *              required:
 *                  - title
 *                  - author
 *              properties:
 *                  id:
 *                      type: string
 *                      description: The auto-generated id.
 *                  title:
 *                      type: string
 *                      description: Title of the book
 *                  author:
 *                      type: string
 *                      description: The author of the book
 *              example:
 *                  id: 5d_12s
 *                  title: Make it happen
 *                  author: John Doe
 */

/**
 * @swagger
 * tags:
 *  name: Books
 *  description: Manages all APIs that are related to books
 */

/**
 * @swagger
 * /books:
 *  get:
 *      summary: Returns all registered books
 *      tags: [Books]
 *      responses:
 *          200:
 *              description: The list of the books
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Book'
 */
router.route('/').get((req, res) => {
    res.send(req.app.db.get('books'));
});

/**
 * @swagger
 * /books/{id}:
 *  get:
 *      summary: Returns the book by id
 *      tags: [Books]
 *      parameters:
 *          - in: path
 *            name: id
 *            schemas:
 *              type: string
 *            required: true
 *            description: The book id
 *      responses:
 *          200:
 *            description: The book description by id
 *            contents:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Book'
 *          404:
 *            description: The book was not found
 */
router.route('/:id').get((req, res) => {
    try {
        res.send(req.app.db.get('books').find({ id: req.params.id }).value());
    } catch (error) {
        res.status(406).send({ error });
    }
});

/**
 * @openapi
 * /books:
 *  post:
 *      summary: Create a new book
 *      tags: [Books]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Book'
 *      responses:
 *          200:
 *              description: The book was successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Book'
 *          406:
 *              description: The received data is unacceptable
 */

router.route('/').post((req, res) => {
    try {
        let book = {
            id: nanoid(idLength),
            title: req.body.title,
            author: req.body.author,
        };

        req.app.db.get('books').push(book).write();
        res.send({ book });
    } catch (error) {
        res.status(406).send({ error });
    }
});

/**
 * @swagger
 * /books/{id}:
 *  put:
 *      summary: Update the book by id
 *      tags: [Books]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The book id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Book'
 *      responses:
 *          200:
 *              description: The book was updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Book'
 *          406:
 *              description: The provided data is unacceptable
 *          500:
 *              description: Some error happened
 */

router.route('/:id').put((req, res) => {
    try {
        req.app.db
            .get('books')
            .find({ id: req.params.id })
            .assign(req.body)
            .write();
        res.send({
            [req.params.id]: req.app.db
                .get('books')
                .find({ id: req.params.id })
                .value(),
        });
    } catch (error) {
        res.status(406).send({ error: error.message });
    }
});

/**
 * @swagger
 * /books/{id}:
 *  delete:
 *      summary: Delete a book
 *      tags: [Books]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *              required: true
 *              description: The book id
 *      responses:
 *          203:
 *              description: The book was deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Book'
 *          406:
 *              description: The provided data is unacceptable
 */

router.route('/:id').delete((req, res) => {
    try {
        req.app.db.get('books').remove({ id: req.params.id }).write();
        res.status(203).send({ message: 'Successful' });
    } catch (error) {
        res.status(406).send({ error: error.message });
    }
});

module.exports = router;
