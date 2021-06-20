const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);

app.set('views', path.join(__dirname, 'views'));

//middlewares
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3300;

httpServer.listen(port, () => {
    console.log('Listening to port:', port);
});

//express endpoints
app.get('/escrow', (req, res) => {
    res.header("Content-Type",'application/json');
    var data = path.resolve('../blockchain/build/contracts/Escrow.json');
    res.sendFile(data);
});