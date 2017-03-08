var http = require('http');
var app = connect();
var server = http.createServer(app); //cf app.js

//start server
server.listen(8080);


//get username
function getUsername( socket, callback ) {
  socket.get('username', function(err, username) {
    if (! username) {
      username = socket.id;
    }
    callback(err,username);
  });
}




