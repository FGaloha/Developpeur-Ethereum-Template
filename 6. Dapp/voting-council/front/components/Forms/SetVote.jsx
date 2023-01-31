import { Button, Text, Flex, useToast, Select } from '@chakra-ui/react'
import { useSigner, useAccount, useProvider } from 'wagmi'
import { useState, useEffect } from "react";
import { ethers } from 'ethers'
import Contract from '../../contract/Voting'
import { RegisteredProposals } from "../../components/Lists/RegisteredProposals";
import useMembersProvider from '@/hooks/useMembersProvider'

export const SetVote = () => {
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const toast = useToast()
  const { contractAddress, proposals, setProposals, addHasVoted, setAddHasVoted } = useMembersProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [vote, setVote] = useState(null)

  useEffect(() => {
    getProposals()
  }, [isConnected, address])

  const getProposals = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    // const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 8405203, 'latest')

    let registeredProposalsEvents = [];
    // code pour récupérer les events par block de 1000
    const startBlock = 8405203; //Block number where the contract was deployed
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      console.log("i", i)
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('ProposalRegistered', _startBlock, _endBlock);
      registeredProposalsEvents = [...registeredProposalsEvents, ...data]
    }

    let registeredList = []
    for await (const registeredProposalsEvent of registeredProposalsEvents) {
      const registeredProposal = await contract.getOneProposal(registeredProposalsEvent.args.proposalId)
      registeredList.push([registeredProposalsEvent.args.proposalId.toString(), registeredProposal.voteCount.toString(), registeredProposal.description])
    }
    setProposals(registeredList)
  }

  const registerVote = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const voteRecording = await contract.setVote(vote)
      await voteRecording.wait()
      setAddHasVoted(true)
      toast({
        title: 'Vote stored',
        description: `You successfully vote for proposal ${vote}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The vote registration failed, please try again...",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <Flex direction="column" width="100%">
      <Flex ps="2" alignItems="center" justifyContent="start" width="100%">
        {!addHasVoted && <Text>Set vote</Text>}
        {proposals.length > 0 ? (
          <Flex>
            {!addHasVoted ? (
              <Flex my="4">
                <Select id="selectVote" ms="2" placeholder='Select your proposal' size='md' onChange={e => setVote(e.target.value)} >
                  {proposals.slice(0).map(proposal => (
                    <option key={proposal[0]} value={proposal[0]}>{proposal[0]}-{proposal[2]}</option>))}
                </Select>
                <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => registerVote()}>Vote</Button>
              </Flex>
            ) : (<Text>Thank you to have voted ! </Text>)}
          </Flex>
        ) : (<Text>No proposals to vote</Text>)}
      </Flex>
      {!addHasVoted && (
        <Flex borderTop="2px" alignItems="center" justifyContent="center" pt="2" pb="4"><RegisteredProposals /></Flex>)}
    </Flex>
  )
}
