var MongoClient = require('mongodb').MongoClient;
var http = require('http')

var url = 'mongodb://localhost:27017/visualKanji';
MongoClient.connect(url, function(err, db) {
  if (err) console.log(err);
  console.log("Connected correctly to server.");
  getRandom(db, function(){
    db.close();
  })
});

function parseResponse(body, callback){
  var object = {
    "words" : []
  }
  var jsonBody = JSON.parse(body)
  console.dir(jsonBody)
  if(jsonBody['data'].length > 0){
    for (var i = 0, len = jsonBody['data'].length; i < len; i++) {
      if(jsonBody['data'][i]['is_common']){
        var word = jsonBody['data'][i]['japanese'][0]['word']
        var reading = jsonBody['data'][i]['japanese'][0]['reading']

        var meanings = []
        for(var entry in jsonBody['data'][i]['senses']){
          meanings.push(entry['english_definitions'])
          if (meanings.length == 3) { break }
        }

        console.log(jsonBody['data'][i]['is_common'])
        console.log(word)

        object['words'].push({
          [word]:{
            "reading" : reading,
            "meanings" : meanings
          }
        });

        if (object['words'].length == 3) { break }
      }
    }
  }
  callback(object)
}

function getRandom(db, callback){
  var random = db.collection('kanji').aggregate([{ $sample: { size: 1 }}])
  random.each(function(err, doc) {
      if (doc != null) {
        console.log(doc['literal'])

        var req = http.get('http://jisho.org/api/v1/search/words?keyword=' + encodeURI(doc['literal']), function(res){
          res.setEncoding('utf8');
          var body = ''
          res.on('data', function(chunk) {
            body += chunk
          });
          res.on('end', () => {
            parseResponse(body, function(object){
              console.dir(object)
            });
          });
        });

      } else {
         callback();
      }
   });
  callback();
}
