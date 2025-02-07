import { Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import useMembersProvider from '@/hooks/useMembersProvider'

export const RegisteredProposals = () => {

  // Context
  const { proposals } = useMembersProvider()

  return (
    <>
      {proposals.length > 0 ? (
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Index</Th>
                <Th>Proposals</Th>
              </Tr>
            </Thead>
            <Tbody>
              {proposals.slice(0).reverse().map(proposal => (
                <Tr key={proposals.indexOf(proposal)}>
                  <Td>{proposal[0]}</Td>
                  <Td>{proposal[2]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text justifyContent="end" alignItems="end" mt="4">No registered proposal for the moment</Text>)}
    </>
  )
}
