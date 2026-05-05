FROM quay.io/keycloak/keycloak:26.2

ENV KC_BOOTSTRAP_ADMIN_USERNAME=admin
ENV KC_BOOTSTRAP_ADMIN_PASSWORD=admin123

EXPOSE 10000

CMD /opt/keycloak/bin/kc.sh start-dev --http-port=10000 --http-host=0.0.0.0
