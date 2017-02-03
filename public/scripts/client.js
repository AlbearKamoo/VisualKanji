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

socket.on('retry', function(data) {
    socket.emit('join', 'New kanji please!');
})

socket.on('words', function(data){
  var div
  var word
  var reading
  var meanings
  var container = document.getElementById('wordContainer');

  container.innerHTML = '';

  for(var i=0;i<data['words'].length && i<3;i++){
    column = document.createElement('div')
    div = document.createElement('div')
    column.className = 'col-md-4';
    div.className = 'wordDisplay';

    word = document.createElement('h2');
    word.innerHTML = data['words'][i]['word'];

    reading = document.createElement('p');
    reading.className = 'kanaReading';
    reading.innerHTML = data['words'][i]['reading'];

    meanings = document.createElement('h3')
    meanings.className = 'wordMeanings';

    // Prettify word meanings
    var merged = [].concat.apply([], data['words'][i]['meanings']);
    meanings.innerHTML = merged.join(', ');

    div.appendChild(word);
    div.appendChild(reading);
    div.appendChild(meanings);
    column.appendChild(div);
    container.appendChild(column);
  }
})

function getImageURL(meaning, callback){
  url = "https://pixabay.com/api/?key=3742673-c8ba4f73bb895d2b2b38cbd77&q="+encodeURIComponent(meaning);
  console.log(url);
  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      if(xhr.staus = 200){
        callback(xhr.response);
      }
    }
  }
  xhr.responseType = "json"
  xhr.open("GET", url);
  xhr.send();
}

function setImage(response){
  imageSources = []

  if(response["totalHits"] == 0){
    alert("No images found for this Kanji meaning");
    document.getElementById("meaningPic").src = "/images/crying.png";
    return;
  }

  if(response["totalHits"] >= 15){
    for(var i=0;i<15;i++){
      if(response["hits"][i]["likes"] >= 10){
        imageSources.push(response["hits"][i]["webformatURL"]);
      }
    }
  }
  else if(response["totalHits"] >= 5){
    for(var i=0;i<5;i++){
      imageSources.push(response["hits"][i]["webformatURL"])
    }
  }
  else{
    for(var i=0;i<response["totalHits"];i++){
      imageSources.push(response["hits"][i]["webformatURL"])
    }
  }

  document.getElementById("meaningPic").src = imageSources[0];
  index = 0;
}

function nextImage(){
  if(imageSources.length == 0){
      return;
  }
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
  if(imageSources.length == 0){
      return;
  }
  if(index - 1 < 0){
    document.getElementById("meaningPic").src = imageSources[imageSources.length-1];
    index = imageSources.length-1;
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
