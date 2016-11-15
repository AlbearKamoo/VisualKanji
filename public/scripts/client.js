var literal = "kanji";
var meaning = "meaning";
var imageSources = [];
var index = 0;

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
  imageSources = []
  if(response["hits"].length >= 15){
    for(var i=0;i<15;i++){
      if(response["hits"][i]["likes"] >= 10){
        imageSources.push(response["hits"][i]["webformatURL"]);
      }
    }
  }
  if(response["hits"].length >= 5){
    for(var i=0;i<5;i++){
      imageSources.push(response["hits"][i]["webformatURL"])
    }
  }
  else{
    for(var i=0;i<reponse["hits"].length;i++){
      imageSources.push(response["hits"][i]["webformatURL"])
    }
  }

  document.getElementById("meaningPic").src = imageSources[0];
  console.log(imageSources[0])
  index = 0;
}

function nextImage(){
  if(index + 1 >= imageSources.length){
    document.getElementById("meaningPic").src = imageSources[0];
    index = 0;
  }
  else{
    document.getElementById("meaningPic").src = imageSources[index + 1];
    index = index + 1;
  }
}

function previousImage(){
  if(index - 1 < 0){
    document.getElementById("meaningPic").src = imageSources[0];
    index = 0;
  }
  else{
    document.getElementById("meaningPic").src = imageSources[index - 1];
    index = index - 1;
  }
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
