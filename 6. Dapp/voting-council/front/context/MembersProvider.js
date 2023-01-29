import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useProvider } from 'wagmi'
import Contract from "../contract/Voting"

const MembersContext = React.createContext(null)

export const MembersProvider = ({ children }) => {

  // Smart Contract address
  const env = process.env.NODE_ENV
  const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  const { address, isConnected } = useAccount()
  const provider = useProvider()

  // STATES
  const [owner, setOwner] = useState(null)
  const [isMember, setIsMember] = useState(null)
  const [registered, setRegistered] = useState([])
  const [voters, setVoters] = useState([])
  const [workflow, setWorkflow] = useState(null)

  useEffect(() => {
    if (isConnected) {
      loadData()
    }
  }, [isConnected, address])

  const loadData = async () => {
    console.log("dans loadData context")
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const owner = await contract.owner()
    setOwner(owner)
    //console.log(owner)
    //console.log(contractAddress)
    const registeredEvents = await contract.queryFilter('VoterRegistered', 0, 'latest')
    let registeredList = []
    registeredEvents.forEach(registeredEvent => {
      registeredList.push(registeredEvent.args[0])
    })
    setRegistered(registeredList)
    setIsMember(registered.includes(address))
    console.log(isMember)
    console.log(workflow)
    console.log(registered)
  }

  return (
    <MembersContext.Provider
      value={{
        owner,
        setOwner,
        workflow,
        setWorkflow,
        registered,
        setRegistered,
        voters,
        setVoters,
        isMember,
        setIsMember,
        contractAddress
      }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export default MembersContext;
