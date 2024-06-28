const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static("public"))

app.use(express.json());

const mongoose = require('mongoose');
const CONNECTION_STRING
    = "mongodb+srv://dbUser:Seneca123@cluster0.utiefr8.mongodb.net/splits?retryWrites=true&w=majority";
mongoose.connect(CONNECTION_STRING)
const db = mongoose.connection
db.on("error", console.error.bind(console, "Error connecting to database: "));
db.once("open", () => {
    console.log("Mongo DB connected successfully.");
});

const Schema = mongoose.Schema;
const userSchema = new Schema({
    userName: String,
    password: String,
});
// model - if the collection does not exist in your databse,mongoose will create it.
const Users = mongoose.model("users", userSchema);

app.get('/api/users', async (req, res) => {
    try {
        const users = await Users.find({}, 'userName').lean().exec();
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.get('/api/users/:userName', async (req, res) => {
    const username = req.params.userName
    console.log("User Id: ", username)
    try {
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        console.log(result)
        if (result) {
            res.status(200).send(result)
        } else {
            res.status(404).send(`User Not Found!`)
        }
    } catch (err) {
        console.log(`Error Finding User: ${username}`)
        res.status(500).send(`Error: ${err}`)
    }
})

app.get('/api/users/password/:userName', async (req, res) => {
    username = req.params.userName
    console.log("User Id: ", username)
    try {
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        console.log(result)
        if (result) {
            res.status(200).send(result.password)
        } else {
            res.status(404).send(`User Not Found!`)
        }
    } catch (err) {
        console.log(`Error Finding User: ${username}`)
        res.status(500).send(`Error: ${err}`)
    }
})

app.post('/api/users', async (req, res) => {
    const newUsername = req.body.userName
    const newPassword = req.body.password

    console.log(`username: ${newUsername}, password: ${newPassword}`)

    try {
        const result = await Users.findOne({ userName: new RegExp(`^${newUsername}$`, 'i') })
        if (result) {
            res.status(400).send(`User already exists!`)
        } else {
            const newUser = new Users({
                userName: newUsername,
                password: newPassword
            });
            console.log(newUser)
            await newUser.save()
            console.log(`New User: ${newUser} Added!`)
            res.status(201).send(`New User: ${newUser} Added!`)
        }
    } catch (err) {
        res.status(500).send(`Error: ${err}`)
    }
})

app.put('/api/users', async (req, res) => {
    const username = req.body.userName
    const newPassword = req.body.password

    try {
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        console.log(result)
        if (result && result.password == newPassword) {
            res.status(500).send(`New password must be different from the current password`)
        }
        else {
            try {
                const result = await Users.updateOne({ userName: new RegExp(`^${username}$`, 'i') }, { $set: { password: newPassword } })
                if (result.modifiedCount > 0) {
                    res.status(200).send(`User: ${username}'s password is updated!`)
                } else {
                    res.status(404).send(`User: ${username} not found!`)
                }
            } catch (err) {
                res.status(500).send(`Error updating user: ${username}, Error: ${err}`)
            }
        }
    } catch (err) {
        console.log(`Error Finding User: ${username}`)
        res.status(500).send(`Error finding user: ${username}, Error: ${err}`)
    }
})

app.delete('/api/users', async (req, res) => {
    const username = req.body.userName
    console.log(username)

    try {
        const result = await Users.deleteOne({ userName: new RegExp(`^${username}$`, 'i') })
        if (result.deletedCount > 0) {
            res.status(200).send(`User: ${username} was deleted successfully!`)
        }
        else {
            res.status(404).send(`User ${username} was not found!`)
        }
    } catch (err) {
        res.status(500).send(`Error: ${err}`)
    }
})

const onServerStart = () => {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
};
app.listen(HTTP_PORT, onServerStart);