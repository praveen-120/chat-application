// CRUD create read update delete

/*const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
const client=require('socket.io').listen(4000).sockets;

const connectionURL = 'mongodb://127.0.0.1:27017/'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    }

    console.log('connected to database');
})
    
    // db.collection('users').insertOne({
    //     name: 'Andrew',
    //     age: 27
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert user')
    //     }

    //     console.log(result.ops)
    // })

    // db.collection('users').insertMany([
    //     {
    //         name: 'Jen',
    //         age: 28
    //     }, {
    //         name: 'Gunther',
    //         age: 27
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert documents!')
    //     }

    //     console.log(result.ops)
    // })

    /*db.collection('tasks').insertMany([
        {
            description: 'Clean the house',
            completed: true
        },{
            description: 'Renew inspection',
            completed: false
        },{
            description: 'Pot plants',
            completed: false
        }
    ], (error, result) => {
        if (error) {
            return console.log('Unable to insert tasks!')
        }

        console.log(result)
    })*/
    // db.collection('users').deleteMany({
    //     age: 27
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })
    /*
    db.collection('tasks').deleteOne({
        description: "Clean the house"
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })*/
    //db.collection('tasks').findOne({"description":"Renew inspection"},(error,user)=>{
        //console.log(user)
    //})
    /*
    db.collection('tasks').find({"completed":false}).toArray((error,tasks)=>{
        console.log(tasks)
    })
    const updatePromise=db.collection('tasks').updateOne({'_id':new mongodb.ObjectId('6391edd1114d1348415a2f54')},{$set:{
        'description':'Renewed Description'
    }})
    updatePromise.then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log('error')
    })
})*/
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const client = socketio(server)
const mongo = require('mongodb').MongoClient;
//const client = require('socket.io').listen(4000).sockets;

// Connect to mongo
mongo.connect('mongodb://127.0.0.1:27017/chat-app', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', function(data){
            // Remove all chats from collection
            chat.remove({}, function(){
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});
server.listen(4000, () => {
    console.log(`Server is up on port 4000!`)
})