const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const hbs = require('hbs');

const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/styles.cssnp');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/runscript/:userEmail', (req, res) => {
    const userEmail = req.params.userEmail;

    exec(`python path_to_script.py ${userEmail}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error executing the script.');
        }
        res.send(`Script output: ${stdout}`);
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
