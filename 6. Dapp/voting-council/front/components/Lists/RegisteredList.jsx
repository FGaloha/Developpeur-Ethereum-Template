import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import useMembersProvider from '@/hooks/useMembersProvider'

export const RegisteredList = () => {

  // Context
  const { registered } = useMembersProvider()

  return (
    <Flex bg="black">
      {registered.length > 0 ? (
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Inscription order</Th>
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
