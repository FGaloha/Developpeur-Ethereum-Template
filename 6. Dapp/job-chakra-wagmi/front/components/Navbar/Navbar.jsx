import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Box, Flex, Heading, Link } from '@chakra-ui/react'

export const Navbar = ({ isConnected, changeAdd, changeActive, changeClosed }) => {
  return (
    <Flex p='4' justifyContent="space-between" alignItems="center" border="2px">
      <Box>
        <Heading size='lg'>FG Job Dapp</Heading>
      </Box>

      {isConnected &&
        <>
          <Box>
            <Link onClick={() => {
              changeAdd(false)
              changeActive(true)
              changeClosed(false)
            }}>List of jobs</Link>
          </Box>
          <Box>
            <Link onClick={() => {
              changeAdd(true)
              changeActive(false)
              changeClosed(false)
            }}>New job</Link>
          </Box>
          <Box>
            <Link onClick={() => {
              changeAdd(false)
              changeActive(false)
              changeClosed(true)
            }}>Closed jobs</Link>
          </Box>
        </>
      }

      <Box>
        <ConnectButton label='Log in' accountStatus='avatar' />
      </Box>
    </Flex >
  )
};
