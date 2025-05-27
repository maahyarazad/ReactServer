const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require("csv-stringify");
const path = require('path');
const cors = require('cors');
const multer = require('multer')
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const mime = require('mime-types');
const generateQRWithText = require('./services/qrGenerator');
const CSV_FILE = path.join(__dirname, 'forum-registration.csv');
const { sendEmail } = require('./services/emailService');
// Serve static files from the 'public' directory
//  app.use(express.static(path.join(__dirname, "public")));

//Route to serve your main HTML file
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // Catch-all route for React Router
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// app.all('/{*any}', (req, res, next) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// })

// app.get('/api/site-data', (req, res) => {


//     const lang = req.query.lang;


//     let filePath = path.join(__dirname, 'site-data.json');
//     if (lang === "DE") {
//         filePath = path.join(__dirname, 'site-data-de.json');
//     }

//     fs.readFile(filePath, 'utf-8', (err, data) => {
//         if (err) {
//             console.error('Error reading the file:', err);
//             // send back server error
//             return res.status(500).json({ error: 'Failed to read the file' });
//         }
//         try {
//             const jsonData = JSON.parse(data);
//             res.json(jsonData);
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//             return res.status(500).json({ error: 'Failed to parse JSON' });
//         }

//     })
// });


// app.post('/api/meeting-request', async (req, res) => {
//     const newRequest = req.body;
//     const filePath = path.join(__dirname, 'meeting-request.json');

//     // Read the existing file or initialize it
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         let requests = [];

//         if (!err && data) {
//             try {
//                 requests = JSON.parse(data);
//                 if (!Array.isArray(requests)) requests = [];
//             } catch (parseErr) {
//                 console.error('Failed to parse JSON:', parseErr);
//             }
//         }

//         requests.push(newRequest);

//         fs.writeFile(filePath, JSON.stringify(requests, null, 2), async (writeErr) => {
//             if (writeErr) {
//                 console.error('Failed to write file:', writeErr);
//                 return res.status(500).json({ message: 'Failed to save request.' });
//             }
//             res.status(200).json({ message: 'Meeting request saved successfully.' });
//         });
//     });
// });

// const upload = multer({
//     dest: path.join(__dirname, "/uploads")
// })


// app.post('/api/contact-us', upload.single('attachment'), async (req, res) => {

//     try {
//         const filePath = path.join(__dirname, 'request-data.json');
//         if (!fs.existsSync(filePath)) {
//             fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
//         }

//         let attachment = null;
//         const { name, email, message } = req.body;

//         if (req.file !== undefined && req.file !== null) {
//             attachment = {
//                 originalName: req.file.originalname,
//                 storedName: req.file.filename,
//                 mimetype: req.file.mimetype,
//                 size: req.file.size,
//             };
//         }


//         const newEntry = {
//             name,
//             email,
//             message,
//             attachment,
//             timestamp: new Date().toISOString()
//         };

//         const data = fs.readFileSync(filePath, 'utf-8');
//         const requestData = JSON.parse(data);
//         requestData.push(newEntry);
//         fs.writeFileSync(filePath, JSON.stringify(requestData, null, 2), 'utf-8');

//         const fileName = path.basename(filePath);
//         const contentType = mime.lookup(filePath);
//         try {
//             await sendEmailWithAttachment({
//                 to: "maahyarazad@gmail.com",
//                 subject: "Project Request",
//                 html: `<div>${newEntry.message}</div>`,
//                 attachments: [
//                     {
//                         filename: req.file.originalname,
//                         path: filePath,
//                         contentType: contentType,
//                     },
//                 ],
//             });
//             res.send("Email sent!");
//         } catch (error) {
//             console.error(error);
//             res.status(500).send("Failed to send email");
//         }

//         return res.status(201).json({ message: 'Your request created. Thank you for reaching out to us.' });

//     } catch (err) {
//         return res.status(500).json({ error: err })
//     }

// });

// const CSV_FILE = path.join(__dirname, 'forum-registration.csv');


// CSV write endpoint
app.post('/api/forum-registration', async (req, res) => {

    const request = { ...req.body, attended: false };
    const headers = Object.keys(request);
    const values = Object.values(request);

    try {



        if (!fs.existsSync(CSV_FILE)) {
            const writableStream = fs.createWriteStream(CSV_FILE);
            const stringifier = stringify({ header: true, columns: headers });
            stringifier.pipe(writableStream);
            stringifier.write(values);
            stringifier.end();
            await generateQRWithText(req.body, path);
            await sendEmail({ reqBody: req.body });
            return res.status(200).json({ message: 'Forum registration saved as CSV.' });


        } else {

            let duplicateRequest = false;

            fs.createReadStream(CSV_FILE)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.email === req.body.email) {
                        duplicateRequest = true;
                    }
                }).on('end', async () => {
                    if (duplicateRequest) {
                        return res.status(409).json({ message: 'Duplicate record found' });
                    }

                    const writableStream = fs.createWriteStream(CSV_FILE, { flags: 'a' });
                    const stringifier = stringify({ header: false, columns: headers });
                    stringifier.pipe(writableStream);
                    stringifier.write(values);
                    stringifier.end();
                    await generateQRWithText(req.body, path);
                    await sendEmail({ reqBody: req.body });
                    return res.status(200).json({ message: 'Forum registration saved as CSV.' });

                });
        }

    } catch (err) {
        console.error('CSV save error:', err);
        res.status(500).json({ message: 'Failed to save registration.' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
