// Erforderliche Module
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');

require('dotenv').config();

// AWS Infomrationen
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
  res.sendFile("start.html", { root: "./" });
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
  
  // Überprüfe, ob der Benutzer bereits existiert
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    // Benutzer existiert bereits, daher zeige eine entsprechende Meldung an
    return res.sendFile("register_failed.html", { root: "./" });
  }

  // Benutzername ist eindeutig, daher hashen und registrieren
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashedPassword });

  // Ordner im S3-Bucket für den Benutzer erstellen
  const params = {
    Bucket: 'flamursbucket',
    Key: username + '/',
    ACL: 'private',
    Body: ''
  };
  s3.putObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });

  res.sendFile("register_success.html", { root: "./" });
});

// Login von "User"
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      res.redirect(`/upload?username=${username}`);
    } else {
      res.sendFile("login_failed.html", { root: "./" });
    }
  }
});

// Seite für das Hochladen von Bildern
app.get("/upload", (req, res) => {
  const { username } = req.query;
  res.sendFile("upload.html", { root: "./" });
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
