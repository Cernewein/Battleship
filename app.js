var http = require('http');
var jquery = require('jquery');
var fs = require('fs');


// Chargement du fichier index.html affiché au client

var server = http.createServer(function(req, res) {

    if(req.url.indexOf('.html') != -1){ //req.url has the pathname, check if it contains '.html'

      fs.readFile('index.html', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });

    }

    if(req.url.indexOf('.js') != -1){ //req.url has the pathname, check if it conatins '.js'

      fs.readFile(__dirname + '/js/script.js', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });

    }

    if(req.url.indexOf('.css') != -1){ //req.url has the pathname, check if it conatins '.css'

      fs.readFile(__dirname + '/css/style.css', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        res.end();
      });

    }
    if(req.url.indexOf('.png') != -1){ //req.url has the pathname, check if it conatins '.css'

      fs.readFile(__dirname + '/img/battleships.png', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'binary/img'});
        res.write(data);
        res.end();
      });

    }
    if(req.url.indexOf('.woff') != -1){ //req.url has the pathname, check if it conatins '.css'

      fs.readFile(__dirname + '/fonts/BAD_GRUNGE.woff', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/font'});
        res.write(data);
        res.end();
      });

    }
    else{
    	fs.readFile('index.html', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }

});


// Chargement de socket.io

var io = require('socket.io').listen(server);


// Quand un client se connecte, on le note dans la console

io.sockets.on('connection', function (socket) {
	var bateaux =[];
	var tirs = [];
    console.log('Un client est connecté !');
	
    //socket.emit('message', 'Vous êtes bien connecté !');
    socket.on('new_user',function(user){
    	socket.user = user;
    	socket.emit('welcome', 'Bienvenue à toi ' + user);
    	console.log('New user : ' + user);
    });

    socket.on('placement_bateaux', function (event) {
        //console.log(event);
        bateaux.push(event);
        socket.emit('retour_placement',bateaux);
    }); 
    socket.on('tir', function(event){
    })
});
server.listen(8080);