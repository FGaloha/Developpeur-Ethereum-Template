import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Box, Flex, Heading, Link } from '@chakra-ui/react'

export const Header = ({ isConnected }) => {
  return (
    <Flex p='4' justifyContent="space-between" alignItems="center" border="2px">
      <Box>
        <Heading size='lg'>High Jedi Council Dapp</Heading>
      </Box>

      {isConnected &&
        <>
          <Box>
            <Link>List of jobs</Link>
          </Box>
        </>
      }

      <Box>
        <ConnectButton label='Log in' accountStatus='avatar' />
      </Box>
    </Flex >
  )
};
