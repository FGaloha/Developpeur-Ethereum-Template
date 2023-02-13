import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useProvider } from 'wagmi';
import ContractFactory from "../contracts/Factory";

const MembersContext = React.createContext(null)

export const MembersProvider = ({ children }) => {

  // Smart Contract address
  const env = process.env.NODE_ENV
  const contractAddressFactory = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI_FACTORY : process.env.NEXT_PUBLIC_NETWORK_HARDHAT_FACTORY
  // const contractFactoryAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI_FACTORY

  // Wagmi
  const { address, isConnected } = useAccount()
  const provider = useProvider()

  // State
  const [ownerFactory, setOwnerFactory] = useState(null)
  const [isSubsidiary, setIsSubsidiary] = useState(false)
  const [subsidiaries, setSubsidiaries] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    if (isConnected) {
      loadData()
    }
  }, [isConnected, address])

  const loadData = async () => {
    const contractFactory = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

    // Contract owner
    const ownerFactory = await contractFactory.owner()
    setOwnerFactory(ownerFactory)
    // console.log(ownerFactory)
  }

  return (
    <MembersContext.Provider
      value={{
        ownerFactory,
        contractAddressFactory,
        isSubsidiary,
        setIsSubsidiary,
        subsidiaries,
        setSubsidiaries,
        collections,
        setCollections
      }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export default MembersContext;
