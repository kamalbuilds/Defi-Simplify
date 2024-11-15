import { useMemo } from "react"

const useMemoizedAddressLabel = (address: string, character: number) => {
    const CHAR_DISPLAYED = character

    const addressLabel = useMemo(() => {
        if (address) {
            const firstPart = address.slice(0, CHAR_DISPLAYED)
            const lastPart = address.slice(address.length - CHAR_DISPLAYED)

            return `${firstPart}...${lastPart}`
        }

        return address
    }, [address])

    return addressLabel
}

export default useMemoizedAddressLabel
