// Erforderliche Module
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');

require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1'
});

// Express-Anwendung wird erstellt
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Funktion zur Verbindung mit MongoDB
mongoose.connect("mongodb+srv://flamur:12345@cluster.vemnqk7.mongodb.net/?retryWrites=true&w=majority");

// "User" erstellen mit MongoDB
const User = mongoose.model("User", {
  username: String,
  password: String
});

// Multer-Konfiguration für Bilduploads
const upload = multer({ dest: 'uploads/' });

// Die Startseite
app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home</title>
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        <style>
            .container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 70vh;
            }
            .button-container {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="text-center mb-4 display-4">Willkommen</h1>
            <div class="button-container">
                <button class="btn btn-primary mr-3" onclick="window.location.href='/register'">Registrieren</button>
                <button class="btn btn-primary" onclick="window.location.href='/login'">Login</button>
            </div>
        </div>
    </body>
    </html>`;
  res.send(html);
});

// register.html mit dem Server verbinden
app.get("/register", function (req, res) {
  res.sendFile("register.html", { root: "./" });
});

// login.html mit dem Server verbinden
app.get("/login", function (req, res) {
  res.sendFile("login.html", { root: "./" });
});

// Registrierung von "User"
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashedPassword });

  // Ordner im S3-Bucket für den Benutzer erstellen
  const params = {
    Bucket: 'flamursbucket',
    Key: username + '/',
    ACL: 'private', // Nur der Benutzer kann auf seinen Ordner zugreifen
    Body: ''
  };
  s3.putObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Successful</title>
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        <style>
            .container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 70vh;
            }
            .button-container {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="text-center mb-4 display-4">Registrierung erfolgreich</h1>
            <div class="button-container">
                <a href="/login" class="btn btn-primary">Zum Login</a>
            </div>
        </div>
    </body>
    </html>`;
  res.send(html);
});

// Login von "User"
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Successful</title>
            <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 70vh;
                }
                .button-container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center mb-4 display-4">Login erfolgreich</h1>
                <div class="button-container">
                    <a href="/upload?username=${username}" class="btn btn-primary">Bilder hochladen</a>
                </div>
            </div>
        </body>
        </html>`;
      res.send(html);
    } else {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Failed</title>
            <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 70vh;
                }
                .button-container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center mb-4 display-4">Falscher Benutzername oder Passwort</h1>
                <div class="button-container">
                    <a href="/login" class="btn btn-primary">Versuche erneut</a>
                </div>
            </div>
        </body>
        </html>`;
      res.send(html);
    }
  } else {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF--8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Failed</title>
            <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 70vh;
                }
                .button-container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center mb-4 display-4">Falscher Benutzername oder Passwort</h1>
                <div class="button-container">
                    <a href="/login" class="btn btn-primary">Versuche erneut</a>
                </div>
            </div>
        </body>
        </html>`;
    res.send(html);
  }
});

// Seite für das Hochladen von Bildern
app.get("/upload", (req, res) => {
  const { username } = req.query;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload</title>
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        <style>
            .container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 70vh;
            }
            .button-container {
                margin-top: 20px;
            }
            .image-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                margin-top: 20px;
            }
            .image-item {
                margin: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="text-center mb-4 display-4">Bilder hochladen</h1>
            <form action="/upload?username=${username}" method="post" enctype="multipart/form-data">
                <input type="file" name="image" />
                <button type="submit" class="btn btn-primary mt-3">Hochladen</button>
            </form>
            <div class="image-container" id="imageContainer"></div>
        </div>
        <script>
            // Bildcontainer
            const imageContainer = document.getElementById('imageContainer');

            // Funktion zum Abrufen der hochgeladenen Bilder
            const getUploadedImages = () => {
                fetch('/images?username=${username}')
                    .then(response => response.json())
                    .then(data => {
                        // Bilder anzeigen
                        data.forEach(image => {
                            const img = document.createElement('img');
                            img.src = image.url;
                            img.classList.add('image-item');
                            imageContainer.appendChild(img);
                        });
                    })
                    .catch(error => console.error('Fehler beim Abrufen der Bilder:', error));
            };

            // Hochgeladene Bilder beim Laden der Seite abrufen
            getUploadedImages();
        </script>
    </body>
    </html>`;
  res.send(html);
});

// Bildupload
app.post("/upload", upload.single('image'), async (req, res) => {
  const { username } = req.query;
  const file = req.file;

  // Pfad zum hochgeladenen Bild
  const filePath = file.path;

  // S3-Upload-Parameter
  const params = {
    Bucket: 'flamursbucket',
    Key: username + '/' + file.originalname, // Der Dateiname wird beibehalten
    Body: fs.createReadStream(filePath),
    ACL: 'private' // Nur der Benutzer kann auf seine Bilder zugreifen
  };

  // Bild zum S3-Bucket hochladen
  s3.upload(params, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).send("Fehler beim Hochladen des Bildes.");
    } else {
      console.log("Bild erfolgreich hochgeladen:", data.Location);
      res.redirect(`/upload?username=${username}`);
    }
  });
});

// Bilder abrufen
app.get("/images", async (req, res) => {
  const { username } = req.query;

  // S3-ListObjects-Parameter
  const params = {
    Bucket: 'flamursbucket',
    Prefix: username + '/',
  };

  // Bilder im S3-Bucket abrufen
  s3.listObjects(params, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).send("Fehler beim Abrufen der Bilder.");
    } else {
      const images = data.Contents.map(image => ({
        url: s3.getSignedUrl('getObject', { Bucket: params.Bucket, Key: image.Key })
      }));
      res.json(images);
    }
  });
});





// Port für den Start des Servers
app.listen(3000);

