import { createThirdwebClient, defineChain } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_PRIVATE_ID,
});

export const chain = defineChain(baseSepolia);
