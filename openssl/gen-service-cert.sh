#!/bin/bash

# Defaults
#
SERVICE_SIZE=2048
CERT_DAYS=3650

# Directories
#
IDENTITY_DIR=../identity
SERVICE_DIR=../service

# Filenames
#
IDENTITY_PRIVATE_KEY_FILE=identity-private-key.pem
IDENTITY_CERT_FILE=identity-cert.pem
SERVICE_PRIVATE_KEY_FILE=service-private-key.pem
SERVICE_CERT_FILE=service-cert.pem
SERVICE_CSR_FILE=service-csr.pem

# Identity details
#
IDENTITY_PRIVATE_KEY_PATH=${IDENTITY_DIR}/${IDENTITY_PRIVATE_KEY_FILE}
IDENTITY_CERT_PATH=${IDENTITY_DIR}/${IDENTITY_CERT_FILE}
SERVICE_PRIVATE_KEY_PATH=${SERVICE_DIR}/${SERVICE_PRIVATE_KEY_FILE}
SERVICE_CSR_PATH=${SERVICE_DIR}/${SERVICE_CSR_FILE}
SERVICE_CERT_PATH=${SERVICE_DIR}/${SERVICE_CERT_FILE}

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

title "Service Identity Creation"

if [ ! -f "${IDENTITY_PRIVATE_KEY_PATH}" ] ; then
    error "Identity private key '${IDENTITY_PRIVATE_KEY_PATH}' not found"
fi
if [ ! -f "${IDENTITY_CERT_PATH}" ] ; then
    error "Identity certificate '${IDENTITY_CERT_PATH}' not found"
fi

identity=`openssl x509 -in ${IDENTITY_CERT_PATH} -text -noout -certopt no_header,no_signame,no_serial,no_validity,no_pubkey,no_sigdump,no_aux,no_version | grep "^[ \t]*Subject"`
identity=`echo $identity | sed -e "s/^[ \t]*Subject:[ \t]*//"`
name=`echo $identity | sed -e "s/.*CN=//" | sed -e "s/,.*//"`
country=`echo $identity | sed -e "s/.*C=//" | sed -e "s/,.*//"`
state=`echo $identity | sed -e "s/.*ST=//" | sed -e "s/,.*//"`
city=`echo $identity | sed -e "s/.*L=//" | sed -e "s/,.*//"`
organisation=`echo $identity | sed -e "s/.*O=//" | sed -e "s/,.*//"`
organisation_unit="server"

echo -e "    using identity cert '${IDENTITY_CERT_PATH}'"
echo -e "    found identity 'Full name=${name}, Country=${country}, State=${state}, City=${city}'"
echo -e ""

title "Generating '${SERVICE_PRIVATE_KEY_PATH}' file private-key required for service"

openssl genrsa -out ${SERVICE_PRIVATE_KEY_PATH} ${SERVICE_SIZE} > /dev/null 2>&1

title "Generating '${SERVICE_CSR_PATH}' required to create service certificate"

openssl req -new -key ${SERVICE_PRIVATE_KEY_PATH} -out ${SERVICE_CSR_PATH} -subj "/CN=$name/C=$country/ST=$state/L=$city/O=$organisation/OU=$organisation_unit"

title "Generating '${SERVICE_CERT_PATH}' certificate file"

openssl x509 -req -days ${CERT_DAYS} -in ${SERVICE_CSR_PATH} -signkey ${SERVICE_PRIVATE_KEY_PATH} -out ${SERVICE_CERT_PATH}

title "Finished"

exit;
