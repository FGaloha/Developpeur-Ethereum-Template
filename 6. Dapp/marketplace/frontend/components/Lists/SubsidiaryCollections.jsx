import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import Link from 'next/link'

export const SubsidiaryCollections = ({ collections }) => {

  return (
    <Flex bg="black" >
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
            <Tbody color="gray.500">
              {collections.slice(0).reverse().map(collection => (
                <Tr key={collections.indexOf(collection)}>
                  <Td>{collections.indexOf(collection) + 1}</Td>
                  <Td>{collection[0]}</Td>
                  <Td>{collection[1].substring(0, 5)}...{collection[1].substring(collection[1].length - 4)}</Td>
                  <Td>{new Intl.DateTimeFormat('fr-FR').format(collection[2] * 1000)}</Td>
                  <Td color='purple.500'>
                    <Flex direction="column">
                      <Link href={{
                        pathname: '/collection/collection',
                        query: `address=${collection[1]}`,
                      }}>View</Link>

                      <Link href={{
                        pathname: '/collection/update',
                        query: `address=${collection[1]}`,
                      }}>Update</Link>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text my="20" fontSize="3xl">No collection for the moment</Text>)}
    </Flex>
  )
}
