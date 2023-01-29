import { Input, Button, Text, Flex, Spinner, useToast } from '@chakra-ui/react'
import { useAccount, useSigner, useBalance } from 'wagmi'
import { useState, useEffect } from "react";
import { ethers } from 'ethers'
import Contract from '../../contract/Voting'
import { RegisteredProposals } from "../../components/Lists/RegisteredProposals";
import useMembersProvider from '@/hooks/useMembersProvider'

export const AddProposals = () => {
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const toast = useToast()

  const { contractAddress, proposals, setProposals } = useMembersProvider()

  // STATE
  const [isLoading, setIsLoading] = useState(false)
  const [proposal, setProposal] = useState(null)
  // const [proposals, setProposals] = useState([])

  useEffect(() => {
    getProposals()
  }, [isConnected, address])

  const getProposals = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
    const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 0, 'latest')
    let registeredList = []
    for await (const registeredProposalsEvent of registeredProposalsEvents) {
      //console.log(registeredProposalsEvent)
      //console.log(registeredProposalsEvent.args.proposalId.toString())
      const registeredProposal = await contract.getOneProposal(registeredProposalsEvent.args.proposalId)
      registeredList.push([registeredProposalsEvent.args.proposalId.toString(), registeredProposal.voteCount.toString(), registeredProposal.description])
    }
    setProposals(registeredList)
    // console.log("registeredList")
    // console.log(registeredList)
    // console.log("proposals")
    // console.log(proposals)
  }

  const registerProposal = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const proposalRegistration = await contract.addProposal(proposal)
      await proposalRegistration.wait()
      getProposals()
      //console.log(registeredList)
      //getData()
      toast({
        title: 'New proposal added',
        description: `You successfully added a proposal`, //error.message
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The proposal registration failed, please try again...",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <Flex>
      <Flex>
        <Text>Add a proposal</Text>
        <Input placeholder='Describe here your proposal' onChange={e => setProposal(e.target.value)} />
        <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' mt="1rem" colorScheme='whatsapp' onClick={() => registerProposal()}>Add</Button>
      </Flex>
      <Flex><RegisteredProposals /></Flex>
    </Flex>
  )
}
