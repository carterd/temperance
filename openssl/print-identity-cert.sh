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

# Identity Creation
#
IDENTITY_PRIVATE_KEY_PATH=${IDENTITY_DIR}/${IDENTITY_PRIVATE_KEY_FILE}
IDENTITY_CSR_PATH=${IDENTITY_DIR}/${IDENTITY_CSR_FILE}
IDENTITY_CERT_PATH=${IDENTITY_DIR}/${IDENTITY_CERT_FILE}

openssl x509 -in ${IDENTITY_CERT_PATH} -text -noout -certopt no_header,no_signame,no_serial,no_validity,no_pubkey,no_sigdump,no_aux,no_version
echo -e ""
openssl x509 -in ${IDENTITY_CERT_PATH} -text -noout

exit 0

