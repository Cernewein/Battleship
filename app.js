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

var grille = [[]];// Pour la grille il vaut mieux la créer en tant que variable globale !
for (var i = 0; i <10; i++) { // On créé la grille en entier et dans la 1ère ligne on stocke les joueurs en fonction de leur ordre de connection
    	var ligne = [];
    	for (var j = 0; j <10; j++) {
    		ligne.push([0,0]);// On crée la grille en parallèle pour les deux joueurs
    	}
    	grille.push(ligne);
    }
// Quand un client se connecte, on le note dans la console

io.sockets.on('connection', function (socket) {
	var tirs = [];
    console.log('Un client est connecté !');
	
    //socket.emit('message', 'Vous êtes bien connecté !');
    socket.on('new_user',function(user){
    	socket.user = user;
    	grille[0].push(user);// On ajoute le joueur dans la liste de joueurs
    	socket.emit('welcome', 'Bienvenue à toi ' + user);
    	console.log('New user : ' + user);
    });

    socket.on('placement_bateaux', function (bateau) {
        //console.log(event);
        var id = bateau.id;
        var pseudo = bateau.pseudo;
        var index = grille[0].indexOf(pseudo);
        console.log(index);
		var col1 = bateau.col1;
		var row1 = bateau.row1;
		var col2 = bateau.col2;
		var row2 = bateau.row2;
		if (col1>col2){
			aux=col1;
			col2 = col1;
			col1 = aux;
		}
		if (row1>row2){
			aux=row1;
			row2 = row1;
			row1 = aux;
		}
		if(row1==row2){
			for (j=col1;j<=col2;j++){
				grille[row1-1][j][index] = 1;
			}
		}
		if(col1==col2){
			for (j=row1;j<=row2;j++){
				grille[j-1][col1][index] = 1;
			}
		}
		console.log(grille);
        socket.emit('retour_placement',grille);
    }); 
    socket.on('tir', function(event){
    	var index = grille[0].indexOf(event.pseudo);
    	var touche = false
    	if(index == 0){index = 1;}// On échange index pour pouvoir parcourir la grille de l'autre joueur
    	else{index = 0;}
    	var row = event.row;
    	var col = event.col;
    	if(grille[row-1][col][index] == 1){
    		touche = true;
    	}
    	tirs.push({"col":col,"row":row,"touche":touche});
    	socket.emit('retour_tir',tirs);
    })
});
server.listen(8080);