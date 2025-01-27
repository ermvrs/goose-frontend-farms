import { useCallback, useState, useEffect, useRef } from 'react'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import BigNumber from 'bignumber.js'
import { Contract } from 'web3-eth-contract'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux'
import ERC20 from 'config/abi/erc20.json'
import { getContract } from 'utils/web3'
import { useERC20 } from 'hooks/useContract'
import { updateUserAllowance, fetchFarmUserDataAsync } from 'state/actions'
import { approve, approveToAddress } from 'utils/callHelpers'
import { getCosmicFarmAddress } from 'utils/addressHelpers'
import { useMasterchef, useCake, useSousChef, useLottery } from './useContract'


export const usePreviousValue = (value: any) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}


export const useLastUpdated = () => {
  const [lastUpdated, setStateLastUpdated] = useState(Date.now())
  const previousLastUpdated = usePreviousValue(lastUpdated)

  const setLastUpdated = useCallback(() => {
    setStateLastUpdated(Date.now())
  }, [setStateLastUpdated])

  return { lastUpdated, previousLastUpdated, setLastUpdated }
}

// Approve a Farm
export const useApprove = (lpContract: Contract) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()
  const masterChefContract = useMasterchef()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, masterChefContract, account)
      dispatch(fetchFarmUserDataAsync(account))
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, lpContract, masterChefContract])

  return { onApprove: handleApprove }
}

export const useApproveAddress = (tokenContract : Contract, spender : string) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approveToAddress(tokenContract, spender, account)
      dispatch(fetchFarmUserDataAsync(account))
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, tokenContract, spender])

  return { onApprove: handleApprove }
}

export const useApproveAddressNoFarm = (tokenContract : Contract, spender : string) => {
  const { account }: { account: string } = useWallet()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approveToAddress(tokenContract, spender, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, tokenContract, spender])

  return { onApprove: handleApprove }
}

export const useApproveAddressNoContract = (spender : string) => {
  const { account }: { account: string } = useWallet()

  const handleApprove = useCallback(async (tokenAddress: string) => {
    try {
      const contract = getContract(ERC20,tokenAddress)
      const tx = await approveToAddress(contract, spender, account)
      return tx
    } catch (e) {
      console.log(e)
      return false
    }
  }, [account, spender])

  return { onApproveAddress: handleApprove }
}

// Approve a Pool
export const useSousApprove = (lpContract: Contract, sousId) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()
  const sousChefContract = useSousChef(sousId)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, sousChefContract, account)
      dispatch(updateUserAllowance(sousId, account))
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, lpContract, sousChefContract, sousId])

  return { onApprove: handleApprove }
}

// Approve the lottery
export const useLotteryApprove = () => {
  const { account }: { account: string } = useWallet()
  const cakeContract = useCake()
  const lotteryContract = useLottery()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(cakeContract, lotteryContract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, cakeContract, lotteryContract])

  return { onApprove: handleApprove }
}

// Approve an IFO
export const useIfoApprove = (tokenContract: Contract, spenderAddress: string) => {
  const { account } = useWallet()
  const onApprove = useCallback(async () => {
    try {
      const tx = await tokenContract.methods
        .approve(spenderAddress, ethers.constants.MaxUint256)
        .send({ from: account })
      return tx
    } catch {
      return false
    }
  }, [account, spenderAddress, tokenContract])

  return onApprove
}

export const useVaultApprove = () => {
  const { account } = useWallet()
  const cakeContract = useCake()
  const cakeVaultAddress = getCosmicFarmAddress()
  const handleVaultApprove = useCallback(async () => {
    try {
      const tx = await cakeContract.methods
        .approve(cakeVaultAddress, ethers.constants.MaxUint256)
        .send({ from: account })
      return tx
    } catch {
      return false
    }
  }, [account, cakeVaultAddress, cakeContract])

  return {handleVaultApprove}
}

export const useCheckVaultApprovalStatus = () => {
  const [isVaultApproved, setIsVaultApproved] = useState(false)
  const { account } = useWallet()
  const cakeContract = useCake()
  const cakeVaultAddress = getCosmicFarmAddress()
  const { lastUpdated, setLastUpdated } = useLastUpdated()
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const response = await cakeContract.methods.allowance(account, cakeVaultAddress).call()
        const currentAllowance = new BigNumber(response.toString())
        // console.log(currentAllowance)
        setIsVaultApproved(currentAllowance.gt(0))
      } catch (error) {
        setIsVaultApproved(false)
      }
    }

    checkApprovalStatus()
  }, [account, cakeContract, cakeVaultAddress, lastUpdated])
  return { isVaultApproved, setLastUpdated }
}