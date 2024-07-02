const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const cors = require('cors')

// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: '&0y7$noP#5rt99&GB%Pz7j2b1vkzaB0RKs%^N^0zOP89NT04mPuaM!&G8cbNZOtH',
};

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    if (jwt_payload) {
        next(null, {
            _id: jwt_payload._id,
            userName: jwt_payload.userName,
            //password: jwt_payload.password,
        });
    } else {
        next(null, false);
    }
});

passport.use(strategy);
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(express.json());
app.use(cors());

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

app.get('/api/users',passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const users = await Users.find({}, 'userName').lean().exec();
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send({message: err})
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
            res.status(404).send({message: `User Not Found!`})
        }
    } catch (err) {
        console.log({message: `Error Finding User: ${username}`})
        res.status(500).send({message: `Error: ${err}`})
    }
})

app.post('/api/users/register', async (req, res) => {
    const newUsername = req.body.userName
    const inputPassword = req.body.password
    const confirmPassword = req.body.confirmPassword

    if (inputPassword == confirmPassword) {
        bcrypt.hash(inputPassword, 10)
            .then(async (newPassword) => {
                console.log(`username: ${newUsername}, password: ${newPassword}`)

                try {
                    const result = await Users.findOne({ userName: new RegExp(`^${newUsername}$`, 'i') })
                    if (result) {
                        res.status(400).send({message: `User already exists!`})
                    } else {
                        const newUser = new Users({
                            userName: newUsername,
                            password: newPassword
                        });
                        console.log(newUser)
                        await newUser.save()
                        console.log(`New User: ${newUser} Added!`)
                        res.status(201).send({message: `New User: ${newUser} Added!`})
                    }
                } catch (err) {
                    res.status(500).send({message: `Error: ${err}`})
                }
            })
            .catch((err) => {
                res.status(500).send({message: err})
            });
    } else {
        res.status(500).send({message: `Password does not match`})
    }
})

app.post('/api/users/login', async (req, res) => {
    const username = req.body.userName
    const password = req.body.password
    console.log(`username: ${username}, password: ${password}`)

    try {
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        if (result) {
            bcrypt.compare(password, result.password).then((hash) => {
                if (hash == true) {
                    let payload = {
                        _id: result._id,
                        userName: result.userName,
                        //password: result.password,
                    };

                    let token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.status(200).send({message: `Login successful`, token: token})
                } else {
                    res.status(500).send({message: `Incorrect password for User: ${username}`})
                }
            })
        } else {
            res.status(404).send({message: `User: ${username} not found!`})
        }
    } catch (err) {
        res.status(404).send({message: `Error: ${err}`})
    }
})

app.put('/api/users/update', async (req, res) => {
    const username = req.body.userName
    const newPassword = req.body.password

    try {
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        console.log(result)
        if (result) {
            bcrypt.compare(newPassword, result.password).then(async (result) => {
                if (result == true) {
                    res.status(500).send({message: `New password must be different from the current password`})
                } else {
                    bcrypt.hash(newPassword, 10).then(async (hash) => {
                        try {
                            const result = await Users.updateOne({ userName: new RegExp(`^${username}$`, 'i') }, { $set: { password: hash } })
                            if (result.modifiedCount > 0) {
                                res.status(200).send({message: `User: ${username}'s password is updated!`})
                            } else {
                                res.status(404).send({message: `User: ${username} not found!`})
                            }
                        } catch (err) {
                            res.status(500).send({message: `Error updating user: ${username}, Error: ${err}`})
                        }
                    }).catch((err) => {
                        res.status(500).send({message: err})
                    });
                }
            });
        }
    } catch (err) {
        console.log(`Error Finding User: ${username}`)
        res.status(500).send({message: `Error finding user: ${username}, Error: ${err}`})
    }
})

app.delete('/api/users/delete', async (req, res) => {
    const username = req.body.userName
    console.log(username)

    try {
        const result = await Users.deleteOne({ userName: new RegExp(`^${username}$`, 'i') })
        if (result.deletedCount > 0) {
            res.status(200).send({message: `User: ${username} was deleted successfully!`})
        }
        else {
            res.status(404).send({message: `User ${username} was not found!`})
        }
    } catch (err) {
        res.status(500).send({message: `Error: ${err}`})
    }
})

const onServerStart = () => {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
};
app.listen(HTTP_PORT, onServerStart);

/*app.get('/api/users/password/:userName', async (req, res) => {
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
})*/