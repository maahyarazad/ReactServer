const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer')
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;



app.get('/api/site-data', (req, res) => {
    

    const lang = req.query.lang;


    let filePath = path.join(__dirname, 'site-data.json');
    
    if(lang === "DE"){
        filePath = path.join(__dirname, 'site-data-de.json');
    }
    
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

app.post('/api/contact-us', upload.single('attachment'), (req, res) => {
    
    try {
        const filePath = path.join(__dirname, 'request-data.json');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
        }

        let attachment = null;
        const { name, email, message } = req.body;

        if (req.file !== undefined && req.file !== null) {
            attachment = {
                originalName: req.file.originalname,
                storedName: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
            };
        }


        const newEntry = {
            name,
            email,
            message,
            attachment,
            timestamp: new Date().toISOString()
        };

        const data = fs.readFileSync(filePath, 'utf-8');
        const requestData = JSON.parse(data);
        requestData.push(newEntry);
        fs.writeFileSync(filePath, JSON.stringify(requestData, null, 2), 'utf-8');

        return res.status(201).json({ message: 'Your request created. Thank you for reaching out to us.' });
        
    } catch (err) {
        return res.status(500).json({error: err})  
    }

});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
