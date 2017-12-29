#!/bin/bash

# Defaults
#
IDENTITY_SIZE=2048
CERT_DAYS=9999

# Directories
#
IDENTITY_DIR=../identity

# Filenames
#
IDENTITY_PRIVATE_KEY_FILE=identity-private-key.pem
IDENTITY_CSR_FILE=identity-csr.pem
IDENTITY_CERT_FILE=identity-cert.pem

rm ../identity/*

# Identity details
#
IDENTITY_PRIVATE_KEY_PATH=${IDENTITY_DIR}/${IDENTITY_PRIVATE_KEY_FILE}
IDENTITY_CSR_PATH=${IDENTITY_DIR}/${IDENTITY_CSR_FILE}
IDENTITY_CERT_PATH=${IDENTITY_DIR}/${IDENTITY_CERT_FILE}

# Read input string
#
input_string=
function input_string {
    input_string=
    until [ ! -z "$input_string" ]; do
        echo -e "$1"
        read input_string
        input_string=`echo $input_string | sed -e "s/^[ \t]*//" -e "s/[ \t]*$//" -e "s/[ \t]+/ /g" | grep "$2"`
        if [ -z "$input_string" ]; then
            echo -e "Invalid string doesn't match '$2'"
        fi
    done
    echo -e ""
}

# Title some text
#
function title {
    echo -e "$1"
    echo -e "--------------------------------------------------------------------------------\n"
}

# Error and exit
#
function error {
    echo -e "ERROR : $1"
    exit 1
}

title "Identity Certificate Creation"

if [ -n "$(ls -A ${IDENTITY_DIR})" ]; then
  error "Identity directory '${IDENTITY_DIR}' is not empty"
fi

input_string "Encrypt identity with passphrase (Y/N):" "^[YyNn]$";                  pass=$input_string
if [ "$pass" = "Y" ] || [ "$pass" = "y" ]; then
    input_string "Passphrase to encrypt identity private key:" "^[-.a-zA-Z0-9 ]\+$"; pass=$input_string
else
    pass=""
fi

title "Enter Identity Details"

input_string "Your full name, or used pseudonym:" "^[-.a-zA-Z ]\{6,\}$";            name=$input_string
input_string "Your country of origin (2 letter code):" "^[A-Z]\{2\}$";              country=$input_string
input_string "State or Province" "^[-.a-zA-Z ]\+$";                                 state=$input_string
input_string "City or Town" "^[-.a-zA-Z ]\+$";                                      city=$input_string
organisation="temperance"
organisation_unit="identity"

title "Generating '${IDENTITY_PRIVATE_KEY_PATH}' file private-key required to sign certificates"

openssl genrsa -out ${IDENTITY_PRIVATE_KEY_PATH} ${IDENTITY_SIZE} > /dev/null 2>&1

title "Generating '${IDENTITY_CSR_PATH}' required to create identity certificate"

openssl req -new -key ${IDENTITY_PRIVATE_KEY_PATH} -out ${IDENTITY_CSR_PATH} -subj "/CN=$name/C=$country/ST=$state/L=$city/O=$organisation/OU=$organisation_unit"

title "Generating '${IDENTITY_CERT_PATH}' certificate file"

openssl x509 -req -days ${CERT_DAYS} -in ${IDENTITY_CSR_PATH} -signkey ${IDENTITY_PRIVATE_KEY_PATH} -out ${IDENTITY_CERT_PATH}

title "Finished"

exit 0




#openssl req -new   -config identity-ca.cnf -key ${IDENTITY_PRIVATE_KEY_PATH} -out ${IDENTITY_CSR_PATH} -subj "/C=UK/ST=Midlands/L=YourLocation/O=YourApp/OU=YourApp demo" > /dev/null 2>&1
#openssl x509 -req -days 9999 -in csr.pem -signkey private-key.pem -out cert.pem

# CA
##openssl req -new -x509 -days 9999 -config server-ca.cnf -keyout server-ca-key.pem -out server-ca-cert.pem
##openssl req -new -x509 -days 9999 -config client-ca.cnf -keyout client-ca-key.pem -out client-ca-cert.pem

# used private keys
##openssl genrsa -out server-key.pem 4096
##openssl genrsa -out client-key.pem 4096

# requests for the certificates
##openssl req -new -config server.cnf -sha256 -key server-key.pem -out server-csr.pem
##openssl req -new -config client.cnf -sha256 -key client-key.pem -out client-csr.pem

# sign the request
##openssl x509 -req -extfile server.cnf -days 999 -passin "pass:password" -in server-csr.pem -CA server-ca-cert.pem -CAkey server-ca-key.pem -CAcreateserial -out server-cert.pem
##openssl x509 -req -extfile client.cnf -days 999 -passin "pass:password" -in client-csr.pem -CA client-ca-cert.pem -CAkey client-ca-key.pem -CAcreateserial -out client-cert.pem

# Intermediate
##openssl genrsa -out intermediate-key.pem 2048
##openssl req -config intermediate-ca.cnf -new -sha256 -key intermediate-key.pem -out intermediate-csr.pem
##openssl ca -config intermediate-ca.cnf -outdir . -passin "pass:password" -keyfile server-ca-key.pem -cert server-ca-cert.pem -extensions v3_intermediate_ca -days 5000 -notext -md sha256 -in intermediate-csr.pem -out intermediate-cert.pem
##openssl req -new -config server.cnf -sha256 -key server-key.pem -out inter-server-csr.pem
##openssl x509 -req -extfile server.cnf -days 999 -passin "pass:password" -in inter-server-csr.pem -CA intermediate-cert.pem -CAkey intermediate-key.pem -CAcreateserial -out inter-server-cert.pem


