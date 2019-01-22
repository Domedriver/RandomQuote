const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

var quoteSchema = new mongoose.Schema({
  quote: {type: String, required: true},
  quoteId: Number,
  author: {type: String, required: true},
  category: String,
  fccCamper: String,
  camper_link: String,
  date: Date
}, {capped: {size: 64, max: 100}});


var quoteCounterSchema = new mongoose.Schema({
  name: String,
  counter: Number
})

var Quote = mongoose.model("Quote", quoteSchema);
var Counter = mongoose.model("Counter", quoteCounterSchema);

function addToDb(record, id, callback) {  
  var newQuote = new Quote({
    quote: record.quote,
    quoteId: id,
    author: record.author,
    category: record.category,
    fccCamper: record.camper,
    camper_link: record.camper_link,
    date_submitted: new Date()
  })
  newQuote.save(function(err, result) {
    if (err) console.error(err);    
    callback()    
  })
}

function checkIfExists(collection, searchJson, callback) {
  collection.find(searchJson, function(err, results) {
    if (err) console.error(err);    
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

function incrementCounter(callback) {
  Counter.findOne({name: "quoteId"}, function(err, result) {
    if (err) console.error(err);    
    result.counter += 1;
    result.save(function(err, result) {
      if (err) console.error(err);
      callback(result.counter)
    })
  })
}

function getQuoteNumber(callback) {
  Counter.findOne({name: "quoteId"}, function(err, result) {
    if (err) console.error(err);    
    callback(result)
  })  
}

function getQuote(searchJson, callback) {
  Quote.find(searchJson, {_id: 0, quoteId: 0, __v: 0}, function(err, results) {
    if (err) console.error(err);
    if (results.length == 0) {
      callback({})
      //callback({quote: "No such category", author: "No such category"})
    } else {
      callback(results[Math.floor(Math.random()*results.length)])
    }
  })  
}

function getAllQuotes(callback) {
  Quote.find({}, {_id: 0, quoteId: 0, __v: 0}, function(err, results) {
    if (err) console.error(err);
    if (results.length == 0) {
      callback({})      
    } else {
      callback(results)
    }
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
  incrementCounter(function(counter) {
    addToDb(req.body, counter, function() {            
    res.redirect('/')
    })  
  })
});

app.get('/api/quotenum', function(req, res) {
  getQuoteNumber(function(result) {
    res.json(result)
  });  
})

app.get('/api/quote/all', function(req, res) {
  getQuote({}, function(result) {
    res.json(result)
  })
});

app.get('/api/quote/allquotes', function(req, res) {
  getAllQuotes(function(results) {
    res.json(results)
  })
});

app.get('/api/quote/other', function(req, res) {
  getQuote({}, function(result) {
    res.json(result)
  })
});

app.get('/api/quote/:cat', function(req, res) {    
  getQuote({category:req.params.cat}, function(result) {
    res.json(result)
  })
});
  
  


const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
