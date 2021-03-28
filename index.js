const express = require('express')
const app = express()
const boyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');



const port = 5000

app.use(cors());
app.use(boyParser.json());


var serviceAccount = require("./burj-al-arab-248d0-firebase-adminsdk-yjgam-25798764be.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



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
        const bearer = req.headers.authorization
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });

            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const quearyEmail = req.query.email;
                    console.log(tokenEmail, quearyEmail);

                    if (tokenEmail == req.query.email) {
                        bookings.find({ email: req.query.email })  // ({}) find all
                            .toArray((err, documents) => { // convert result into to array
                                res.send(documents);
                            })
                    }

                })
                .catch((error) => {
                    // Handle error
                });
        }


        // idToken comes from the client app



    })


});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)