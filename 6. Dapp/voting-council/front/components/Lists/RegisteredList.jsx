import {
  Heading, Flex, Text, Textarea, Input, Button, useToast, Thead, Table,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const RegisteredList = () => {

  // Smart Contract address
  // const env = process.env.NODE_ENV
  // const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  //WAGMI
  const { isConnected } = useAccount()
  const provider = useProvider()

  //CHAKRA-UI
  const toast = useToast()

  //STATES
  // const [registered, setRegistered] = useState([])
  const { registered, setRegistered, contractAddress } = useMembersProvider()



  return (
    <Flex bg="black">
      {registered.length > 0 ? (
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Index</Th>
                <Th>Registered address</Th>
              </Tr>
            </Thead>
            <Tbody>
              {registered.slice(0).reverse().map(register => (
                <Tr key={registered.indexOf(register)}>
                  <Td>{registered.indexOf(register) + 1}</Td>
                  <Td>{register.substring(0, 5)}...{register.substring(register.length - 4)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text></Text>)}
    </Flex>
  )
}
