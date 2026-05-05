FROM quay.io/keycloak/keycloak:26.2

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

CMD ["start-dev", "--http-port=${PORT}", "--http-host=0.0.0.0"]
