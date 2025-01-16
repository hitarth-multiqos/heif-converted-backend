const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

// Define the directory where the zip files are stored
const zipDirectory = path.join(__dirname, "public/uploads");

// Function to delete old zip files
const deleteOldZipFiles = () => {
    try {
        fs.readdir(zipDirectory, (err, files) => {
            if (err) {
                console.error("Error reading directory:", err);
                return;
            }

            const currentTime = Date.now();

            files.forEach((file) => {
                const filePath = path.join(zipDirectory, file);
                const fileStat = fs.statSync(filePath);
                const fileAgeInMinutes = (currentTime - fileStat.mtimeMs) / 1000 / 60;

                // If the file is older than 10 minutes, delete it
                if (fileAgeInMinutes > 10 && file.endsWith(".zip")) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log(`Deleted old file: ${file}`);
                        }
                    });
                }
            });
        });
    } catch (err) {
        console.log(`Error(deleteOldZipFiles)`, err);
    }
};

// Schedule the cron job to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
    console.log("Running cron job to delete old zip files...");
    deleteOldZipFiles();
});
