var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
var userList=[];
var currentuUser={};
var rooms=[];
io.on('connection', function(socket){
    socket.on('broadcast',function(name,msg){
        var time=new Date();
        var str=time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+' '+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getFullYear();
        io.emit('chat message',name+'('+str+'): '+msg);

    });
    socket.on('sendroom',function(name,msg,room){
        var time=new Date();
        var str=time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+' '+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getFullYear();
        io.to(room).emit('chat message',name+'('+str+'): '+msg);

    });
  socket.on('createroom',function(user,room){

      socket.join(room);
      rooms.push({name:room,users:[{name:user.name,id:user.id}]});
      io.emit('crsfirst',"Room "+room+" is created by "+user.name,rooms,room);
  });
    socket.on('join',function(name,user){
        socket.join(name);
        rooms.forEach(function(room){
            if(room.name==name){
                room.users.push({name:user.name,id:user.id});
            }
        });
        io.emit('crs',rooms,name);
        socket.broadcast.to(name).emit('roommsg',user.name+" join room "+name);
    });
    socket.on('leave',function(name,user){
        socket.leave(name);
        console.log(user);
        rooms.forEach(function(room){
            if(room.name==name){
                room.users.splice(room.users.indexOf({name:user.name,id:user.id}),1);
            }
        });
        console.log(rooms[0].users);
        io.emit('crs',rooms,name);
        socket.broadcast.to(name).emit('roommsg',user.name+" leave room "+name);
    });
    socket.on('username',function(name){
        currentuUser={username:name,id:socket.id};
        userList.push({username:name,id:socket.id});
        console.log(userList);
        var roomlist=rooms;
        io.emit('userlist',userList,name,socket.id,roomlist);
        console.log(name);
        io.emit('clmsg',name+' is comming~~~');


    });
    socket.on('chat message', function(msg){
        console.log('message: ' + msg.msg);
        var time=new Date();
        var str=time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+' '+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getFullYear();
        socket.broadcast.to(msg.user).emit('chat message',msg.mname+'('+str+'): '+msg.msg);
        socket.emit('chat message',msg.mname+'('+str+'): '+msg.msg);

    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        var diname='';

      for(var i=0;i<userList.length;i++){
          if(userList[i].id==socket.id){

               disname=userList[i].username;

              var disrooms=[];
            rooms.forEach(function(room){
                room.users.forEach(function(user){
                   if(user.id==socket.id){
                      //io.emit('leave',room.name,user);
                       room.users.splice(romm.users.indexOf({name:user.name,id:user.id}));
                       disrooms.push(room.name);
                   }
                });
            });
            userList.splice(i,1);
              io.emit('exit',userList,disname,disrooms);
              break;
          }
      }


    });
});
http.listen(3000, function(){
    console.log('listening on *:3000');
});