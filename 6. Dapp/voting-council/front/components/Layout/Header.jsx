import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import { Box, Flex, Heading, Alert, AlertIcon, Text } from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import useMembersProvider from '@/hooks/useMembersProvider'

export const Header = () => {
  const { isConnected } = useAccount()
  const { isMember, workflow } = useMembersProvider()

  return (
    <>
      <Head>
        <title>Jedi Council Voting Dapp</title>
        <meta name="description" content="The High Jedi Council will use this Dapp to define and vote for their next important action to protect the Republic" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex p='4' justifyContent="space-between" alignItems="center" border="2px" position="fixed" width="100%" bg="black">
        <Box>
          <Heading size='lg'>High Jedi Council</Heading>
        </Box>

        {isConnected &&
          <Flex>
            <Flex me="4"><Link href="/">Home</Link></Flex>
            <Flex me="4"><Link href="/registered">Registered</Link></Flex>
            {workflow >= 3 && (<Flex me="4"><Link href="/voters">Voters</Link></Flex>)}
            {isMember && workflow >= 3 && (<Flex><Link href="/detailedResults">Detailed results</Link></Flex>)}
          </Flex>
        }

        <Box>
          <Flex>
            <ConnectButton label='Log in' accountStatus='avatar' chainStatus="none" />
          </Flex>
        </Box>
      </Flex >
    </>

  )
};
