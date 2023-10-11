/*const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const path = require('path');
const OpenAIApi = require('openai');
const fs = require('fs');
const hbs = require('hbs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
*/
import express from 'express';
import { exec } from 'child_process';
import bodyParser from 'body-parser';
import path from 'path';
import OpenAI from 'openai';
import fs from 'fs';
import hbs from 'hbs';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'));

const openai = new OpenAI({
    apiKey: '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'
});

app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile( path.join(process.cwd()) + '/styles.css');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/runscript', (req, res) => {
    const userEmail = req.body.email;

    exec(`python isolate_data.py ${userEmail}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error executing the script.');
        }
        console.log("python file has executed, now redirecting to analyze");
        res.redirect('/analyze');
    });
});

app.get('/insights', (req, res) => {
    res.render('insights');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.get('/analyze', async (req, res) => {
    console.log("analyze is being called");
    const userData = JSON.parse(fs.readFileSync('py_output/user_data.json', 'utf8'));
    const userRoleData = JSON.parse(fs.readFileSync('py_output/user_role_data.json', 'utf8'));
    const userLocationData = JSON.parse(fs.readFileSync('py_output/user_location_data.json', 'utf8'));

    console.log("json files are read inside analyze route");
    // Construct your prompt using the data
    const prompt = `
    Analyze the property insights ${JSON.stringify(userLocationData)},
    dashboards that the user frequently visits ${JSON.stringify(userData["Dashboard"])},
    criticality of the property insights ${JSON.stringify(userLocationData["Criticality"])},
    and whether the user's role's responsibilities match the insights ${JSON.stringify(userRoleData["Duties"])}.
    Then generate the top 5 insights in meaningful sentences for the user to read 
    along with the info about which property the insight is referring to 
    and the criticality of the property in a JSON format.
      `;
    console.log("prompt is generated");
    const openaiResponse = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 1000,
    });
    console.log("prompt is sent to openai and came back with response");
    console.log(openaiResponse);
    fs.writeFileSync('py_output/openai_response.json', JSON.stringify(openaiResponse.data.choices[0].text.trim()));

    res.render('insights', { insights: openaiResponse.data.choices[0].text.trim() });

});
//narani ramesh - cbre


/*Given a user with the following data:
${JSON.stringify(userData)}
Role and responsibilities:
${JSON.stringify(userRoleData)}
Properties and criticality:
${JSON.stringify(userLocationData)}
Analyze the property insights, dashboards that the user frequently visits, criticality of the property insights, 
and whether the user's role's resposibilities match the insights.
Then generate the top 5 insights in meaningful sentences for the user to read along with the info about the which property 
the insight is referring to and the criticality of the property in a JSON format.
*/

