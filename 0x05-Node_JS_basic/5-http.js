#!/usr/bin/node

const http = require('http');
const fs = require('fs');

function countStudents(path) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path)) {
      reject(new Error('Cannot load the database'));
    }

    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      reject(new Error('The CSV file is empty'));
    }

    const headers = lines.shift().split(',');
    if (headers.length !== 4 || !headers.includes('firstname') || !headers.includes('lastname') || !headers.includes('age') || !headers.includes('field')) {
      reject(new Error('The CSV file has an invalid format'));
    }

    const studentsByField = {};
    lines.forEach((line) => {
      const [firstname, lastname, age, field] = line.split(',');
      if (!studentsByField[field]) {
        studentsByField[field] = [];
      }
      studentsByField[field].push(`${firstname} ${lastname}`);
    });

    resolve(studentsByField);
  });
}

const hostname = 'localhost';
const port = 1245;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello Holberton School!\n');
  } else if (req.url === '/students') {
    countStudents('database.csv')
      .then((studentsByField) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.write('This is the list of our students\n');
        Object.entries(studentsByField).forEach(([field, students]) => {
          res.write(`Number of students in ${field}: ${students.length}. List: ${students.join(', ')}\n`);
        });
        res.end();
      })
      .catch((error) => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(error.message + '\n');
      });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
