const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer')
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;



app.get('/api/site-data', (req, res) => {
    const filePath = path.join(__dirname, 'site-data.json');

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            // send back server error
            return res.status(500).json({ error: 'Failed to read the file' });
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return res.status(500).json({ error: 'Failed to parse JSON' });
        }

    })
});


const upload = multer({
    dest: path.join(__dirname, "/uploads")
})
app.post('/api/contact-us', upload.array('attachment'), (req, res) => {
    const filePath = path.join(__dirname, 'request-data.json');


    const { name, email, message } = req.body;
    const attachment = req.files.map(file => ({
        originalName: file.originalname,
        storedName: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
    }));

    const newEntry = {
        name,
        email,
        message,
        attachment,
        timestamp: new Date().toISOString()
    };

    // Ensure the file exists or create it
    fs.readFile(filePath, 'utf-8', (err, data) => {
        let entries = [];

        if (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, create it
                entries = [newEntry];
            } else {
                return res.status(500).json({ error: 'Failed to read data.json' });
            }
        } else {
            try {
                entries = JSON.parse(data);
                if (!Array.isArray(entries)) entries = [];
                entries.push(newEntry);
            } catch (error) {
                return res.status(500).json({ error: 'Corrupted data.json file' });
            }
        }

        
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
