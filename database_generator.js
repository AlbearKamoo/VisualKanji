var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var xml2js = require('xml2js');

// Connects with the mongoDB server hosted at mlab
var url = 'mongodb://test:test@ds041546.mlab.com:41546/visualkanji';
MongoClient.connect(url, function(err, db) {
  if (err) console.log(err);
  console.log("Connected correctly to server.");
  generate(db, function(){
    db.close();
    process.exit(0);
  })
});

// Populates database collection using the KANJIDIC dataset file
// Entire dataset is volumous and contains many historic and obsolete symbols; this
// function filters the data and only inserts desired Kanji into the mongoDB collection.
// For an example of a KANJIDIC Kanji entry, see the kanjiex.xml file
function generate(dbRef, callback){
  var parser = new xml2js.Parser();
  fs.readFile(__dirname + '/kanjidic2.xml', function(err, data) {
    if (err) console.log(err);

    parser.parseString(data, function (err, result) {
      if (err) console.log(err);

      for (var kanji in result['kanjidic2']['character']){
        if (result['kanjidic2']['character'][kanji]['misc'][0].hasOwnProperty('jlpt')){ // Filter Kanji that are required for the Japanese Language Proficieny Test
          dbRef.collection('kanji').insertOne({ // Store only Kanji literal and possible meanings. Other information from KANJIDIC is not necessary
             "literal" : result['kanjidic2']['character'][kanji]['literal'],
             "meaning" : result['kanjidic2']['character'][kanji]['reading_meaning'][0]['rmgroup'][0]['meaning'][0]
          }, function(err, result) {
            if (err) console.log(err)
          })
        }
      }
      console.log('Done');
      callback()
    });
  });
}
