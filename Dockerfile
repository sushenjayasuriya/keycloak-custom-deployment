FROM quay.io/keycloak/keycloak:26.6.4

# Copy custom theme
COPY custom-theme /opt/keycloak/themes/custom.v2

# Copy ONLY the working SMS OTP provider
COPY sms-otp-authenticator-266.jar /opt/keycloak/providers/

# Copy the realm export file so it can be imported on startup
COPY thingsboard-realm.json /opt/keycloak/data/import/

# Start Keycloak in development mode and import the realm automatically
CMD ["start-dev", "--import-realm"]
