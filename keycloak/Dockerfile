FROM quay.io/keycloak/keycloak:24.0 AS builder

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:24.0

COPY --from=builder /opt/keycloak/ /opt/keycloak/

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin123
ENV KC_HOSTNAME_STRICT=false
ENV KC_HTTP_ENABLED=true

EXPOSE 10000

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["/opt/keycloak/bin/kc.sh start-dev --optimized --http-host=0.0.0.0 --http-port=${PORT:-10000}"]
