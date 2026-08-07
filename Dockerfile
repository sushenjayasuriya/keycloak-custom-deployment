FROM thingsboard/openjdk17:bookworm-slim


WORKDIR /app

COPY oauth2-mapper-1.0.0-boot.jar app.jar

ENV SERVER_PORT=10010
ENV CUSTOM_MAPPER_AUTH_ENABLED=true
ENV CUSTOM_MAPPER_AUTH_USERNAME=admin
ENV CUSTOM_MAPPER_AUTH_PASSWORD="{noop}password"

EXPOSE 10010

CMD ["java","-jar","app.jar"]