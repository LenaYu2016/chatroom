var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chat=require('./chat.js').chat;
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var chat=new Chat(io);
chat.socketEvents();
http.listen(3000, function(){
    console.log('listening on *:3000');
});