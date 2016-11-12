var literal = "kanji";
var meaning = "meaning";

var socket = io(location.origin);
socket.on('connect', function(data) {
    socket.emit('join', 'Hello from client');
});

socket.on('kanji', function(data){
  literal = data['literal']
  document.getElementById("kanji").innerHTML = literal
  if(typeof(data['meaning']) == 'string'){
    meaning = capitalizeFirst(data['meaning']);
  } else{
    meaning = capitalizeFirst(data['meaning'][0]);
  }
  getImageURL(meaning, setImage);
})

socket.on('words', function(data){
  var div
  var word
  var reading
  var meanings

  for(var i=0;i<3;i++){
    div = document.createElement('div')
    div.className = 'wordDisplay'

    word = document.createElement('h2')
    word.innerHTML = data['words'][i]['word'];
    reading = document.createElement('p');
    reading.className = 'kanaReading';
    reading.innerHTML = data['words'][i]['reading'];
    meanings = document.createElement('h3')
    meanings.className = 'wordMeanings';
    meanings.innerHTML = data['words'][i]['meanings'];

    div.appendChild(word);
    div.appendChild(reading)
    div.appendChild(meanings)
    document.getElementById('wordContainer').appendChild(div)
  }
  //  document.getElementById('word').innerHTML = data['words'][0]['word'];
  //  document.getElementById('reading').innerHTML = data['words'][0]['reading'];
  //  document.getElementById('meanings').innerHTML = data['words'][0]['meanings'];
})

function getImageURL(meaning, callback){
  url = "https://pixabay.com/api/?key=3742673-c8ba4f73bb895d2b2b38cbd77&q="+encodeURIComponent(meaning);
  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      //console.log(xhr.responseText)
      callback(xhr.response)
    }
  }
  xhr.responseType = "json"
  xhr.open("GET", url);
  xhr.send();
}

function setImage(response){
  if(response["hits"].length >= 10){
    for(var i=0;i<10;i++){
      if(response["hits"][i]["likes"] >= 20){
        imgSrc = response["hits"][i]["webformatURL"];
        break;
      }
    }
  }
  else{
    imgSrc = response["hits"][0]["webformatURL"];
  }

  document.getElementById("meaningPic").src = imgSrc;
}

function showMeaning(element){
  element.innerHTML = meaning;
}

function showLiteral(element){
  element.innerHTML = literal;
}

function capitalizeFirst(str){
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function refresh(){
  location.reload();
}
