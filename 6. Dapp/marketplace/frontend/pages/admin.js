import { Heading, Flex, Input, Stack, Button, useToast, Text } from '@chakra-ui/react';
import { useAccount, useSigner, useProvider, useBalance } from 'wagmi'
import { useState, useEffect } from "react";
import useMembersProvider from '@/hooks/useMembersProvider'
import ContractFactory from "../contracts/Factory";
import ContractMarket from "../contracts/Market";
import { ethers } from 'ethers'
import { Subsidiaries } from '@/components/Lists/Subsidiaries';

export default function Admin() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const { data } = useBalance({
    address: address,
    watch: true
  })

  // Context
  const { ownerFactory, contractAddressFactory, contractAddressMarket, blockNumberFactory } = useMembersProvider()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false)
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [addressSeller, setAddressSeller] = useState("")
  const [subsidiaries, setSubsidiaries] = useState([])
  const [balance, setBalance] = useState(0)
  const [earnings, setEarnings] = useState(0)

  // Chakra
  const toast = useToast()

  useEffect(() => {
    getFinance();
    getSubsidiaries();
  }, [isConnected, address])

  // Withdraw funds
  const withdraw = async () => {
    setIsLoadingWithdraw(true);
    try {
      const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      const withdrawFunds = await contract.releaseAll()
      await withdrawFunds.wait()
      getFinance();
      toast({
        title: 'Funds withdrawed',
        description: `You successfully withdraw ${earnings}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The withdrawal of ${earnings} failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoadingWithdraw(false);

  }

  // To add a subsidiary
  const addSubsidiary = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, signer)
      const subsidiaryCreation = await contract.setSubsidiary(addressSeller, name, symbol)
      await subsidiaryCreation.wait()
      getSubsidiaries();
      setName("");
      setSymbol("");
      setAddressSeller("");
      toast({
        title: 'Subsidiary added',
        description: `You successfully added subsidiary ${name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The subsidiary creation of ${name} failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  // Get Market contract balance & Market earnings
  const getFinance = async () => {
    const marketBalance = await provider.getBalance(contractAddressMarket);
    setBalance(ethers.utils.formatEther(marketBalance));
    const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, provider)
    const marketEarings = await contract.getEarnings(contractAddressMarket);
    setEarnings(ethers.utils.formatEther(marketEarings));
  }

  // To get existing subsidiaries
  const getSubsidiaries = async () => {
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

    let registeredSubsidiariesEvents = [];
    const startBlock = blockNumberFactory; // block number of the contract Factory
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('SubsidiaryAdded', _startBlock, _endBlock);
      registeredSubsidiariesEvents = [...registeredSubsidiariesEvents, ...data]
    }
    setSubsidiaries(registeredSubsidiariesEvents)
  }

  return (
    isConnected && ownerFactory && (
      < Flex direction='column' alignItems='center' w='100%' backgroundColor='black' rounded='xl'>
        <Flex w="100%" direction='column' alignItems='center'>
          <Heading as='h1' noOfLines={1} color='white' mt='4' mb='10'>
            Admin
          </Heading>
          <Flex direction="column" w="100%" color="gray.500">
            <Text ms="5">Contract balance: {balance} ETH</Text>
            <Flex mt="2">
              <Text ms="5">Market earnings: {earnings} ETH</Text>
              {earnings > 0 && <Button ms="4" size='xs' isLoading={isLoadingWithdraw ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => withdraw()}>Withdraw</Button>}
            </Flex>
          </Flex>
        </Flex>
        <Flex direction='column' w="100%" ms="10">
          <Heading size='lg' noOfLines={1} color='white' mt='4' mb='10'>
            Create a subsidiary
          </Heading>
          <Stack spacing={4} w="30%">

            <Input placeholder='Name' value={name} focusBorderColor='pink.600' onChange={e => setName(e.target.value)} />

            <Input placeholder='Symbol' value={symbol} focusBorderColor='pink.600' onChange={e => setSymbol(e.target.value)} />

            <Input placeholder='Seller Address 0x12A...B21' value={addressSeller} focusBorderColor='pink.600' onChange={e => setAddressSeller(e.target.value)} />

            <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => addSubsidiary()}>Add</Button>

          </Stack>
          <Subsidiaries subsidiaries={subsidiaries} />
        </Flex>
      </Flex >)
  )
}
