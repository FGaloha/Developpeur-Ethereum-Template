import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'

export const Subsidiaries = ({ subsidiaries }) => {

  return (
    <Flex bg="black">
      {subsidiaries.length > 0 ? (
        <TableContainer mt='20'>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Subsidiary order</Th>
                <Th>Subsidiary address</Th>
                <Th>Subsidiary name</Th>
                <Th>Subsidiary symbol</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subsidiaries.slice(0).reverse().map(subsidiary => (
                <Tr key={subsidiaries.indexOf(subsidiary)}>
                  <Td>{subsidiaries.indexOf(subsidiary) + 1}</Td>
                  <Td>{subsidiary.args[0].substring(0, 5)}...{subsidiary.args[0].substring(subsidiary.args[0].length - 4)}</Td>
                  <Td>{subsidiary.args[1]}</Td>
                  <Td>{subsidiary.args[2]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text mt="20" fontSize="3xl">No subsidiary for the moment</Text>)}
    </Flex>
  )
}
