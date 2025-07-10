import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

// connect to your contract
export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address:import.meta.env.VITE_THIRDWEB_CONTRACT_ADDRESS,
});