// import
const express = require('express');
const morgan = require('morgan');

const sqlite = require('sqlite3');

// init
const app = express();
const port = 3000;

const db = new sqlite.Database('exams.db', (err) => console.error(err) );

// set up the middleware
app.use(morgan('tiny'));

// every requests body will be considered in JSON format
app.use(express.json());

// === REST API (course, exam) === //

// GET /courses
// Get all courses
// Request body: empty
// Response body: array of objects representing all the courses
app.get('/courses', (req, res) => {
    // read from database all the courses
    const sql = 'SELECT * FROM course';
    db.all(sql, (err, rows) => {
        if(err)
            throw err;

        const courses = rows.map((row) => ({
            code: row.code,
            name: row.name,
            credits: row.CFU
        }) );
        // ANOTHER EXAMPLE: const courses = rows.map((row) => (row.code));

        // finally, provide a response in JSON
        res.json(courses);
    });
});


// GET /courses/:code
// Get a course, given its code
// Request body: empty
// Example: GET /courses/MF0158
// Response body: { "code": "MF0158", "name": "Basi di dati e sistemi informativi", "CFU": 9 }
// Error: 404, {"error": "Il corso non esiste"}
app.get('/courses/:code', (req, res) => {
    const courseCode = req.params.code;
    const sql = 'SELECT * FROM course WHERE code=?';

    db.get(sql, [courseCode], (err, row) => {
        if(err)
            throw err;
        if(row) {
            res.json({code: row.code, name: row.name, credits: row.CFU});
        }
        else {
            // the selected course does not exist
            res.status(404).json({error: 'Il corso non esiste'});
        }
    });
});

// POST /exams
// Create a new exam
// Request body: { "code": "MF0158", "score": "30", "date": "2020-02-16" }
// No response body
app.post('/exams', (req, res) => {
    const code = req.body.code;
    const score = req.body.score;
    const date = req.body.date;

    const sql = 'INSERT INTO exam(course_code, date, score) VALUES(?, DATE(?), ?)';

    db.run(sql, [code, date, score], (err) => {
        if(err)
            throw err;
        
        res.end();
    });

});


// GET /exams
// Get all the exams


// activate the server
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));