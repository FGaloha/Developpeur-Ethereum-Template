import { useState, useEffect } from 'react';
import Contract from '../../Contract/Jobs'
import { useProvider } from 'wagmi'
import { ethers } from 'ethers';
import {
  Flex, Heading, Text, Box, Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'

export const ListClosed = ({ contractAddress }) => {
  // WAGMI
  const provider = useProvider()

  // STATE
  const [listJobs, setListJobs] = useState([]);

  useEffect(() => {
    getClosedJobs();
  }, [])

  const getClosedJobs = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
    // const filter = {
    //   address: contractAddress,
    //   fromBlock: 0
    // }
    // const fullEventJobs = await contract.queryFilter(filter)
    const fullEventJobs = await contract.queryFilter("*", -100, 'latest')
    let EventsJobAdded = []
    let EventsJobFinished = []
    for await (const fullEventJob of fullEventJobs) {
      if (fullEventJob.event == "jobAdded") {
        EventsJobAdded.push([fullEventJob.args[0], fullEventJob.args[1], fullEventJob.args[2], parseInt(fullEventJob.args[3]), fullEventJob.args[4], false])
      }
      else if (fullEventJob.event == "jobIsFinishedAndPaid") {
        EventsJobFinished.push([parseInt(fullEventJob.args[2])])
      }
    }
    for await (const EventJobAdded of EventsJobAdded) {
      // removing tasks finishe/paid
      for await (const EventJobFinished of EventsJobFinished) {
        if (EventJobAdded[3] == EventJobFinished) {
          EventJobFinished[1] = EventJobAdded[1]
          EventJobFinished[2] = EventJobAdded[2]
          EventJobFinished[3] = EventJobAdded[0]
        }
      }
    }
    setListJobs(EventsJobFinished)
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
        <Heading py='4' size='lg'>List of closed jobs</Heading>
      </Box>
      <Box m="4">
        {listJobs.length > 0 ? (
          <TableContainer pb='4'>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Description</Th>
                  <Th>Author</Th>
                  <Th>Price (ETH)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {listJobs.slice(0).reverse().map(listJob => (
                  <Tr key={listJobs.indexOf(listJob)}>
                    <Td>{listJob[1]}</Td>
                    <Td>{listJob[3].substring(0, 5)}...{listJob[3].substring(listJob[3].length - 4)}</Td>
                    <Td isNumeric>{ethers.utils.formatEther(listJob[2].toString())}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text>
            No closed task for the moment.
          </Text>
        )}
      </Box>
    </Flex>
  )
};
