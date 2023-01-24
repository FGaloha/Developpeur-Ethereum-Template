import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { ethers } from 'ethers';
import Contract from '../../back/artifacts/contracts/Bank.sol/Bank'
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner, useBalance, useContractEvent } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Text, Input, Button, useToast, Box, Spacer, Flex, Heading, Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer
} from '@chakra-ui/react';

export default function Home() {

  const env = process.env.NODE_ENV
  const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI
  const { address, isConnected } = useAccount()
  const { data } = useBalance({
    address: address,
    watch: true
  })
  const provider = useProvider()
  const { data: signer } = useSigner()
  const toast = useToast()

  const [balance, setBalance] = useState(null)
  const [amountDeposit, setAmountDeposit] = useState(null)
  const [amountWithdraw, setAmountWithdraw] = useState(null)
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false);
  //const [depositEvent, setGetDepositEvent] = useState(null);
  const [smartEvents, setSmartEvents] = useState([]);

  // faire un objet pour gérer un loading pour chaque bouton

  useEffect(() => {
    if (isConnected) {
      getDatas()
    }
  }, [isConnected, address])

  useEffect(() => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
    eventListener(contract)
    return () => {
      contract.removeAllListeners();
    }
  }, []) // only run once

  const eventListener = async (contract) => {
    const startBlockNumber = await provider.getBlockNumber();
    contract.on('Deposit', (...args) => {
      const event = args[args.length - 1];
      //console.log(event)
      if (event.blockNumber <= startBlockNumber) return; // do not react to this event
      toast({
        title: 'Deposit Event Listening',
        description: "A new deposit went through from Account : " + event.args[0] + " - amount " + ethers.utils.formatEther(event.args.depositAmount),
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    })
  }

  // useContractEvent({
  //   address: contractAddress,
  //   abi: Contract.abi,
  //   eventName: "Deposit",
  //   listener(node, label, owner) {
  //     // console.log("Dans le use contract event de wagmi")
  //     // document.getElementById('test').innerText = node
  //     toast({
  //       title: 'Deposit Event Listening',
  //       description: "A new deposit went through from Account : " + node + " - amount " + ethers.utils.formatEther(label) + " ETH",
  //       status: 'success',
  //       duration: 5000,
  //       isClosable: true,
  //     })
  //   }
  // })

  const getDatas = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    // user balance displayed after connection
    const myBalance = await contract.getBalance(address)
    setBalance(ethers.utils.formatEther(myBalance).toString())
    // all smart contract events
    //setEvents(await contract.queryFilter('*'))
    // last 10 smart contract events
    //devrait-on simplifier le contenu?
    setSmartEvents(await contract.queryFilter('*', -10, 'latest'))
    // TimeStamp in french format
    // console.log(new Intl.DateTimeFormat('fr-FR').format(smartEvents[0].args[2] * 1000))
    // console.log(events[0].address)
    // console.log(events[0].event)
    // console.log(ethers.utils.formatEther(events[0].args[1].toString()))
  }

  const sendEthers = async () => {
    setIsLoadingDeposit(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const depositByUser = ethers.utils.parseEther(amountDeposit)
      //parser le montant en ether pour envoyer des wei
      let transaction = await contract.sendEthers({ value: depositByUser });
      await transaction.wait()
      getDatas()
      document.getElementById('depositInput').value = null

      toast({
        title: 'Congratulations!',
        description: `You send successfully ${amountDeposit} ethers`,
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The deposit did not succeed, please try again...",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
    setIsLoadingDeposit(false);
  }

  const withdraw = async () => {
    setIsLoadingWithdraw(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const withdrawByUser = ethers.utils.parseEther(amountWithdraw)
      //parser le montant en ether pour envoyer des wei
      let transaction = await contract.withdraw(withdrawByUser);
      await transaction.wait()
      getDatas()
      document.getElementById('withdrawInput').value = null
      toast({
        title: 'Congratulations!',
        description: `You successfully withdraw ${amountWithdraw} ethers`,
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The withdraw did not succeed, please try again...",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
    setIsLoadingWithdraw(false);
  }

  return (
    <>
      <Head>
        <title>FG Decentralized Bank</title>
        <meta name="description" content="Dapp made to store and withdraw money" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex>
        <Box p='4'><Heading size='lg'>Welcome to your FG Decentralized Bank</Heading></Box>
        <Spacer />
        <Box p='4'>
          <ConnectButton label="Log in" accountStatus="avatar" />
        </Box>
      </Flex>

      <Flex>
        <Box p='4'>
          {
            isConnected ? (
              <>
                <Text pb='4' color='green'>Hello {address}</Text>
                <Text pb='4'>Your current balance is : {balance}</Text>

                <Heading pb='2'>Deposit</Heading>
                <Flex pb='4'>
                  <Input id='depositInput' width='auto' mr='2' placeholder="Amount in ETH" onChange={(e) => setAmountDeposit(e.target.value)} />
                  <Button isLoading={isLoadingDeposit ? 'isLoading' : ''} loadingText='Loading' colorScheme='green' border='1px' onClick={() => sendEthers()}>Deposit</Button>
                </Flex>
                <Heading pb='2'>Withdraw</Heading>
                <Flex pb='4'>
                  <Input id='withdrawInput' width='auto' mr='2' placeholder="Amount in ETH" onChange={(e) => setAmountWithdraw(e.target.value)} />
                  <Button isLoading={isLoadingWithdraw ? 'isLoading' : ''} loadingText='Loading' colorScheme='green' border='1px' onClick={() => withdraw()}>Withdraw</Button>
                </Flex>
                <Heading pb='2'>Last transactions</Heading>
                {smartEvents.length > 0 ? (
                  <TableContainer pb='4'>
                    <Table variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Type</Th>
                          <Th>Account</Th>
                          <Th>Amount (ETH)</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {smartEvents.slice(0).reverse().map(smartEvent => (
                          <Tr key={smartEvents.indexOf(smartEvent)}>
                            <Td>{smartEvent.event}</Td>
                            <Td>{smartEvent.args[0]}</Td>
                            <Td isNumeric>{ethers.utils.formatEther(smartEvent.args[1].toString())}</Td>
                            <Td >{new Intl.DateTimeFormat('fr-FR').format(smartEvent.args[2] * 1000)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Text>
                    No transactions.
                  </Text>
                )}
              </>
            ) : (
              <Heading as='h4' size='md' color='red'>Connect your wallet to start the service.</Heading>
            )
          }
        </Box>
      </Flex>
    </>
  )
}


/* <main className={styles.main}>
  <div className={styles.description}>
    <p>
      Get started by editing&nbsp;
      <code className={styles.code}>pages/index.js</code>
    </p>
    <div>
      <a
        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        By{' '}
        <Image
          src="/vercel.svg"
          alt="Vercel Logo"
          className={styles.vercelLogo}
          width={100}
          height={24}
          priority
        />
      </a>
    </div>
  </div>

  <div className={styles.center}>
    <Image
      className={styles.logo}
      src="/next.svg"
      alt="Next.js Logo"
      width={180}
      height={37}
      priority
    />
    <div className={styles.thirteen}>
      <Image
        src="/thirteen.svg"
        alt="13"
        width={40}
        height={31}
        priority
      />
    </div>
  </div>

  <div className={styles.grid}>
    <a
      href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h2 className={inter.className}>
        Docs <span>-&gt;</span>
      </h2>
      <p className={inter.className}>
        Find in-depth information about Next.js features and&nbsp;API.
      </p>
    </a>

    <a
      href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h2 className={inter.className}>
        Learn <span>-&gt;</span>
      </h2>
      <p className={inter.className}>
        Learn about Next.js in an interactive course with&nbsp;quizzes!
      </p>
    </a>

    <a
      href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h2 className={inter.className}>
        Templates <span>-&gt;</span>
      </h2>
      <p className={inter.className}>
        Discover and deploy boilerplate example Next.js&nbsp;projects.
      </p>
    </a>

    <a
      href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h2 className={inter.className}>
        Deploy <span>-&gt;</span>
      </h2>
      <p className={inter.className}>
        Instantly deploy your Next.js site to a shareable URL
        with&nbsp;Vercel.
      </p>
    </a>
  </div>
</main> */
