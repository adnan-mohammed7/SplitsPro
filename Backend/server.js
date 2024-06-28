const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static("public"))

app.use(express.json());

const mongoose = require('mongoose');
const CONNECTION_STRING 
    =  "mongodb+srv://dbUser:Seneca123@cluster0.utiefr8.mongodb.net/splits?retryWrites=true&w=majority";
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

app.get('/api/users',async (req, res) =>{
    try{
        const users = await Users.find().lean().exec();
        res.status(200).send(users)
    }catch(err){
        res.send(err)
    }
})

app.get('/api/users/:userName',async (req,res) =>{
    const username = req.params.userName
    console.log("User Id: ", username)
    try{
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        console.log(result)
        if(result){
            res.status(200).send(`User Found: ${result}`)
        }else{
            res.status(404).send(`User Not Found!`)
        }
    }catch(err){
        console.log(`Error Finding User: ${username}`)
        res.status(500).send(`Error Finding User: ${username}`)
    }
})

app.get('/api/users/password/:userName', async (req, res) =>{
    username = req.params.userName
    console.log("User Id: ",username)
    try{
        const result = await Users.findOne({ userName: new RegExp(`^${username}$`, 'i') })
        console.log(result)
        if(result){
            res.status(200).send(result.password)
        }else{
            res.status(404).send(`User Not Found!`)
        }
    }catch(err){
        console.log(`Error Finding User: ${username}`)
        res.status(500).send(`Error Finding User: ${username}`)
    }
})

app.post('/api/users', (req, res) =>{
    res.status(200).send(`User added`)
})

app.put('/api/users', (req, res) =>{
    res.status(200).send()
})

app.delete('/api/users', (req, res) =>{
    res.status(200).send()
})

const onServerStart = () => {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
  };
  app.listen(HTTP_PORT, onServerStart);