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
  const [isMember, setIsMember] = useState(false)
  const [registered, setRegistered] = useState([])
  const [voters, setVoters] = useState([])
  const [workflow, setWorkflow] = useState(null)
  const [proposals, setProposals] = useState([])
  const [hasVotedList, setHasVotedList] = useState([])
  const [addHasVoted, setAddHasVoted] = useState(false)
  const [winningProposal, setWinningProposal] = useState([])

  useEffect(() => {
    if (isConnected) {
      loadData()
    }
  }, [isConnected, address])

  const loadData = async () => {

    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)

    // Contract owner
    const owner = await contract.owner()
    setOwner(owner)

    // // List of registered address
    // const registeredEvents = await contract.queryFilter('VoterRegistered', 0, 'latest')
    // let registeredList = []
    // registeredEvents.forEach(registeredEvent => {
    //   registeredList.push(registeredEvent.args[0])
    // })
    // setRegistered(registeredList)

    // // Boolean true if address is registered
    // setIsMember(registered.includes(address))

    // // List of address who have voted
    // const hasVotedEvents = await contract.queryFilter('Voted', 0, 'latest')
    // let hasVoted = []
    // hasVotedEvents.forEach(hasVotedEvent => {
    //   hasVoted.push(hasVotedEvent.args.voter)
    // })
    // setHasVotedList(hasVoted)

    // // Boolean true if address has voted
    // setAddHasVoted(hasVoted.includes(address))
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
        proposals,
        setProposals,
        hasVotedList,
        setHasVotedList,
        addHasVoted,
        setAddHasVoted,
        winningProposal,
        setWinningProposal,
        contractAddress
      }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export default MembersContext;
