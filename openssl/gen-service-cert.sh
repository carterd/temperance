#!/bin/bash

# Defaults
#
SERVICE_SIZE=2048
CERT_DAYS=3650
INDENT="    "

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

# Title some text
#
function title {
    echo -e "$1"
    echo -e "--------------------------------------------------------------------------------\n"
}

# Print some text
#
function print {
    echo -e "$INDENT$1"
}

# Error and exit
#
function error {
    echo -e "ERROR : $1"
    exit 1
}

# Remove file
#
function remove_file {
    if [ -f "$1" ]; then
	print "replacing existing $2 '$1'"
	rm "$1"
	if  [ -f "$1" ]; then
            error "Failed to remove existing $2 '$1'"
        fi
    fi
}

title "Service Identity Creation"

if [ ! -f "${IDENTITY_PRIVATE_KEY_PATH}" ] ; then
    error "Identity private key '${IDENTITY_PRIVATE_KEY_PATH}' not found"
fi
if [ ! -f "${IDENTITY_CERT_PATH}" ] ; then
    error "Identity certificate '${IDENTITY_CERT_PATH}' not found"
fi

identity=`openssl x509 -in ${IDENTITY_CERT_PATH} -subject -noout`
identity=`echo $identity | sed -e "s/^[ \t]*subject=[ \t]*//"`
surname=`echo $identity | sed -e "s/.*SN=//" | sed -e "s/\/.*//"`
givenname=`echo $identity | sed -e "s/.*GN=//" | sed -e "s/\/.*//"`
initials=`echo $identity | sed -e "s/.*initials=//" | sed -e "s/\/.*//"`
name=`echo $identity | sed -e "s/.*CN=//" | sed -e "s/\/.*//"`
country=`echo $identity | sed -e "s/.*C=//" | sed -e "s/\/.*//"`
state=`echo $identity | sed -e "s/.*ST=//" | sed -e "s/\/.*//"`
city=`echo $identity | sed -e "s/.*L=//" | sed -e "s/\/.*//"`
organisation=`echo $identity | sed -e "s/.*O=//" | sed -e "s/\/.*//"`
organisation_unit="server"

print "using identity cert '${IDENTITY_CERT_PATH}'"
print "found identity 'Full name=${name}, Country=${country}, State=${state}, City=${city}'"
print ""

title "Generating '${SERVICE_PRIVATE_KEY_PATH}' file private-key required for service"
remove_file ${SERVICE_PRIVATE_KEY_PATH} "private-key file"
print ""
openssl genrsa -out ${SERVICE_PRIVATE_KEY_PATH} ${SERVICE_SIZE} > /dev/null 2>&1

title "Generating '${SERVICE_CSR_PATH}' required to create service certificate"
remove_file ${SERVICE_CSR_PATH} "CSR file"
print ""
openssl req -new -key ${SERVICE_PRIVATE_KEY_PATH} -out ${SERVICE_CSR_PATH} -subj "/SN=$surname/GN=$givenname/initials=$initials/CN=$name/C=$country/ST=$state/L=$city/O=$organisation/OU=$organisation_unit"

title "Generating '${SERVICE_CERT_PATH}' certificate file"
remove_file ${SERVICE_CERT_PATH} "certificate file"
print ""
openssl x509 -req -days ${CERT_DAYS} -in ${SERVICE_CSR_PATH} -CA ${IDENTITY_CERT_PATH} -CAkey ${IDENTITY_PRIVATE_KEY_PATH} -CAcreateserial -out ${SERVICE_CERT_PATH}

title "Finished"

exit;
