const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const uri = "mongodb+srv://flamur:12345@cluster.vemnqk7.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
    await mongoose.connect(uri);
    console.log("Verbunden mit Flamur's MongoDB");
}

connect();

app.get("/", (req, res) => {
    res.send(`<div style="display: flex; justify-content: center; align-items: center; height: 50vh;">
            <button style="margin-right: 30px;" onclick="window.location.href='/register'">Registrieren</button>
            <button onclick="window.location.href='/login'">Login</button></div>`);
});

app.get("/login", function (req, res) {
    res.sendFile("login.html", { root: "./" });
});

app.get("/register", function (req, res) {
    res.sendFile("register.html", { root: "./" });
});

const User = mongoose.model("User", {
    username: String,
    password: String
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hashen des Passworts
    await User.create({ username, password: hashedPassword }); // Speichern des gehashten Passworts
    res.send('Registrierung erfolgreich.<a href="/login">Zum Login.</a>');
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password); // Vergleichen des eingegebenen Passworts mit dem gehashten Passwort
        if (passwordMatch) {
            res.send("Login erfolgreich.");
        } else {
            res.send('Falsches Passwort.<a href="/login">Versuche erneut.</a>');
        }
    } else {
        res.send('Falscher Benutzername oder Passwort.<a href="/login">Versuche erneut.</a>');
    }
});

app.listen(3000, () => {
    console.log("App wurde gestartet auf localhost:3000");
});
