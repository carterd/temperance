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

# Identity details
#
IDENTITY_PRIVATE_KEY_PATH=${IDENTITY_DIR}/${IDENTITY_PRIVATE_KEY_FILE}
IDENTITY_CSR_PATH=${IDENTITY_DIR}/${IDENTITY_CSR_FILE}
IDENTITY_CERT_PATH=${IDENTITY_DIR}/${IDENTITY_CERT_FILE}

# Read input string
#
input_string=
function input_string {
    user_input=
    input_string=
    until [ ! -z "$user_input" ]; do
        echo -e "$1"
        read user_input
        user_input=`echo "$user_input" | sed -e "s/^[ \t]*//" -e "s/[ \t]*$//" -e "s/[ \t]+/ /g" | grep "$2"`
        if [ $? -ne 0 ]; then
            echo -e "Invalid string doesn't match '$2'"
	else
	    input_string=$user_input
	    user_input="found"
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

# Print some text
#
function print {
    echo -e "$1"
}

# Error and exit
#
function error {
    echo -e "ERROR : $1"
    exit 1
}

# START EXECUATION HERE
#
title "Identity Certificate Creation"

# Checks for directory
#
if [ -n "$(ls -A ${IDENTITY_DIR})" ]; then
  error "Identity directory '${IDENTITY_DIR}' is not empty"
fi

# Encryption options
#
input_string "Encrypt identity with passphrase (Y/N):" "^[YyNn]$";                  pass=$input_string
if [ "$pass" = "Y" ] || [ "$pass" = "y" ]; then
    input_string "Passphrase to encrypt identity private key:" "^[-.a-zA-Z0-9 ]\+$"; pass=$input_string
else
    pass=""
fi

# Identity details
#
title "Enter Identity Details"

input_string "First or given name, or used psedonym:" "^[-.a-zA-Z ]\{1,\}$";        givenname=$input_string
input_string "Surname, or used family name psedonym:" "^[-.a-zA-Z ]\{1,\}$";        surname=$input_string
input_string "Initials:" "^[-.a-zA-Z ]*$";                                          initials=$input_string
input_string "Your country of origin (2 letter code):" "^[A-Z]\{2\}$";              country=$input_string
input_string "State or Province" "^[-.a-zA-Z ]\+$";                                 state=$input_string
input_string "City or Town" "^[-.a-zA-Z ]\+$";                                      city=$input_string
organisation="temperance"
organisation_unit="identity"

# Generation private key file
#
title "Generating '${IDENTITY_PRIVATE_KEY_PATH}' file private-key required to sign certificates"
if [ "$pass" = "" ]; then
    openssl genrsa -out ${IDENTITY_PRIVATE_KEY_PATH} ${IDENTITY_SIZE} > /dev/null 2>&1
else
    openssl genrsa ${IDENTITY_SIZE} 2> /dev/null | openssl pkcs8 -topk8 -outform PEM -passout "pass:$pass" -out ${IDENTITY_PRIVATE_KEY_PATH} > /dev/null 2>&1
fi
name=`openssl rsa -noout -modulus -passin "pass:$pass" -in ${IDENTITY_PRIVATE_KEY_PATH} | sed -e "s/^.*=//" | tr -d '\n' | openssl dgst -sha1 | sed -e "s/^.*=[ \t]//"`
name="sha1:$name"

# Generation certificate request file
#
title "Generating '${IDENTITY_CSR_PATH}' required to create identity certificate"
openssl req -new -key ${IDENTITY_PRIVATE_KEY_PATH} -passin "pass:$pass" -out ${IDENTITY_CSR_PATH} -subj "/SN=$surname/GN=$givenname/initials=$initials/CN=$name/C=$country/ST=$state/L=$city/O=$organisation/OU=$organisation_unit" > /dev/null 2>&1

# Generation certificat file
#
title "Generating '${IDENTITY_CERT_PATH}' certificate file"
openssl x509 -req -days ${CERT_DAYS} -in ${IDENTITY_CSR_PATH} -passin "pass:$pass" -signkey ${IDENTITY_PRIVATE_KEY_PATH} -out ${IDENTITY_CERT_PATH} > /dev/null 2>&1

# Finished 
#
title "Finished"
exit 0
