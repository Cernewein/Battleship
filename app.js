var http = require('http');
var jquery = require('jquery');
var fs = require('fs');


// Chargement du fichier index.html, du fichier css etc affiché au client

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

var grille = [];// Contient toutes les grilles de toutes les rooms existantes
var grille_room=[[]]; //grille par room
for (var i = 0; i <10; i++) { // On créé la grille en entier et dans la 1ère ligne on stocke les joueurs en fonction de leur ordre de connection
    	var ligne = [];
    	for (var j = 0; j <10; j++) {
    		ligne.push([0,0]);// On crée la grille en parallèle pour les deux joueurs
    	}
    	grille_room.push(ligne);
    };
grille.push(grille_room);
// Quand un client se connecte, on le note dans la console

	var rooms = new Map; //dictionnaire qui contient toutes les chambres et le nombre de personne par chambre
	rooms.set('0',0);
	var nbr_room = 0; 
	var personne_room = new Map; //dictionnaire qui a chaque pseudo associe la room dans laquelle il est
	var pseudos = new Map;
	pseudos.set('0',[]);

io.sockets.on('connection', function (socket) {
	

	var tirs = [];
    console.log('Un client est connecté !');
	
    //socket.emit('message', 'Vous êtes bien connecté !');
    socket.on('new_user',function(user){
    	socket.user = user;
    	socket.emit('welcome', 'Bienvenue à toi ' + user);
    	console.log('New user : ' + user);
		var bool=true;
		//on parcourt les chambres pour voir si l'une n'est pas remplie, sinon on en crée une nouvelle
		console.log(rooms);
		for (var room of rooms.keys()){
			console.log("room"+room);
			if (rooms.get(room)<2){
				console.log(grille[room]);
				grille[room][0].push(user);// On ajoute le joueur dans la liste de joueurs
				var aux = rooms.get(room);
				aux=aux+1;
				socket.join(room);
				rooms.set(room,aux); //on met à jour le nombre de personne dans la room
				console.log(user+"dans la salle"+room);
				personne_room.set(user,room); //on ajoute le joueur et la room dans personne_room
				socket.emit('chambre',room);
				bool=false;
				break;
			}
		}
		if (bool){
			grille_room=[[]]; //grille par room
			// for (var i = 0; i <10; i++) { // On crée la grille en entier et dans la 1ère ligne on stocke les joueurs en fonction de leur ordre de connection
			var ligne = [];
			for (var j = 0; j <10; j++) {
				ligne.push([0,0]);// On crée la grille en parallèle pour les deux joueurs
			}
			grille_room.push(ligne);
			grille.push(grille_room);
			grille[room][0].push(user);
			nbr_room = nbr_room + 1;
			socket.join(nbr_room.toString());
			rooms.set(nbr_room.toString(),1);
			console.log(user+"dans la salle"+nbr_room);
			personne_room.set(user,nbr_room);
			socket.emit('chambre',nbr_room);
			pseudos.set(nbr_room.toString(),[]);
			}
		socket.emit('premier',grille[room][0][0] == user);
		console.log(grille[room]);
	});
		
	//lorsqu'une personne se déconnecte : 	
	socket.on('disconnect',function(){
		for (var aux of personne_room.keys()){
			if(aux==socket.user){
				var room=personne_room.get(aux);
				var adversaire=grille[room][0][0];
				var index = grille[room][0].indexOf(socket.user);
				console.log(grille[0]);
				grille_room = [[]];// Pour la grille il vaut mieux la créer en tant que variable globale !
				for (var i = 0; i <10; i++) { // On créé la grille en entier et dans la 1ère ligne on stocke les joueurs en fonction de leur ordre de connection
					var ligne = [];
					for (var j = 0; j <10; j++) {
						ligne.push([0,0]);// On crée la grille en parallèle pour les deux joueurs
					}
					grille_room.push(ligne);
				}
				console.log(adversaire);
				grille_room[0].push(adversaire);
				//on réinitialise la grille
				grille[room]=grille_room;
				var auxbis = rooms.get(personne_room.get(aux));
				auxbis=auxbis-1;
				rooms.set(room.toString(),auxbis);
				personne_room.delete(aux);
				console.log(grille[0]);
				//on envoie un message aux autres utilisateurs
				socket.broadcast.to(room.toString()).emit('message',''+socket.user+' est parti');
				socket.broadcast.to(room.toString()).emit('premier',grille[room][0][0]);
				socket.broadcast.to(room.toString()).emit('init');
			}
		}
	});	
		

    socket.on('placement_bateaux', function (bateau) {
        //console.log(event);
		var chambre = bateau.room;
        var id = bateau.id;
        var pseudo = bateau.pseudo;
		var grillebis=grille[chambre];
		console.log(grillebis);
        var index = grille[chambre][0].indexOf(pseudo);
		var col1 = bateau.col1;
		var row1 = bateau.row1;
		var col2 = bateau.col2;
		var row2 = bateau.row2;
		var colbis=bateau.col1;
		var rowbis=bateau.row1;
		var val_bateau=bateau.bateau;
		if (col1>col2){
			var aux=col1;
			col2 = col1;
			col1 = aux;
		}
		if (row1>row2){
			var aux=row1;
			row2 = row1;
			row1 = aux;
		}
		//mise à 1 des cases choisies si elles respectent les conditions (les bateaux ne sont pas les uns sur les autres)
		if(row1==row2){
			var bool=true;
			for (j=col1;j<=col2;j++){
				if (grille[chambre][row1-1][j][index] == 1){
					bool=false;
				}
			}
			if (bool){
				for (j=col1;j<=col2;j++){
					grille[chambre][row1-1][j][index] = 1;
				}
			}
		}
		if(col1==col2){
			var bool=true;
			for (j=row1;j<=row2;j++){
				if(grille[chambre][j-1][col1][index] == 1){
					bool=false;
				}
			}
			if (bool){
				for (j=row1;j<=row2;j++){
					grille[chambre][j-1][col1][index] = 1;
				}
			}
		}
		//on retourne la réponse au client
		if (bool){
			console.log('hello');
			socket.emit('retour_placement',{"bool":bool,"grille":grille[chambre],"bateau":val_bateau});
		} else {
			console.log('hola');
			grille[chambre][rowbis-1][colbis][index]=0;
			socket.emit('retour_placement',{"bool":bool,"grille":grille[chambre],"bateau":val_bateau});
		}
    }); 
	
	//gestion de la fin du placement : true si les deux ont fini, false sinon
	socket.on('fin_placement',function(liste){
		var pseudo=liste.pseudo;
		var room=liste.room;
		var pseudos_bis=pseudos.get(room.toString());
		console.log(pseudos_bis.length);
		if (pseudos_bis.indexOf(pseudo)==-1){
			pseudos_bis.push(pseudo);
			pseudos.set(room.toString(),pseudos_bis);
			if (pseudos_bis.length == 1){
				socket.to(room.toString()).emit('retour_fin_placement',true);
				socket.broadcast.to(room.toString()).emit('retour_fin_placement',true);
			}else {
				socket.emit('retour_fin_placement',false);
				socket.broadcast.to(room.toString()).emit('retour_fin_placement',false);
			}
		}else {
			if (pseudos_bis.length == 1){
				socket.emit('retour_fin_placement',true);
				socket.broadcast.to(room.toString()).emit('retour_fin_placement',true);
			}else {
				socket.emit('retour_fin_placement',false);
				socket.broadcast.to(room.toString()).emit('retour_fin_placement',false);
		}}
	});
	
	//gestion de tir
    socket.on('tir', function(event){
    	var touche = false
    	var somme_touche = 0;
		var room=event.room;
		console.log(grille[room]);
		var index = grille[room][0].indexOf(event.pseudo);
    	if(index == 0){index = 1;}// On échange index pour pouvoir parcourir la grille de l'autre joueur
    	else{index = 0;}
    	var row = event.row;
    	var col = event.col;
    	if(grille[room][row-1][col][index] == 1){
    		touche = true;
    		grille[room][row-1][col][index] = -1;
    	}
    	tirs.push({"col":col,"row":row,"touche":touche});
    	socket.emit('retour_tir',tirs);
    	socket.broadcast.to(room.toString()).emit('retour_tir_adversaire',tirs,true);
		for (var i=1;i<11;i++){
			for(var j =0;j<10;j++){
				if(grille[room][i][j][index]==-1){
					somme_touche +=1
				}
			}
		}
		console.log(somme_touche);
		if(somme_touche == 17){
			socket.emit('gagne',"Bravo, vous venez de gagner ! ");
			socket.broadcast.to(room.toString()).emit('perdu',"Désolé, vous venez de perdre..");
		}
    })
	
});
server.listen(8080);