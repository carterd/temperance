const fs = require('fs');
const https = require('https');
const util = require('util');
const sshpk = require('sshpk');
const pemtools = require('pemtools');
const crypto = require('crypto');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
  hostname: 'localhost',
  port:5555,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('../certs/client-key.pem'),
  cert: fs.readFileSync('../certs/client-cert.pem'),
  ca : [
        // fs.readFileSync('../certs/client-ca-cert.pem'),
	 fs.readFileSync('../certs/server-ca-cert.pem'),
       ],
};

var req = https.request(options, function(res) {
  console.log("\n\n Cert --------------------------------");
  console.log(res.socket.getPeerCertificate());
  var certHash = crypto.createHash('sha256');
  certHash.update(res.socket.getPeerCertificate().raw);
  console.log("\n\n Quick hash --------------------------------");
  console.log(certHash.digest());
  //console.log(res.socket.getPeerCertificate().raw.toString('ascii'));

  var certPem = fs.readFileSync('../certs/inter-server-cert.pem');

  console.log("\n\n Read from file pemtools ------------------------------");
  var buf = pemtools(certPem.toString());
  console.log( buf );
  var bufHash = crypto.createHash('sha256');
  console.log( buf.toBuffer() );
  bufHash.update(buf.toBuffer());
  console.log( bufHash.digest() );


  console.log("\n\n Decode with sshpk ------------------------------");
  var cert = sshpk.parseCertificate(certPem, 'pem');
  console.log( cert.fingerprint('sha256') );
  res.on('data', function(data) {
    process.stdout.write(data);
  });
});
req.end();

req.on('error', function(e) {
  console.error(e);
});
