const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const path = require('path');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data

let c = mongoose.connect("mongodb://localhost:27017/icoder");
const db = mongoose.connection;
db.on('connected', () => {
    console.log("mongoose is connected");
})
db.on("error", (err) => {
    console.log("error occured");
})

const Usersschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        enum: ['Web Development', 'App Development', 'Data Science'],
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    sub: {
        type: Boolean,
        required: true

    }
}




)
const User = mongoose.model('User', Usersschema);
const SignupSchema = new mongoose.Schema({
    sname: {
        type: String,
        required: true,
    },
    pwd: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 20,
        validate: {
            validator: function (value) {
                // Regex to enforce letters and numbers only, and no spaces, special characters, or emoji
                return /^[A-Za-z0-9]+$/.test(value);
            },
            message: "Password must be 8-20 characters long, contain letters and numbers, and must not contain spaces, special characters, or emoji."
        }

    }
})
const Signup = mongoose.model('Signup', SignupSchema);

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
})
app.get('/newpage',(req,res)=>{
    res.sendFile(path.join(__dirname, 'AfterSign.html'));
})
app.post('/query', async (req, res) => {
    try {
        const u = new User({
            email: req.body.email,
            topic: req.body.topic,
            query: req.body.query,
            sub: req.body.sub === 'on'
        })
        const su = await u.save();
        res.status(201).send('<h2>Opinion taken Successfully</h2>')
    }
    catch (err) {
        res.status(400).send(`<h1>Error: ${err.message}</h1>`);
    }
})

app.post('/signup', async (req, res) => {
    try {
        // Validate Input
        if (!req.body.sname || !req.body.pwd) {
            throw new Error("All fields are required.");
        }
        const { sname, pwd } = req.body;

        const existing = await Signup.findOne({sname });
        const existingp =await Signup.findOne({ pwd });
        if(existing || existingp){
            return res.redirect('/?error=Username and Password already exists');
        }
        const s = new Signup({
            sname: req.body.sname,
            pwd: req.body.pwd
        })
        const result = await s.save();
        res.redirect('/?success=registered');

    }
    catch (err) {
        res.status(400).send(`<h1>Error: ${err.message}</h1>`);

    }
})

app.post('/login', async (req,res)=>{
    try{
        if(!req.body.sname||!req.body.pwd){
            throw new Error("input feilds are empty");
        }
        const {sname , pwd} = req.body;
        const existing = await Signup.findOne({sname , pwd});
        
        if(existing){
            res.redirect('/?success=registered');

        }
        else{
            return res.redirect('/?error=please register');

        }
    }
    catch(err){
        res.status(400).send(`<h1>Error: ${err.message}</h1>`);
    }

}) 


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})