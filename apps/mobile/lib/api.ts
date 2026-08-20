import { createApiClient } from "@biotech-arbitrage/api-client";
import { createConfig } from "@biotech-arbitrage/config";

const config = createConfig(process.env);

export const api = createApiClient({ baseUrl: config.apiBaseUrl });
