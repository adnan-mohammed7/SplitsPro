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
    id: {
        type: Number,
        unique: true,
    },
    firstName:{
        type: String,
        require: true,
    },
    lastName:{
        type: String,
        require: true,
    },
    fullName:{
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    photo: String,
    friends: [],
    groups: [],
    individualExpenses: [],
    groupExpenses: [],
});

const userCountSchema = new Schema({
    userCount: Number,
    groupCount: Number,
    expenseCount: Number,
})
// model - if the collection does not exist in your databse,mongoose will create it.
const Users = mongoose.model("users", userSchema);
const UsersCount = mongoose.model("usercounts", userCountSchema);

app.get('/api/users',passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const users = await Users.find({}, 'fullName email').lean().exec();
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send({message: err})
    }
})

app.get('/api/users/:email',passport.authenticate('jwt', { session: false }), async (req, res) => {
    const inputEmail = req.params.email
    try {
        const result = await Users.findOne({ email: new RegExp(`^${inputEmail}$`, 'i') })
        if (result) {
            res.status(200).send(result)
        } else {
            res.status(404).send({message: `User Not Found!`})
        }
    } catch (err) {
        res.status(500).send({message: `Error: ${err}`})
    }
})

app.post('/api/user/register', async (req, res) => {
    const newId = await UsersCount.findOne({})
    const inputFirstName = req.body.firstName
    const inputLastName = req.body.lastName
    const inputEmail = req.body.email
    const inputPassword = req.body.password
    const confirmPassword = req.body.confirmPassword

    if (inputPassword == confirmPassword) {
        bcrypt.hash(inputPassword, 10)
            .then(async (newPassword) => {
                try {
                    const result = await Users.findOne({ email: new RegExp(`^${inputEmail}$`, 'i') })
                    if (result) {
                        res.status(400).send({message: `User already exists!`})
                    } else {
                        const newUser = new Users({
                            id: newId.userCount,
                            firstName: inputFirstName,
                            lastName: inputLastName,
                            fullName: inputFirstName +" "+ inputLastName,
                            email: inputEmail,
                            password: newPassword,
                            photo: "",
                            friends: [],
                            groups: [],
                            individualExpenses: [],
                            groupExpenses: [],
                        });
                        await newUser.save()
                        await UsersCount.updateOne({}, {$inc: {userCount: 1}})
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

app.post('/api/user/login', async (req, res) => {
    const inputEmail = req.body.email
    const password = req.body.password

    try {
        const result = await Users.findOne({ email: new RegExp(`^${inputEmail}$`, 'i') })
        if (result) {
            bcrypt.compare(password, result.password).then((hash) => {
                if (hash == true) {
                    let payload = {
                        _id: result._id,
                        email: result.email,
                        fullName: result.fullName,
                        id: result.id,
                    };

                    let token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.status(200).send({message: `Login successful`, token: token})
                } else {
                    res.status(500).send({message: `Incorrect password for User: ${inputEmail}`})
                }
            })
        } else {
            res.status(404).send({message: `User: ${inputEmail} not found!`})
        }
    } catch (err) {
        res.status(404).send({message: `Error: ${err}`})
    }
})

app.put('/api/user/update', passport.authenticate('jwt', { session: false }),async (req, res) => {
    const inputEmail = req.body.email
    const newPassword = req.body.password

    try {
        const result = await Users.findOne({ email: new RegExp(`^${inputEmail}$`, 'i') })
        if (result) {
            bcrypt.compare(newPassword, result.password).then(async (result) => {
                if (result == true) {
                    res.status(500).send({message: `New password must be different from the current password`})
                } else {
                    bcrypt.hash(newPassword, 10).then(async (hash) => {
                        try {
                            const result = await Users.updateOne({ email: new RegExp(`^${inputEmail}$`, 'i') }, { $set: { password: hash } })
                            if (result.modifiedCount > 0) {
                                res.status(200).send({message: `User: ${inputEmail}'s password is updated!`})
                            } else {
                                res.status(404).send({message: `User: ${inputEmail} not found!`})
                            }
                        } catch (err) {
                            res.status(500).send({message: `Error updating user: ${inputEmail}, Error: ${err}`})
                        }
                    }).catch((err) => {
                        res.status(500).send({message: err})
                    });
                }
            });
        }
    } catch (err) {
        res.status(500).send({message: `Error finding user: ${inputEmail}, Error: ${err}`})
    }
})

app.delete('/api/user/delete', async (req, res) => {
    const inputEmail = req.body.email

    try {
        const result = await Users.deleteOne({ email: new RegExp(`^${inputEmail}$`, 'i') })
        if (result.deletedCount > 0) {
            res.status(200).send({message: `User: ${inputEmail} was deleted successfully!`})
        }
        else {
            res.status(404).send({message: `User ${inputEmail} was not found!`})
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