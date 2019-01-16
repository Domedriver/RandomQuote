const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
mongoose.connect(process.env.MONGO_URI)

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var quoteSchema = new mongoose.Schema({
  quote: {type: String, required: true},
  author: {type: String, required: true},
  fccCamper: String,
  camper_link: String,
  date: Date
})

var quoteCounterSchema = new mongoose.Schema({
  name: String,
  counter: Number
})

var Quote = mongoose.model("Quote", quoteSchema);
var Counter = mongoose.model("Counter", quoteCounterSchema);

function addToDb(record, callback) {
  console.log('addtodb ', record)
  var newQuote = new Quote({
    quote: record.quote,
    author: record.author,
    fccCamper: record.camper,
    camper_link: record.camper_link,
    date: new Date()
  })
  newQuote.save(function(err, result) {
    if (err) console.error(err);    
    callback()    
  })
}

function checkIfExists(collection, searchJson, callback) {
  collection.find(searchJson, function(err, results) {
    if (err) console.error(err);
    console.log(results.length)
    if (results.length == 0) {
      callback(false)
    } else {
      callback(true)
    }
  })  
}

function createDbCounter() {
  var newCounter = new Counter({name: "quoteId", counter: 0})
  newCounter.save(function(err, result) {
    if (err) console.error(err);    
  })
}

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html')
  checkIfExists(Counter, {name: "quoteId"}, function(result) {
    if (!result) {
      createDbCounter()
    }
  })  
});

app.post('/api/addquote', function(req, res) {  
  addToDb(req.body, function() {            
    res.json(req.body)
  })
});

/*app.get('/api/quote', function(req, res) {
  getQuote();
  
})*/


const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
