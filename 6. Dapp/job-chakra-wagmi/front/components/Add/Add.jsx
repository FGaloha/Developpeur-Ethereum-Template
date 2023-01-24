import Contract from '../../../back/artifacts/contracts/Jobs.sol/Jobs'
import { useProvider, useSigner, useBalance } from 'wagmi'
import { useState } from 'react'
import { ethers } from 'ethers'
import { Flex, Heading, Input, Button, Textarea, Text, Box, useToast } from '@chakra-ui/react'

export const Add = ({ address, contractAddress }) => {
  // WAGMI
  const provider = useProvider()
  const { data: signer } = useSigner()
  const { data } = useBalance({
    address: address,
    watch: true
  })

  // CHAKRA-UI
  const toast = useToast()

  // STATES
  const [price, setPrice] = useState(null)
  const [description, setDescription] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const addJob = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const authorPrice = ethers.utils.parseEther(price)
      //parser le montant en ether pour envoyer des wei
      let transaction = await contract.addJob(description, { value: authorPrice });
      await transaction.wait()
      console.log(transaction)
      //getDatas()
      document.getElementById('descriptionText').value = null
      document.getElementById('priceInput').value = null

      toast({
        title: 'New job added',
        description: `You successfully sent ${authorPrice} ethers`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The job creation did not succeed, please try again...",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <Flex
      direction="column"
      align="stretch"
      w="80%"
      border="1px"
      borderColor="orange.400"
      borderRadius="5"
    >
      <Box textAlign="center" bg="orange.300">
        <Heading py='4' size='lg'>Add a job</Heading>
      </Box>
      <Box m="4">
        <Text pb='2'>Description :</Text>
        <Textarea id="descriptionText" placeholder='Please describe here your job offer' onChange={(e) => { setDescription(e.target.value) }} />
      </Box>
      <Box m="4" pb='4'>
        <Text pb='2'>Price :</Text>
        <Input id="priceInput" placeholder="Price in ETH you offer for the job previously describe" onChange={(e) => { setPrice(e.target.value) }} />
      </Box>
      <Box textAlign="center" pb="4">
        <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' bgColor="blackAlpha.900" textColor="white" colorScheme="orange" w="97%" onClick={() => addJob()} >
          Validate
        </Button>
      </Box>
    </Flex>
  )
};
