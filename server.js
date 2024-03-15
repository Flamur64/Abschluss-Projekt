// Erforderliche Module
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Express-Anwendung wird erstellt
const app = express()

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Link zur Verbindung mit MongoDB
const uri = "mongodb+srv://flamur:12345@cluster.vemnqk7.mongodb.net/?retryWrites=true&w=majority"

// Funktion zur Verbindung mit MongoDB
async function connect() {
    await mongoose.connect(uri)
    console.log("Verbunden mit Flamur's MongoDB")}

// Die Verbindung mit MongoDB
connect()

// Die Startseite
app.get("/", (req, res) => {
    res.send(`<div style="display: flex; justify-content: center; align-items: center; height: 50vh;">
            <button style="margin-right: 30px;" onclick="window.location.href='/register'">Registrieren</button>
            <button onclick="window.location.href='/login'">Login</button></div>`)})

// login.html mit dem Server verbinden
app.get("/login", function (req, res) {
    res.sendFile("login.html", { root: "./" })})

// register.html mit dem Server verbinden
app.get("/register", function (req, res) {
    res.sendFile("register.html", { root: "./" })})

// "User" erstellen mit MongoDB
const User = mongoose.model("User", {
    username: String,
    password: String})

// Registrierung von "User"
app.post("/register", async (req, res) => {
    const { username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ username, password: hashedPassword })
    res.send('Registrierung erfolgreich.<a href="/login">Zum Login.</a>')})

// Login von "User"
app.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (passwordMatch) {
            res.send("Login erfolgreich.")
        } else {
            res.send('Falsches Passwort.<a href="/login">Versuche erneut.</a>')
        }
    } else {
        res.send('Falscher Benutzername oder Passwort.<a href="/login">Versuche erneut.</a>')}})

// Port für den Start des Servers
app.listen(3000, () => {
    console.log("App wurde gestartet auf localhost:3000")})
