openssl genrsa -out private-key.pem 2048
openssl req -new -key private-key.pem -out csr.pem -subj "/C=UK/ST=Midlands/L=YourLocation/O=YourApp/OU=YourApp demo"
openssl x509 -req -days 9999 -in csr.pem -signkey private-key.pem -out cert.pem

# CA
openssl req -new -x509 -days 9999 -config server-ca.cnf -keyout server-ca-key.pem -out server-ca-cert.pem
openssl req -new -x509 -days 9999 -config client-ca.cnf -keyout client-ca-key.pem -out client-ca-cert.pem

# used private keys
openssl genrsa -out server-key.pem 4096
openssl genrsa -out client-key.pem 4096

# requests for the certificates
openssl req -new -config server.cnf -sha256 -key server-key.pem -out server-csr.pem
openssl req -new -config client.cnf -sha256 -key client-key.pem -out client-csr.pem

# sign the request
openssl x509 -req -extfile server.cnf -days 999 -passin "pass:password" -in server-csr.pem -CA server-ca-cert.pem -CAkey server-ca-key.pem -CAcreateserial -out server-cert.pem
openssl x509 -req -extfile client.cnf -days 999 -passin "pass:password" -in client-csr.pem -CA client-ca-cert.pem -CAkey client-ca-key.pem -CAcreateserial -out client-cert.pem

# Intermediate
openssl genrsa -out intermediate-key.pem 2048
openssl req -config intermediate-ca.cnf -new -sha256 -key intermediate-key.pem -out intermediate-csr.pem
openssl ca -config intermediate-ca.cnf -outdir . -passin "pass:password" -keyfile server-ca-key.pem -cert server-ca-cert.pem -extensions v3_intermediate_ca -days 5000 -notext -md sha256 -in intermediate-csr.pem -out intermediate-cert.pem
openssl req -new -config server.cnf -sha256 -key server-key.pem -out inter-server-csr.pem
openssl x509 -req -extfile server.cnf -days 999 -passin "pass:password" -in inter-server-csr.pem -CA intermediate-cert.pem -CAkey intermediate-key.pem -CAcreateserial -out inter-server-cert.pem
