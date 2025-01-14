import React from 'react'
import styled from 'styled-components'
import { Heading, Text, BaseLayout } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import Page from 'components/layout/Page'
import FarmStakingCard from './components/FarmStakingCard'
import LotteryCard from './components/LotteryCard'
import CakeStats from './components/CakeStats'
import TotalValueLockedCard from './components/TotalValueLockedCard'
import TwitterCard from './components/TwitterCard'

// background-image: url('/images/cosmosium/home_hero_left.png');

// background-image:url('/images/cosmosium/home_hero_left.png'), url('/images/cosmosium/home_hero_right.png');
const Hero = styled.div`
  align-items: center;
  
  background-repeat: no-repeat;
  background-position: top center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  margin-bottom: 32px;
  padding-top: 116px;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.lg} {
    
    background-position: left center, right center;
    height: 165px;
    padding-top: 0;
  }
`

const Cards = styled(BaseLayout)`
  display : flex; 
  align-items: stretch;
  justify-content : stretch;
  flex-wrap : wrap;
  margin-bottom: 48px;


  ${({ theme }) => theme.mediaQueries.xs} {
    & > div {
      grid-column: span 12;
      width : 100%;
    }
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    & > div {
      grid-column: span 6;
      width : 45%;
    }
  }
`

const Home: React.FC = () => {
  const TranslateString = useI18n()

  return (
    <Page>
      <Hero>
        <Heading as="h1" size="xl" mb="24px" color="primary">
          Cosmosium Finance
        </Heading>
        <Text>Simplified earning system with optimized yield aggregation and strategy based yield farms.</Text>
      </Hero>
      <div>
        <Cards>
          <FarmStakingCard />
          <TwitterCard/>
          <TotalValueLockedCard/>
          <CakeStats />
        </Cards>
      </div>
    </Page>
  )
}

export default Home
