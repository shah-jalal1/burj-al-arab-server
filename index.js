const express = require('express')
const app = express()
const boyParser = require('body-parser');
const cors = require('cors');


const port = 5000

app.use(cors());
app.use(boyParser.json());


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jalal406:jalal2009@cluster0.owenr.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    console.log("db connected successfully");
    
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
        .then(result => {
            // console.log(result);
            res.send(result.insertedCount > 0)

        })
        // console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        // console.log(req.query.email);
        bookings.find({email: req.query.email})  // ({}) find all
        .toArray((err, documents) => { // convert result into to array
            res.send(documents);
        })
    })


});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)