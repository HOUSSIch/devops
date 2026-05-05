FROM quay.io/keycloak/keycloak:24.0

# Set admin credentials
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin123

# Disable HTTPS requirement (for development only)
ENV KC_HTTP_ENABLED=true
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY=edge

# Use a standard port (8080 is default for Keycloak in dev mode)
EXPOSE 8080

# Start Keycloak in production mode instead of dev mode
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--http-enabled=true", "--hostname-strict=false", "--http-port=8080", "--proxy-headers=xforwarded"]
