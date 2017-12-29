#!/bin/bash

# Defaults
#
IDENTITY_SIZE=2048
CERT_DAYS=9999

# Directories
#
SERVICE_DIR=../service

# Filenames
#
SERVICE_PRIVATE_KEY_FILE=service-private-key.pem
SERVICE_CSR_FILE=service-csr.pem
SERVICE_CERT_FILE=service-cert.pem

# Identity Creation
#
SERVICE_CERT_PATH=${SERVICE_DIR}/${SERVICE_CERT_FILE}

openssl x509 -in ${SERVICE_CERT_PATH} -text -noout -certopt no_header,no_signame,no_serial,no_validity,no_pubkey,no_sigdump,no_aux,no_version
echo -e ""
openssl x509 -in ${SERVICE_CERT_PATH} -text -noout

exit 0

