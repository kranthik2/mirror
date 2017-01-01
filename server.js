var express = require('express');
var app = express();

app.use(express.static(__dirname + '/mirror'));
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.get('/', function(req, res){
  res.redirect('/mirror/index.html');
});


app.listen(8080);