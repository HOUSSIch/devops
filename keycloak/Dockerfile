ENV KC_HTTP_ENABLED=true
ENV KC_HOSTNAME_STRICT=false

EXPOSE 10000

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--http-host=0.0.0.0", "--http-port=10000"]
