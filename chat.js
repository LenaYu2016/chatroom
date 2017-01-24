exports.chat=function(io){
    this.userList=[];
    this.rooms=[];
    this.getTimeStr=function(){
        var time=new Date();
        return time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+' '+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getFullYear();
    };
    var self=this;
    this.successCreateRoom=function(message,name,socket){
        io.emit('crs', self.rooms,name);
        socket.broadcast.to(name).emit('roommsg',message);
    };
    this.socketEvents=function(){
        io.on('connection', function(socket){
            socket.on('broadcast',function(name,msg){
                var str=self.getTimeStr();
                io.emit('chat message',name+'('+str+'): '+msg);
            });
            socket.on('sendroom',function(name,msg,room){
                var str=self.getTimeStr();
                io.to(room).emit('chat message',name+'('+str+'): '+msg);
            });
            socket.on('createroom',function(user,room){
                socket.join(room);
                self.rooms.push({name:room,users:[{name:user.name,id:user.id}]});
                io.emit('crsfirst',"Room "+room+" is created by "+user.name, self.rooms,room);
            });
            socket.on('join',function(name,user){
                socket.join(name);
                self.rooms.forEach(function(room){
                    if(room.name==name){
                        room.users.push({name:user.name,id:user.id});
                    }
                });
                self.successCreateRoom(user.name+" join room "+name,name,socket);
            });
            socket.on('leave',function(name,user){
                socket.leave(name);
                self.rooms.forEach(function(room){
                    if(room.name==name){
                        room.users.splice(room.users.indexOf({name:user.name,id:user.id}),1);
                    }
                });
                self.successCreateRoom(user.name+" leave room "+name,name,socket);
            });
            socket.on('username',function(name){
                self.userList.push({username:name,id:socket.id});
                var roomlist= self.rooms;
                io.emit('userlist',self.userList,name,socket.id,roomlist);
                io.emit('clmsg',name+' is comming~~~');
            });
            socket.on('chat message', function(msg){
                console.log('message: ' + msg.msg);
                var str=self.getTimeStr();
                console.log(msg);
                socket.broadcast.to(msg.user).emit('chat message',msg.mname+'('+str+'): '+msg.msg);
                socket.emit('chat message',msg.mname+'('+str+'): '+msg.msg);
            });
            socket.on('disconnect', function(){
                console.log('user disconnected');
                var diname='';

                for(var i=0;i<self.userList.length;i++){
                    if(self.userList[i].id==socket.id){
                        var disrooms=[];
                        disname=self.userList[i].username;
                        self.rooms.forEach(function(room){
                            room.users.forEach(function(user){
                                if(user.id==socket.id){
                                    room.users.splice(room.users.indexOf({name:user.name,id:user.id}));
                                    disrooms.push(room.name);
                                }
                            });
                        });
                        self.userList.splice(i,1);
                        io.emit('exit',self.userList,disname,disrooms);
                        break;
                    }
                }
            });
        });
    }
}