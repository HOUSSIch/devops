import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8085",
  realm: "deepskyn",
  clientId: "frontend",
});

export default keycloak;