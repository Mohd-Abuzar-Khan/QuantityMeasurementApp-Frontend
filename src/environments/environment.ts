
export const environment = {
  production: false,

  /**
   * Relative URLs so `ng serve` uses proxy.conf.json (same origin → no CORS issues).
   * For a production build served without a proxy, set this to e.g. `http://your-gateway:8080/api/v1`.
   */
  apiUrl: '/api/v1',

  /** Proxied to the API gateway (see proxy.conf.json) */
  oauth2GoogleUrl: '/oauth2/authorization/google',
};
