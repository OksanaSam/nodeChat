const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const http = require('http').Server(app);

const io = require('socket.io')(http);

const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false})); 

mongoose.Promise = Promise;

const dbUrl = "mongodb+srv://user:userPassword@cluster0.8b52q.mongodb.net/<dbname>?retryWrites=true&w=majority";

// mongodb+srv://user:<password>@cluster0.8b52q.mongodb.net/<dbname>?retryWrites=true&w=majority

const Message = mongoose.model('Message', {
    name: String,
    message: String
});


// const messages = [
//     {name: "Tim", message: "hello"},
//     {name: "Rob", message: "hi there"}
// ]

app.get("/messages", (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
  
})

app.post("/messages", async (req, res) => {
    try {
        const message = new Message(req.body);
        const savedMessage = await message.save()
    
        console.log('saved');
        const censored = await Message.findOne({message: 'badword'});
    
        if (censored) {
            await Message.remove({_id: censored.id})
        } else {
            io.emit('message', req.body)
            res.sendStatus(200);
        }

    } catch(error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('the end')
    }
})


// Message.findOne({message: "badword"}, (err, censored) => {
  
// })

// messages.push(req.body);




io.on('connection', (socket) => {
    console.log("a user connected");
})

mongoose.connect(dbUrl, (err) => {
    console.log("mongo db connection", err);
})

// {useMongoClient: true},

const server = http.listen(3000, () => {
    console.log("server is listening on port running", server.address().port)
});