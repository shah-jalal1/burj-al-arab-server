const express = require('express')
const app = express()
const boyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${[process.env.DB_USER]}:${process.env.DB_PASS}@cluster0.owenr.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const port = 5000

app.use(cors());
app.use(boyParser.json());


var serviceAccount = require("./configs/burj-al-arab-248d0-firebase-adminsdk-yjgam-25798764be.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});




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
        const bearer = req.headers.authorization
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // console.log({ idToken });

            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const quearyEmail = req.query.email;
                    // console.log(tokenEmail, quearyEmail);

                    if (tokenEmail == quearyEmail) {
                        bookings.find({ email: quearyEmail })  // ({}) find all
                            .toArray((err, documents) => { // convert result into to array
                                res.status(200).send(documents);
                            })
                    }
                    else{
                        res.status(401).send('un-authorized access');
                    }

                })
                .catch((error) => {
                    res.status(401).send('un-authorized access');
                });
        }
        else {
            res.status(401).send('un-authorized access');
        }
    })


});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)