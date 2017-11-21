const fs = require('fs');
const https = require('https');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
  hostname: 'localhost',
  port:5555,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('client-key.pem'),
  cert: fs.readFileSync('client-cert.pem'),
  ca : [
        // fs.readFileSync('client-ca-cert.pem'),
	 fs.readFileSync('server-ca-cert.pem'),
       ],
};

var req = https.request(options, function(res) {
  console.log(res.socket.getPeerCertificate());
  res.on('data', function(data) {
    process.stdout.write(data);
  });
});
req.end();

req.on('error', function(e) {
  console.error(e);
});
