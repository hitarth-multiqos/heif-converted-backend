const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const archiver = require('archiver');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }))

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads',
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  })
});

// Serve static files from 'public' folder
const publicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(publicDirectoryPath));

// Optional: if you need to serve files from a subfolder, like 'uploads'
app.use('/public/uploads', express.static(path.join(publicDirectoryPath, 'uploads')));

// Example route to test serving a file
app.get('/', (req, res) => {
  res.status(200).send('Health check Ok!');
});

// Endpoint to handle image uploads
app.post('/convert', upload.array('images', 100), async (req, res) => {
  try {
    console.log('Uploaded files:', req.files);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    let zipName = 'converted_images' + Date.now() + '.zip'
    const convertedFiles = [];
    const outputZipPath = path.join(__dirname, 'public/uploads/', zipName);

    // Convert all uploaded images
    for (const file of req.files) {
      const uploadedFilePath = path.join(__dirname, 'public/uploads', file.filename);
      const outputFilePath = uploadedFilePath.replace(path.extname(uploadedFilePath), '.jpg');
      const pythonScriptPath = path.join(__dirname, 'convert_images.py');

      if (['.heic', '.heif'].includes(path.extname(uploadedFilePath).toLowerCase())) {
        console.log(`Converting: ${uploadedFilePath}`);

        const command = `python3 ${pythonScriptPath} "${uploadedFilePath}"`;
        await execPromise(command);  // Convert using Python script

        // After conversion, add the converted file path to the list for zipping
        convertedFiles.push(outputFilePath);
      } else {
        // If not HEIC/HEIF, simply add the original file to the list
        convertedFiles.push(uploadedFilePath);
      }
    }

    // Create a zip file containing all converted images
    const zipStream = archiver('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(outputZipPath);

    zipStream.pipe(output);

    convertedFiles.forEach((file) => {
      zipStream.file(file, { name: path.basename(file) });
    });

    zipStream.finalize();

    // Send the zip file URL as response
    output.on('close', () => {
      console.log(`Zip file created: ${outputZipPath}`);

      // Clean up uploaded files
      req.files.forEach(file => {
        fs.unlinkSync(path.join(__dirname, 'public/uploads', file.filename)); // Delete original file
      });

      convertedFiles.forEach(file => {
        fs.unlinkSync(file); // Delete converted file
      });

      res.json({
        message: 'Images converted and zipped successfully.',
        // downloadUrl: 'http://localhost:3000/public/uploads/' + zipName
        downloadUrl: 'https://fefd-2401-4900-8898-4912-395b-13dc-a7f8-caa1.ngrok-free.app/public/uploads/' + zipName
      });
    });

  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
