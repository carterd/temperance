const fs = require('fs');
const https = require('https');
const x509 = require('x509');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var body = JSON.stringify(
    {
	foo: "bar",
	bar: "foodoo"
    }
);

var servicekey = fs.readFileSync('../../acquaintances/agents/certs/test.service.key.pem');
var servicecert = fs.readFileSync('../../acquaintances/agents/certs/test.service.pem');
var identkey = fs.readFileSync('../test-identity/identity-private-key.pem');
var identcert = fs.readFileSync('../../acquaintances/identities/certs/test.pem');

var compcert = servicecert + identcert;

var options = {
  hostname: 'localhost',
  port:3000,
  path: '/org.temperance.ts/test?readme=activate',
    method: 'POST',
    // The key and cert of who I am
    key: servicekey,
    cert: servicecert,
    ca : [
	// The identity of who i trust
	fs.readFileSync('../../identity/identity-cert.pem'),
//	fs.readFileSync('../test-identity/identity-cert.pem')
    ],

  rejectUnauthorized: true,
  checkServerIdentity: function (host, cert) { return undefined; },
    headers: {
	"Content-Type":"application/json",
	"Content-Length":Buffer.byteLength(body)
	     }
};
var req = https.request(options, function(res) {
  //console.log(res.socket.getPeerCertificate());
  res.on('data', function(data) {
      console.log("\nret --------------------------------");
      process.stdout.write(data.toString());
      console.log("\nret --------------------------------");
  });
});
req.end(body);

req.on('error', function(e) {
  console.error(e);
});
