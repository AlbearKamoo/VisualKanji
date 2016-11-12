var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var xml2js = require('xml2js');

var url = 'mongodb://test:test@ds041546.mlab.com:41546/visualkanji';
MongoClient.connect(url, function(err, db) {
  if (err) console.log(err);
  console.log("Connected correctly to server.");
  generate(db, function(){
    db.close();
    process.exit(0);
  })
});

function generate(dbRef, callback){
  var parser = new xml2js.Parser();
  fs.readFile(__dirname + '/kanjidic2.xml', function(err, data) {
    if (err) console.log(err);

    parser.parseString(data, function (err, result) {
      if (err) console.log(err);

      for (var kanji in result['kanjidic2']['character']){
        if (result['kanjidic2']['character'][kanji]['misc'][0].hasOwnProperty('jlpt')){
          //console.dir(result['kanjidic2']['character'][kanji])
          dbRef.collection('kanji').insertOne({
             "literal" : result['kanjidic2']['character'][kanji]['literal'],
             //"misc" : result['kanjidic2']['character'][kanji]['misc'],
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
