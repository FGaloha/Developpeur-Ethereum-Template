import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import Link from 'next/link'

export const SubsidiaryCollections = ({ collections }) => {

  return (
    <Flex bg="black">
      {collections.length > 0 ? (
        <TableContainer my='20'>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Collection name</Th>
                <Th>Collection address</Th>
                <Th>Creation date</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {collections.slice(0).reverse().map(collection => (
                <Tr key={collections.indexOf(collection)}>
                  <Td>{collections.indexOf(collection) + 1}</Td>
                  <Td>{collection[0]}</Td>
                  <Td>{collection[1].substring(0, 5)}...{collection[1].substring(collection[1].length - 4)}</Td>
                  <Td>{new Intl.DateTimeFormat('fr-FR').format(collection[2] * 1000)}</Td>
                  <Td><Link href={{
                    pathname: '/collection/update',
                    query: collection[1],
                  }}>Edit</Link></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text my="20" fontSize="3xl">No collection for the moment</Text>)}
    </Flex>
  )
}
