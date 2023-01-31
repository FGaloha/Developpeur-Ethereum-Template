import { Input, Button, Text, Flex, Spinner, useToast } from '@chakra-ui/react'
import { useSigner } from 'wagmi'
import { useState } from "react";
import { ethers } from 'ethers'
import Contract from '../../contract/Voting'
import { RegisteredList } from "../../components/Lists/RegisteredList";
import useMembersProvider from '@/hooks/useMembersProvider'

export const Workflow = ({ getData }) => {
  const { data: signer } = useSigner()

  const { workflow, setRegistered, contractAddress } = useMembersProvider()
  const toast = useToast()

  // STATE
  const [isLoading, setIsLoading] = useState(false)
  const [voterAddress, setVoterAddress] = useState(null)

  const registerVoter = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const voterRegistration = await contract.addVoter(voterAddress)
      await voterRegistration.wait()
      let registeredProposalsEvents = [];

      // code pour récupérer les events par block de 1000
      const startBlock = 8405203; //Block number where the contract was deployed
      const endBlock = latest;

      for (let i = startBlock; i < endBlock; i += 1000) {
        console.log("i", i)
        const _startBlock = i;
        const _endBlock = Math.min(endBlock, i + 999);
        const data = await contract.queryFilter('ProposalRegistered', _startBlock, _endBlock);
        registeredProposalsEvents = [...registeredProposalsEvents, ...data]
      }
      //const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 8405203, 'latest')
      console.log("new query index")

      //const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 8405203, 'latest')
      console.log("new query")

      let registeredList = []
      registeredEvents.forEach(registeredEvent => {
        registeredList.push(registeredEvent.args[0])
      })
      setRegistered(registeredList)
      setVoterAddress(null)
      toast({
        title: 'New address added',
        description: `You successfully added ${voterAddress.substring(0, 5)}...${voterAddress.substring(voterAddress.length - 4)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The registration did not succeed, please try again...",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  const SpinnerNext = () => {
    return (
      <Flex mt="4" mb="2" direction="column" width="100%" alignItems="center" justifyContent="center">
        <Text as='b'>Processing</Text>
        <Spinner
          thickness='4px'
          speed='0.65s'
          emptyColor='gray.200'
          color='blue.500'
          size='xl'
        />
      </Flex>
    )
  }

  const launchNextPhase = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let nextPhase
      switch (workflow) {
        case 1:
          nextPhase = await contract.endProposalsRegistering()
          break;
        case 2:
          nextPhase = await contract.startVotingSession()
          break;
        case 3:
          nextPhase = await contract.endVotingSession()
          break;
        case 4:
          nextPhase = await contract.tallyVotes()
          break;
        default:
          nextPhase = await contract.startProposalsRegistering()
          break;
      }
      await nextPhase.wait()
      await getData()
      toast({
        title: 'New phase started',
        description: `You successfully ended phase ${workflow}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The new phase did not start, please try again...",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <>
      <Flex width="100%">

        {(() => {
          switch (workflow) {
            case 1:
              return (
                <Flex width="100%" alignItems="center" justifyContent="start" border="2px" my="4">
                  <Text ps="2">End registering proposal</Text>
                  <Button my="2" ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </Flex>)
            case 2:
              return (
                <Flex width="100%" alignItems="center" justifyContent="start" border="2px" my="4">
                  <Text ps="2">Start voting</Text>
                  <Button my="2" ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </Flex>)
            case 3:
              return (
                <Flex width="100%" alignItems="center" justifyContent="start" border="2px" my="4">
                  <Text ps="2">End voting</Text>
                  <Button my="2" ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </Flex>)
            case 4:
              return (
                <Flex width="100%" alignItems="center" justifyContent="start" border="2px" my="4">
                  <Text ps="2">Tally votes</Text>
                  <Button my="2" ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </Flex>)
            case 5:
              return (
                <Flex width="100%" alignItems="center" justifyContent="start" border="2px" my="4">
                  <Text ps="2">Voting process ended. Results publically available.</Text>
                </Flex>
              )
            default:
              return (
                <>
                  <Flex direction="column" w="100%">
                    <Flex mt="2" w="100%" direction="column" alignItems="start" justifyContent="center" border="2px">
                      {!isLoading && (
                        <>
                          <Text my="2" ps="2">Manage voters registration</Text>
                          <Flex ps="2" mb="2" alignItems="start" justifyContent="center" width="100%">

                            <Input placeholder='Address of the voter to register' onChange={e => setVoterAddress(e.target.value)} />
                            <Button mx="2" colorScheme='whatsapp' onClick={() => registerVoter()}>Register</Button>
                          </Flex>
                          <Flex ps="2" mt="3" mb="10" justifyContent="center" width="100%">
                            <RegisteredList />
                          </Flex>
                        </>
                      )}
                    </Flex>
                    {isLoading && (
                      <SpinnerNext />
                    )}
                    {!isLoading && (
                      <Flex width="100%" alignItems="center" justifyContent="start" border="2px" my="4">
                        <Text ps="2">Start registering proposal</Text>
                        <Button my="2" ms="2" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                      </Flex>)
                    }
                  </Flex>
                </>)
          }
        })()}

      </Flex>
    </>

  )
}
