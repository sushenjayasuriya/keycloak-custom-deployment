FROM quay.io/keycloak/keycloak:26.6.4

# Copy custom theme
COPY custom-theme /opt/keycloak/themes/custom

# Copy the custom JARs to the providers folder
COPY oauth2-mapper-1.0.0-boot.jar /opt/keycloak/providers/
COPY sms-otp-authenticator-266.jar /opt/keycloak/providers/
COPY email-authenticator-mesutpiskin.jar /opt/keycloak/providers/

# Copy the realm export file so it can be imported on startup
COPY thingsboard-realm.json /opt/keycloak/data/import/

# Start Keycloak in development mode and import the realm automatically
CMD ["start-dev", "--import-realm"]
