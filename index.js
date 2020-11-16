const express = require('express');
const bodyParser = require ('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const e = require('express');
require('dotenv').config();

const app = express();
app.use(bodyParser.json())
app.use(cors());
app.use(fileUpload())
const port = 5000;



const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.jo990.mongodb.net:27017,cluster0-shard-00-01.jo990.mongodb.net:27017,cluster0-shard-00-02.jo990.mongodb.net:27017/apartmentHunt?ssl=true&replicaSet=atlas-ifk28h-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
      if(err){
        console.log(err)
      }
      const houseCollection = client.db("apartmentHunt").collection("houses");
      const bookingCollection = client.db("apartmentHunt").collection("bookings");
      const adminCollection = client.db("apartmentHunt").collection("admins");

      console.log('db - connected')

    // add house 
      app.post('/addHouse', (req, res) =>{
        const title = req.body.title;
        const price = req.body.price;
        const location = req.body.location;
        const bedrooms = req.body.bedrooms;
        const bathrooms = req.body.bathrooms;

         const file = req.files.imgFile;
         const newImg = file.data;
         const conImg = newImg.toString('base64');
        const image = {
          contentType: req.files.imgFile.mimetype,
          size: req.files.imgFile.size,
          img: Buffer.from(conImg, 'base64')
        }
        console.log({title, price, location, bedrooms, bathrooms,image})


        houseCollection.insertOne({title, price, location, bedrooms, bathrooms,image})
        .then(result =>{
            res.send(result.insertedCount > 0);
        })
      })


    // get houses 
    app.get('/houses', (req, res) =>{
        houseCollection.find({}).limit(6)
        .toArray((err, documents) =>{
            res.send(documents);
        }) 
    })

    // get houses by name
    app.get('/house/:name', (req, res) =>{
      houseCollection.find({name: req.params.name})
      .toArray((err, documents) =>{
        res.send(documents)
      })
    })

    // add bookings 
    app.post('/addBookings', (req, res) =>{
      const booking = req.body;
      bookingCollection.insertOne(booking)
      .then(result =>{
          res.send(result.insertedCount > 0);
      })
    })

    // get bookings 
    app.get('/bookings', (req, res) =>{
      bookingCollection.find({})
      .toArray((err, documents) =>{
          res.send(documents);
      }) 
    })

    // get bookings by email
    app.get('/bookings/:email', (req, res) =>{
      bookingCollection.find({email: req.params.email})
      .toArray((err, documents) =>{
          res.send(documents);
      }) 
    })

    // add Admin 
    app.post('/addAdmin', (req, res) =>{
      const admin = req.body;
      adminCollection.insertOne(admin)
      .then(result =>{
          res.send(result.insertedCount > 0);
      })
    })


    // get admin by email
    app.get('/admin/:email', (req, res) =>{
      adminCollection.find({email: req.params.email})
      .toArray((err, documents) =>{
        res.send(documents.length > 0)
      })
    })

    
    // update user
    app.put('/status/:email', (req, res) => {
      bookingCollection.findOneAndUpdate(
        {
          email: req.params.email
        }, 
        {
          $set: {
            status: req.body.status
          }
        },
        {
          upsert: true
        }
      )
      .then(result =>{ 
        res.send(true)
      })
      .catch(error => console.log(error))
    })


});


app.get('/', (req, res) =>{
    res.send('server is up and running');
})


app.listen(process.env.PORT || port)