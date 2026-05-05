import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://keycloak-production-7ec8.up.railway.app",
  realm: "deepskyn",
  clientId: "frontend",
});

export default keycloak;
