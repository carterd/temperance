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

var servicekey = fs.readFileSync('../test-identity/service-private-key.pem');
var servicecert = fs.readFileSync('../test-identity/service-cert.pem');
var identkey = fs.readFileSync('../test-identity/identity-private-key.pem');
var identcert = fs.readFileSync('../test-identity/identity-cert.pem');

var compcert = servicecert + identcert;

var options = {
  hostname: 'localhost',
  port:5555,
  path: '/org.temperance.details/additional_info?readme=activate',
    method: 'POST',
    // The key and cert of who I am
    key: servicekey,
    cert: servicecert,
    ca : [
	// The identity of who i trust
	fs.readFileSync('../identity/identity-cert.pem'),
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
