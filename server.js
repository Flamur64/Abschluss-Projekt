// Erforderliche Module
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Express-Anwendung wird erstellt
const app = express()

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Funktion zur Verbindung mit MongoDB
function connect() {
mongoose.connect("mongodb+srv://flamur:12345@cluster.vemnqk7.mongodb.net/?retryWrites=true&w=majority")}
connect()

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
    </html>`
    res.send(html)})

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
    </html>`
    res.send(html)})

// Login von "User"
app.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password)
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
                </div>
            </body>
            </html>`
            res.send(html)
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
            </html>`
            res.send(html)}
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
        </html>`
        res.send(html)}})

// Port für den Start des Servers
app.listen(3000)