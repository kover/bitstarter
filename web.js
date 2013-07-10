var express = require('express');

var app = express.createServer(express.logger());
var fData = fs.readFileSync('index.html');
var outText = fData.toString();
app.get('/', function(request, response) {
  response.send(outText);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
