import { Input, Button, Text, Flex, Spinner, useToast } from '@chakra-ui/react'
import { useAccount, useSigner, useBalance } from 'wagmi'
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
      //console.log(voterAddress)
      const voterRegistration = await contract.addVoter(voterAddress)
      await voterRegistration.wait()
      // console.log(voterAddress)
      const registeredEvents = await contract.queryFilter('VoterRegistered', 0, 'latest')
      let registeredList = []
      registeredEvents.forEach(registeredEvent => {
        registeredList.push(registeredEvent.args[0])
      })
      setRegistered(registeredList)
      //getData()
      toast({
        title: 'New address added',
        description: `You successfully added ${voterAddress}`, //error.message
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
    return (isLoading && (
      <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    ))
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
      // console.log(workflow)
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
      <Flex>

        {(() => {
          switch (workflow) {
            case 1:
              return (
                <>
                  <Text>End registering proposal</Text>
                  <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 2:
              return (
                <>
                  <Text>Start voting</Text>
                  <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 3:
              return (
                <>
                  <Text>End voting</Text>
                  <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 4:
              return (
                <>
                  <Text>Tally votes</Text>
                  <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 5:
              return (
                <Text>Voting process ended. Results publically available.</Text>
              )
            default:
              return (
                <>
                  <Flex direction="column" w="100%">
                    <Flex w="100%" direction="column" alignItems="center" justifyContent="start" border="2px">
                      {!isLoading && (
                        <>
                          <Flex>
                            <Text width="100%">Manage voters registration</Text>
                            <Input placeholder='Address of the voter to register' onChange={e => setVoterAddress(e.target.value)} />
                            <Button colorScheme='whatsapp' onClick={() => registerVoter()}>Register</Button>
                          </Flex>
                          <Flex justifyContent="start" width="100%">
                            <RegisteredList />
                          </Flex>
                        </>
                      )}
                    </Flex>
                    <SpinnerNext />
                    {!isLoading && (
                      <Flex width="100%" alignItems="center" justifyContent="start">
                        <Text>Start registering proposal</Text>
                        <Button colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
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
