import { Input, Button, Text, Flex, Spinner, useToast } from '@chakra-ui/react'
import { useAccount, useSigner } from 'wagmi'
import { useState } from "react";
import { ethers } from 'ethers'
import Contract from '../../contract/Voting'
import { RegisteredList } from "../../components/Lists/RegisteredList";
import useMembersProvider from '@/hooks/useMembersProvider'

export const Workflow = ({ workflow, contractAddress, launchNextPhase, getData }) => {
  const { data: signer } = useSigner()

  const { setRegistered } = useMembersProvider()
  const toast = useToast()

  // STATE
  const [isLoading, setIsLoading] = useState(false)
  const [voterAddress, setVoterAddress] = useState(null)

  const registerVoter = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      console.log(voterAddress)
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

  return (
    <>
      <Flex>

        {(() => {
          switch (workflow) {
            case 1:
              return (
                <>
                  <Text>End registering proposal</Text>
                  <Button mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 2:
              return (
                <>
                  <Text>Start voting</Text>
                  <Button mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 3:
              return (
                <>
                  <Text>End voting</Text>
                  <Button mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
                </>)
            case 4:
              return (
                <>
                  <Text>Tally votes</Text>
                  <Button mt="1rem" colorScheme='whatsapp' onClick={() => launchNextPhase()}>Validate</Button>
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
                      <Flex>
                        <Text width="100%">Manage voters registration</Text>
                        <Input placeholder='Address of the voter to register' onChange={e => setVoterAddress(e.target.value)} />
                        <Button colorScheme='whatsapp' onClick={() => registerVoter()}>Register</Button>
                      </Flex>
                      {!isLoading && (
                        <Flex justifyContent="start" width="100%">
                          <RegisteredList />
                        </Flex>
                      )}
                    </Flex>
                    {isLoading && (
                      <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                      />
                    )}
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
