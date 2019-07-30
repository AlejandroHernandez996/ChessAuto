var express = require('express');
var app = express();
var server = require('http').Server(app);
app.get('/', function(req,res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

server.listen(2000);
console.log("Listening to port 2000...");

var io = require('socket.io')(server,{});



var SOCKETS = {};
var board = {
    x:8,
    y:8,
    arr:[
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0],
        [1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,0,0],
        [0,1,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0],
        [0,0,0,0,0,0,0,0] 
    ],
    squareHeight:50,
    squareWidth:50,
}

io.sockets.on('connection', function(socket){

    socket.id = Math.random();
    socket.x = 200*Math.floor(Math.random()*10);
    socket.y = 100*Math.floor(Math.random()*10);

    SOCKETS[socket.id] = socket;

    loadBoard();
    socket.on('disconnect', function(){
        delete SOCKETS[socket.id];
    });

    socket.on('checkPiece',function(piece){
    
        if(board.arr[piece.y][piece.x] == 1){
    
            board.arr[piece.y][piece.x] = 0;

            for(var i in SOCKETS){
                var socket = SOCKETS[i];
                socket.emit("canDrag", board);
            }
        }
    });

    socket.on('setPiece', function(piece){
        board.arr[piece.y][piece.x] = 1;
        for(var i in SOCKETS){
            var socket = SOCKETS[i];
            socket.emit('updateBoard', board);
        }
    });
    socket.on('askBoardState', function(){
        for(var i in SOCKETS){
            var socket = SOCKETS[i];
            socket.emit('sendBoardState', board);
        }
    });
});

function loadBoard(){
    for(var i in SOCKETS){
        var socket = SOCKETS[i];
        socket.emit("updateBoard", board);
    }
    
}