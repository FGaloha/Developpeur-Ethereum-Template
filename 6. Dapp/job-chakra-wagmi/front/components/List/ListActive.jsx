import { useState, useEffect } from 'react';
import Contract from '../../../back/artifacts/contracts/Jobs.sol/Jobs'
import { useProvider, useSigner } from 'wagmi'
import { ethers } from 'ethers';
import {
  Flex, Heading, Text, Box, Table, Button, useToast,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer, Card, CardHeader, CardBody, CardFooter, SimpleGrid, Divider
} from '@chakra-ui/react'

export const ListActive = ({ address, contractAddress }) => {
  // WAGMI
  const provider = useProvider()
  const { data: signer } = useSigner()

  // CHAKRA-UI
  const toast = useToast()

  // STATE
  const [isLoadingTake, setIsLoadingTake] = useState(false)
  const [isLoadingPay, setIsLoadingPay] = useState(false)
  const [listJobs, setListJobs] = useState([]);

  useEffect(() => {
    getJobs();
  }, [])

  const getJobs = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
    const filter = {
      address: contractAddress,
      fromBlock: 0
    }
    const fullEventJobs = await contract.queryFilter(filter)
    let EventsJobAddedActive = []
    let EventsJobTakenActive = []
    let EventsJobFinished = []
    for await (const fullEventJob of fullEventJobs) {
      if (fullEventJob.event == "jobAdded") {
        EventsJobAddedActive.push([fullEventJob.args[0], fullEventJob.args[1], fullEventJob.args[2], parseInt(fullEventJob.args[3]), fullEventJob.args[4], false])
      }
      else if (fullEventJob.event == "jobTaken") {
        EventsJobTakenActive.push([fullEventJob.args[0], fullEventJob.args[1]])
      }
      else if (fullEventJob.event == "jobIsFinishedAndPaid") {
        EventsJobFinished.push(parseInt(fullEventJob.args[2]))
      }
    }
    for await (const EventJobAddedActive of EventsJobAddedActive) {
      // removing tasks finishe/paid
      for (let i = 0; i < EventsJobFinished.length; i++) {
        if (EventJobAddedActive[3] == EventsJobFinished[i]) {
          delete EventsJobAddedActive[EventsJobFinished[i]]
        }
      }
      // introducing taken/worker information
      for await (const EventJobTakenActive of EventsJobTakenActive) {
        if (EventJobAddedActive[3] == EventJobTakenActive[1]) {
          // indicate the task has been taken
          EventJobAddedActive[5] = true
          // indicate the worker address
          EventJobAddedActive[6] = EventJobTakenActive[0]
        }
      }

    }
    setListJobs(EventsJobAddedActive)
  }

  const takeJob = async (id) => {
    setIsLoadingTake(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.takeJob(id);
      await transaction.wait()
      getJobs()

      toast({
        title: 'Job taken',
        description: `You have successfully taken job ${id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The job update of ${id} did not succeed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoadingTake(false);
  }

  const setIsFinishedAndPaid = async (id) => {
    setIsLoadingPay(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.setIsFinishedAndPaid(id);
      await transaction.wait()
      getJobs()

      toast({
        title: 'Job paid',
        description: `You have successfully paid job ${id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The payment of job ${id} did not succeed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoadingPay(false);
  }

  return (
    <Flex
      direction="column"
      align="stretch"
      w="80%"
      border="1px"
      borderColor="orange.400"
      borderRadius="5"
    >
      <Box textAlign="center" bg="orange.300">
        <Heading py='4' size='lg'>List of active jobs</Heading>
      </Box>
      <Box m="4">
        {listJobs.length > 0 ? (
          <>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th>Author</Th>
                    <Th>Price (ETH)</Th>
                    <Th>Job status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {listJobs.slice(0).reverse().map(listJob => (
                    <Tr key={listJobs.indexOf(listJob)}>
                      <Td>{listJob[1]}</Td>
                      <Td>{listJob[0].substring(0, 5)}...{listJob[0].substring(listJob[0].length - 4)}</Td>
                      <Td isNumeric>{ethers.utils.formatEther(listJob[2].toString())}</Td>
                      <Td>
                        {/* show if address took the job}*/}
                        {listJob[6] == address && listJob[5] ? (<Text>You took the task</Text>) : ""}
                        {/* show if author and nobody took the job}*/}
                        {listJob[0] == address && !listJob[5] ? (<Text>Waiting to be taken</Text>) : ""}
                        {/* show if not the author & job not taken */}
                        {listJob[0] != address && !listJob[5] ? (<Button me="2" isLoading={isLoadingTake ? 'isLoading' : ''} loadingText='Loading' bgColor="blackAlpha.900" textColor="white" colorScheme="orange" onClick={() => takeJob(listJob[3])}>Take</Button>) : ""}
                        {/* show if the author & job taken & not finished/paid */}
                        {listJob[0] == address && listJob[5] && !listJob[7] ? (<Button isLoading={isLoadingPay ? 'isLoading' : ''} loadingText='Loading' bgColor="blackAlpha.900" textColor="white" colorScheme="orange" onClick={() => setIsFinishedAndPaid(listJob[3])}>Pay</Button>) : ""}

                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            <Divider my="10" orientation='horizontal' />

            <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
              {listJobs.slice(0).reverse().map(listJob => (<Card key={listJobs.indexOf(listJob)}>
                <CardHeader>
                  <Text size='md'> <b>Author:</b> {listJob[0].substring(0, 5)}...{listJob[0].substring(listJob[0].length - 4)}</Text>
                </CardHeader>
                <CardBody>
                  <Text>{listJob[1]}</Text>
                </CardBody>
                <CardFooter>
                  {/* show if address took the job}*/}
                  {listJob[6] == address && listJob[5] ? (<Text color="green"><b>You took the task</b></Text>) : ""}
                  {/* show if author and nobody took the job}*/}
                  {listJob[0] == address && !listJob[5] ? (<Text color="green" ><b>Waiting to be taken</b></Text>) : ""}
                  {/* show if not the author & job not taken */}
                  {listJob[0] != address && !listJob[5] ? (<Button me="2" isLoading={isLoadingTake ? 'isLoading' : ''} loadingText='Loading' bgColor="blackAlpha.900" textColor="white" colorScheme="orange" onClick={() => takeJob(listJob[3])}>Take</Button>) : ""}
                  {/* show if the author & job taken & not finished/paid */}
                  {listJob[0] == address && listJob[5] && !listJob[7] ? (<Button isLoading={isLoadingPay ? 'isLoading' : ''} loadingText='Loading' bgColor="blackAlpha.900" textColor="white" colorScheme="orange" onClick={() => setIsFinishedAndPaid(listJob[3])}>Pay</Button>) : ""}
                </CardFooter>
              </Card>))}
            </SimpleGrid>
          </>
        ) : (
          <Text>
            No task to manage for the moment. Please come back later.
          </Text>
        )}
      </Box>
    </Flex>
  )
};
