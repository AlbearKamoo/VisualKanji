var MongoClient = require('mongodb').MongoClient;
var https = require('https')
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Establishes and manages connection to mongo database server
function queryMongo(callback){
  //var url = 'mongodb://localhost:27017/visualKanji';
  var url = 'mongodb://test:test@ds041546.mlab.com:41546/visualkanji'
  MongoClient.connect(url, function(err, client) {
    if (err) console.warn('Error connecting to database', err);
    console.log("Connected correctly to database server.");
    getRandomKanji(client, function(doc){
      client.close();
      callback(doc)
    })
  });
}

// Retrieves a random document from mongo database using an aggregator
function getRandomKanji(client, callback){
  var db = client.db('visualkanji');
  var random = db.collection('kanji').aggregate([{ $sample: { size: 1 }}])
  random.each(function(err, doc) {
    if (err) console.log('Error retriving random kanji', err);
    if (doc !== null && doc !== undefined) {
      callback(doc);
    } else {
      client.close();
    }
   });
}

// Uses the jisho.org API to obtain dictionary data for given kanji character
function loadWords(kanji, callback){
  var req = https.get('https://jisho.org/api/v1/search/words?keyword=' + encodeURI(kanji), function(res){
    res.setEncoding('utf8');

    var body = ''
    res.on('data', function(chunk) {
      body += chunk
    });

    res.on('end', () => {
      console.log('GET jisho-api', res.statusCode);
      parseResponse(body, function(object){
        callback(object)
      });
    });
  });
}

// Parses the JSON reponse retrived from the jisho.org API
function parseResponse(body, callback){
  var object = {
    "words" : []
  }
  var jsonBody = JSON.parse(body)

  if(jsonBody['data'].length > 0){
    for (var i = 0, len = jsonBody['data'].length; i < len; i++) {
      if(jsonBody['data'][i]['is_common']){
        var entry = jsonBody['data'][i]
        var word = entry['japanese'][0]['word']
        var reading = entry['japanese'][0]['reading']

        var meanings = []
        for(var j = 0; j < entry['senses'].length; j++){
          meanings.push(entry['senses'][j]['english_definitions'])
          if (meanings.length == 3) { break }
        }
        console.dir(meanings);
        object['words'].push({
            "word" : word,
            "reading" : reading,
            "meanings" : meanings
        });

        if (object['words'].length == 3) { break }
      }
    }
  }
  //console.dir(object, {depth: 5})
  callback(object)
}

// On coonection with client, execute main service routine
io.on('connection', function(client) {
  console.log('Client connected...');
  client.on('join', function(data) {
    queryMongo(function(doc){
      var kanjiLiteral = doc['literal'];
      loadWords(kanjiLiteral, function(words){
        if(words['words'].length == 0){
            client.emit('retry', words);
        }
        else{
            client.emit('kanji', doc);
            client.emit('words', words)
        }
      })
    })
  });
});

// Serve HTML page when GET request is received from client
app.get('/', function(req, res,next) {
  res.sendFile(__dirname + '/index.html');
});

// Make files in the public directory acessible
app.use(express.static(__dirname + '/public'))

server.listen(process.env.PORT || 4200);
