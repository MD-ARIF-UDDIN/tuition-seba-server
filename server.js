const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Path to your service account key file
const KEY_PATH = path.join(__dirname, 'artful-fortress-449217-c9-be5d7a4ab155.json');
const SPREADSHEET_ID = '10w6b7civ7e911eFwU-eNusjKJTawgTfLT2PpqXfOnK8'; // Replace with your Google Sheet ID

const app = express();
app.use(cors());
app.use(bodyParser.json());


const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Get all rows from Google Sheets
app.get('/api/sheets', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1', // Adjust the range as needed
        });
        res.json(response.data.values); // Send the data back
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
    }
});

// Add a new row to the Google Sheet
app.post('/api/sheets', async (req, res) => {
    const { values } = req.body;  // Data to be added
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1',
            valueInputOption: 'RAW',
            resource: {
                values: [values],
            },
        });
        res.json(response); // Send response back
    } catch (error) {
        res.status(500).json({ error: 'Failed to add row to Google Sheets' });
    }
});

// Update a specific row in Google Sheets
app.put('/api/sheets', async (req, res) => {
    const { rowIndex, values } = req.body;  // Row index and values to update
    const range = `Sheet1!A${rowIndex}:Z${rowIndex}`;
    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'RAW',
            resource: {
                values: [values],
            },
        });
        res.json(response); // Send response back
    } catch (error) {
        res.status(500).json({ error: 'Failed to update row in Google Sheets' });
    }
});

// Delete a specific row from Google Sheets
app.delete('/api/sheets', async (req, res) => {
    const { rowIndex } = req.body;  // Row index to delete
    try {
        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteRange: {
                            range: {
                                sheetId: 0, // Default sheetId (adjust if needed)
                                startRowIndex: rowIndex,
                                endRowIndex: rowIndex + 1,
                            },
                            shiftDimension: 'ROWS',
                        },
                    },
                ],
            },
        });
        res.json(response); // Send response back
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete row from Google Sheets' });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
