FROM quay.io/keycloak/keycloak:26.2 as builder

WORKDIR /opt/keycloak

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.2

COPY --from=builder /opt/keycloak/ /opt/keycloak/

EXPOSE 10000

CMD /opt/keycloak/bin/kc.sh start-dev --optimized --http-port=10000 --http-host=0.0.0.0
