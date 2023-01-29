import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import { Box, Flex, Heading } from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'

export const Header = () => {
  const { isConnected } = useAccount()

  return (
    <>
      <Head>
        <title>The High Jedi Council Voting Dapp</title>
        <meta name="description" content="The High Jedi Council will use this Dapp to define and vote for their next important action to protect the Republic" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex p='4' justifyContent="space-between" alignItems="center" border="2px">
        <Box>
          <Heading size='lg'>High Jedi Council</Heading>
        </Box>

        {isConnected &&
          <Flex>
            <Flex me="2"><Link href="/">Home</Link></Flex>
            <Flex me="2"><Link href="/registered">Registered</Link></Flex>
            <Flex><Link href="/voters">Voters</Link></Flex>
          </Flex>
        }


        <Box>
          <ConnectButton label='Log in' accountStatus='avatar' />
        </Box>
      </Flex >
    </>

  )
};
