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
//import OpenAI from 'openai';
import fs from 'fs';
import hbs from 'hbs';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'));

/*
const openai = new OpenAI({
    apiKey: 
});
*/

app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(process.cwd()) + '/styles.css');
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
        fs.readFile('./py_output/script_output.json', 'utf8', (err, jsonString) => {
            if (err) {
                console.error('Error reading the file', err);
                return res.status(500).send('Failed to read JSON data.');
            }

            // Parse the JSON data
            const data = JSON.parse(jsonString);

            // Convert each object to a dictionary and add the index field
            for (let i = 0; i < data.length; i++) {
                data[i]["index"] = i + 1; // 1-based index
            }

            // Redirect to another route and pass the processed data as parameters
            // For simplicity, redirecting to '/next-route' with the first item's property address as an example.
            // Adjust as needed.
            res.render('insights', { insights: data});
        });
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

/*
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
    and the criticality of the property in a dictionary format with the following keys address, insight_statement, dashboard, and client_name.
      `;
    console.log("prompt is generated");
    const openaiResponse = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 2797,
    });
    console.log("prompt is sent to openai and came back with response");
    console.log(openaiResponse);
    const jsonResponse = JSON.stringify(openaiResponse.choices[0].text.trim());
    fs.writeFileSync('AI_output_1.json', jsonResponse);

    res.render('insights');

});
*/

/*
Analyze the property insights ${JSON.stringify(userLocationData)},
    dashboards that the user frequently visits ${JSON.stringify(userData["Dashboard"])},
    criticality of the property insights ${JSON.stringify(userLocationData["Criticality"])},
    and whether the user's role's responsibilities match the insights ${JSON.stringify(userRoleData["Duties"])}.
    Then generate the top 5 insights in meaningful sentences for the user to read 
    along with the info about which property the insight is referring to 
    and the criticality of the property in a JSON format.


    Drop the row if the insight category for that row is not mentioned in field names from ${JSON.stringify(userData["Dashboard"])}.

    Then rerank the insights by adding a bit more weight to higher criticalities, where critical is the highest valued. The output should be 
        in JSON file containing all the insights, and each insights should have the following fields in this order, "Rank", "Criticality_Level", 
        "Insight_Category", "Address", "Insight_Statements", "Client". For the statements, expand beyond driver provided 
        and write a longer statement while considering what the user's responsibilities in ${JSON.stringify(userRoleData)}. 
        Keep it under 10 to 15 words.


        Output the final json file after processing the entire prompt.

        Based on the Insight 1, Insight 2, and the Driver from ${JSON.stringify(userLocationData)} categorize each row from this file into a specific dashboard from one of these 
        dashboards: Asset Performance, Asset Valuation, Building Health, Client Accounts, Energy Usage, Equipment Health, Equipment Monitoring, Facility Utilization, 
        Investment Returns, Lease Expirations, Maintenance Schedules, New Leases, Occupancy Rate, Preventative Maintenance, Rent Collection, 
        Revenue Metrics, Work Order Completion, Work Order Status. 

        Arrange the remaining JSON objects
        in a JSON file, and each insights should have the following fields in this order, "Rank", "Criticality_Level", 
        "Insight_Category", "Address", "Insight_Statements", "Client". For the statements, expand beyond driver provided 
        and write a longer statement while considering what the user's responsibilities in ${JSON.stringify(userRoleData)}. 
        Keep it under 10 to 15 words.

        Only output the resulting JSON file with the rows in your response.
        Your reponse should be able to parsed by JSON.
*/

