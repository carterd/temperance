const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
    key: fs.readFileSync('../certs/server-key.pem'),
    cert: fs.readFileSync('../certs/inter-server-cert.pem'),
    ca: [ fs.readFileSync('../certs/client-ca-cert.pem'),
          fs.readFileSync('../certs/intermediate-cert.pem'),
          fs.readFileSync('../certs/server-ca-cert.pem'), ],
    requestCert: true,
    rejectUnauthorized: false
};

const app = express();


https.createServer(options, app).listen(5555, function() { console.log('listening 5555') });

app.get('/', function (req, res) {
  console.log(req.connection.remoteAddress);
  console.log(req.socket.getPeerCertificate());
  console.log(req.socket.getPeerCertificate().subject);
  res.header('Content-type', 'text/html');
  res.send('<h1>Hello World!</h1>');
});

// app.listen(8088, function () {
//  console.log('Example app listening on port 8088!')
// });
