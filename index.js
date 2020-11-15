const express = require('express');
const bodyParser = require ('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
app.use(bodyParser.json())
app.use(cors());
const port = 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jo990.mongodb.net/apartmentHunt?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

  const houseCollection = client.db("apartmentHunt").collection("houses");

  console.log('db - connected')

// add house into database
  app.post('/addHouse', (req, res) =>{
    const house = req.body;
    houseCollection.insertOne(house)
    .then(result =>{
        res.send(result.insertedCount);
    })
  })


// get houses from database
app.get('/houses', (req, res) =>{
    houseCollection.find({})
    .toArray((err, documents) =>{
        res.send(documents);
    }) 
})


});



app.get('/', (req, res) =>{
    res.send('I am working');
})


app.listen(process.env.PORT || port)
