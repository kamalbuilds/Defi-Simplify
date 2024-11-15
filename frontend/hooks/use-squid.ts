import { Squid } from "@0xsquid/sdk"
import { useState } from "react"
import { useActiveAccount, useActiveWallet } from "thirdweb/react"

export const useSquid = () => {
  const activeAccount = useActiveAccount()
  const [loading, setLoading] = useState(false)
const wallet = useActiveWallet();

  const getSDK = (): Squid => {
    const squid = new Squid({
      baseUrl: "https://apiplus.squidrouter.com/v2",
      integratorId: process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || "",
    });
    return squid;
  };

  
  const initSquid = async () => {
    const squid = getSDK();
    await squid.init();
    console.log("Squid initialized");
    return squid
  }

  const executeSquidRoute = async (params: any) => {
    setLoading(true);

    try {
      const squid = await initSquid();
      const { route } = await squid.getRoute(params)
      
      console.log(route,"route")
      const tx = await squid.executeRoute({
        signer: activeAccount,
        route,
      })
      await tx.wait()
      return tx.hash
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { executeSquidRoute, loading }
}