import { Input, Button, Text, Flex, useToast } from '@chakra-ui/react'
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useState, useEffect } from "react";
import { ethers } from 'ethers'
import Contract from '../../contract/Voting'
import { RegisteredProposals } from "../../components/Lists/RegisteredProposals";
import useMembersProvider from '@/hooks/useMembersProvider'

export const AddProposals = () => {

  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const toast = useToast()
  const { contractAddress, setProposals } = useMembersProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [proposal, setProposal] = useState("")

  useEffect(() => {
    getProposals()
  }, [isConnected, address])

  const getProposals = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)

    // Development
    // const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 0, 'latest')

    // Production: to get events by 3000 blocks from contract block number  8405203
    let registeredProposalsEvents = [];
    const startBlock = 8405203;
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      // console.log("i", i)
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('ProposalRegistered', _startBlock, _endBlock);
      registeredProposalsEvents = [...registeredProposalsEvents, ...data]
    }

    let registeredList = []
    for await (const registeredProposalsEvent of registeredProposalsEvents) {
      const registeredProposal = await contract.connect(address).getOneProposal(registeredProposalsEvent.args.proposalId)
      registeredList.push([registeredProposalsEvent.args.proposalId.toString(), registeredProposal.voteCount.toString(), registeredProposal.description])
    }
    setProposals(registeredList)
  }

  const registerProposal = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const proposalRegistration = await contract.addProposal(proposal)
      await proposalRegistration.wait()
      document.getElementById("inputProposal").value = ""
      getProposals()
      toast({
        title: 'New proposal added',
        description: `You successfully added a proposal`,
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
    <Flex direction="column" width="100%" alignItems="center" justifyContent="center" my="2">
      <Flex width="100%" alignItems="center" justifyContent="start">
        <Text ps="2">Add a proposal</Text>
        <Input ms="2" width="50%" id="inputProposal" placeholder='Describe here your proposal' onChange={e => setProposal(e.target.value)} />
        <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => registerProposal()}>Add</Button>
      </Flex>
      <Flex ps="2" mt="3" mb="10" justifyContent="center" width="100%">
        <RegisteredProposals />
      </Flex>
    </Flex>
  )
}
