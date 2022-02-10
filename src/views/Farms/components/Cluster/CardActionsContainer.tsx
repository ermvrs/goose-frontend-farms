import React, { useMemo, useState, useCallback, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { provider } from 'web3-core'
import { getContract } from 'utils/erc20'
import { Button, Flex, Text, Heading } from '@pancakeswap-libs/uikit'
import { Farm } from 'state/types'
import { useFarmFromPid, useFarmFromSymbol, useFarmUser } from 'state/hooks'
import { useCluster } from 'hooks/useContract'
import useI18n from 'hooks/useI18n'
import getTimePeriods from 'utils/getTimePeriods'
import formatTimePeriod from 'utils/formatTimePeriod'
import UnlockButton from 'components/UnlockButton'
import { useApprove, useApproveAddress } from 'hooks/useApprove'
import { userAllowance, clusterUserInfo } from 'utils/callHelpers'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'


const Action = styled.div`
  padding-top: 16px;
`
export interface FarmWithStakedValue extends Farm {
  apy?: BigNumber
}

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  ethereum?: provider
  account?: string
  clusterContract: any
  timeLock?: number
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, ethereum, account, clusterContract, timeLock }) => {
  const TranslateString = useI18n()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const [stakeTime, setStakeTime] = useState(0);
  const [allowance, setAllowance] = useState(new BigNumber(0));
  const { pid, lpAddresses, tokenAddresses, isTokenOnly, depositFeeBP } = useFarmFromPid(farm.pid)
  const { tokenBalance, stakedBalance, earnings } = useFarmUser(pid)
  const lpAddress = lpAddresses[process.env.REACT_APP_CHAIN_ID]

  const tokenAddress = tokenAddresses[process.env.REACT_APP_CHAIN_ID];
  const farmContract = clusterContract[process.env.REACT_APP_CHAIN_ID];
  const lpName = farm.lpSymbol.toUpperCase()
  const contract = useCluster(farmContract)
  const isApproved = account && allowance && allowance.isGreaterThan(0)

  

  const lpContract = useMemo(() => {
    if(isTokenOnly){
      return getContract(ethereum as provider, tokenAddress);
    }
    return getContract(ethereum as provider, lpAddress);
  }, [ethereum, lpAddress, tokenAddress, isTokenOnly])


  const { onApprove } = useApproveAddress(lpContract, farmContract);
  const getAllowance = useEffect(() => {
    async function fetchAllowance() {
      try {
        const allowancex = await  userAllowance(lpContract, farmContract, account);
        setAllowance(new BigNumber(allowancex))
      } catch (e) {
        console.error(e)
      }
    }
    fetchAllowance()
  }, [lpContract, farmContract, account])

  const getUserStakeTime = useEffect(() => {
    async function fetchTime() {
      try {
          
          const userInfo = await clusterUserInfo(contract, account);
          setStakeTime(Number(userInfo.lastUserActionTime))
      } catch (e) {
        console.error(e)
      }
    }
    fetchTime()
  },[contract,account])

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove])

  const getNetTimeLeft = (current) => {
    if(stakeTime + timeLock > current) {
      return formatTimePeriod(getTimePeriods(0))
    }
      return formatTimePeriod(getTimePeriods(current - (stakeTime + timeLock)))


  }
  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <StakeAction account={account} farmAddress={farmContract} stakedBalance={stakedBalance} tokenBalance={tokenBalance} tokenName={lpName} pid={pid} depositFeeBP={depositFeeBP} />
    ) : (

        <Button  disabled={requestedApproval} onClick={handleApprove}>
        {TranslateString(999, 'Approve Contract')}
      </Button>


    )
  }

  return (
    <Action>
      {!account ? (<UnlockButton mt="8px" fullWidth />) : (
        <>
        <Flex>
          <Text bold textTransform="uppercase" color="primary" fontSize="12px" pr="3px">
            Your Stake
          </Text>
        </Flex>
        {renderApprovalOrStakeButton()}
        <Flex>
          <Text bold textTransform="uppercase" color="primary" fontSize="12px" pr="3px">
            Time Left
          </Text>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading color='text'> -- TODO --</Heading>
        </Flex>
        </>
      )}
    </Action>
  )
}

export default CardActions