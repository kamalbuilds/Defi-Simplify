export const handleCheckApprove = async ({
  activeAccount,
  token,
  routerAddress,
  amount,
  contract,
}) => {
  console.log("Token", token)
  if (!activeAccount) return null

  try {
    const res = await contract.allowance(activeAccount?.address, routerAddress)

    console.log("Response >>>",Number(res), amount)

    if (Number(res) >= 0 && Number(res) < amount) {
      return false
    } else {
      return true
    }
  } catch (error) {
    console.log("Error", error)
    return null
  }
}
