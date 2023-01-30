import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { Box, Heading, Flex, Text, Textarea, Input, Button, useToast, Alert, AlertIcon, Image } from '@chakra-ui/react';
import { useState, useEffect } from 'react'
import { useAccount, useProvider, useSigner, useBalance } from 'wagmi'
import Contract from "../contract/Voting"
import { ethers } from 'ethers'
import Link from 'next/link'
import { Workflow } from '@/components/Forms/Workflow';
import { AddProposals } from '@/components/Forms/AddProposals';
import { SetVote } from '@/components/Forms/SetVote';
import { Results } from '@/components/Results/Results';
import { ResultsDetailed } from '@/components/Results/ResultsDetailed';
import useMembersProvider from '@/hooks/useMembersProvider'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  // WAGMI
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()
  const { data } = useBalance({
    address: address,
    watch: true
  })

  // CHAKRA-UI
  const toast = useToast()

  // CONTEXT
  const { owner, workflow, setWorkflow, contractAddress, setHasVotedList } = useMembersProvider()
  const { registered, setRegistered, isMember, setIsMember, setAddHasVoted } = useMembersProvider()

  useEffect(() => {
    if (isConnected) {
      getData()
    }
  }, [isConnected, address])

  const getData = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const worflowStatus = await contract.workflowStatus()
    setWorkflow(worflowStatus)
    // List of registered address
    const registeredEvents = await contract.queryFilter('VoterRegistered', 0, 'latest')
    let registeredList = []
    registeredEvents.forEach(registeredEvent => {
      registeredList.push(registeredEvent.args[0])
    })
    setRegistered(registeredList)

    // Boolean true if address is registered
    setIsMember(registered.includes(address))

    // List of address who have voted
    const hasVotedEvents = await contract.queryFilter('Voted', 0, 'latest')
    let hasVoted = []
    hasVotedEvents.forEach(hasVotedEvent => {
      hasVoted.push(hasVotedEvent.args.voter)
    })
    setHasVotedList(hasVoted)

    // Boolean true if address has voted
    setAddHasVoted(hasVoted.includes(address))
  }

  const CurrentPhase = () => {
    switch (workflow) {
      case 1:
        return (<Heading ms="2" mt="1" mb="4">Current phase:  adding proposals</Heading>)
      case 2:
        return (<Heading ms="2" mt="1" mb="4">Current phase:  proposals registration ended</Heading>)
      case 3:
        return (<Heading ms="2" mt="1" mb="4">Current phase:  voting started</Heading>)
      case 4:
        return (<Heading ms="2" mt="1" mb="4">Current phase:  voting ended</Heading>)
      case 5:
        return (<Heading ms="2" mt="1" mb="4">Current phase:  results available</Heading>)
      default:
        return (<Heading ms="2" mt="1" mb="4">Current phase: registration</Heading>)
    }
  }

  return (
    <Flex
      w="100%" m="0px" p="0px"
      // direction={["column", "column", "row", "row"]}
      // alignItems={["center", "center", "flex-start", "flex-start"]}
      // flexWrap="wrap"
      border="2px" bg="black"
    >
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="top" w="100%">

          <Flex direction="column" height="100%" w="100%" alignItems="center" justifyContent="top" >
            <Flex borderBottom="2px" width="100%" alignItems="center" justifyContent="center" pt="2" >
              <CurrentPhase />
            </Flex>

            <Flex mt="4" direction="column" alignItems="center" justifyContent="center" border="2px" width="40%">
              {address == owner && (<Flex ps="2" alignItems="start" justifyContent="start" width="100%"><Text>Status: Admin</Text></Flex>)}

              {isMember ? (<Flex ps="2" alignItems="start" justifyContent="start" width="100%"><Text>Member: voting rights & full data access.</Text></Flex>)
                : (<Flex ps="2" alignItems="start" justifyContent="start" width="100%"><Text>Visitor: no voting rights, data limited.</Text></Flex>)}
            </Flex>
            {address == owner ? (
              <Flex direction="column" alignItems="start" justifyContent="start" width="40%">
                <Workflow w="100%" getData={getData} />
              </Flex>) :

              (isMember && (
                <Flex>
                  {workflow == 1 &&
                    < AddProposals />
                  }
                  {workflow == 3 &&
                    < SetVote />
                  }
                </Flex>
              )
              )

            }
            {workflow == 5 &&
              <Flex ms="2" bg="black">< Results /></Flex>
            }
          </Flex>
        </Flex >
      )
        : (
          <Flex direction="column" width="100%" alignItems="center" justifyContent="center">
            <Image boxSize="80%" src='https://wallpaperaccess.com/full/376659.jpg' alt='High Jedi Council' />
          </Flex>
        )}

    </Flex>
  )
}
