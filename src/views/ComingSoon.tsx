import React from 'react'
import styled from 'styled-components'
import { Button, Heading, Text, LogoIcon } from '@pancakeswap-libs/uikit'
import Page from 'components/layout/Page'
import useI18n from 'hooks/useI18n'

const StyledNotFound = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  justify-content: center;
`

const ComingSoon = () => {
  const TranslateString = useI18n()

  return (
    <Page>
      <StyledNotFound>

        <Heading size="xxl">Coming Soon</Heading>
        <Text mb="16px">Cosmosium Finance is currently not published farms yet. Read our documents for details</Text>
        <Button as="a" href="https://docs.cosmosium.finance" size="sm">
          Docs
        </Button>
      </StyledNotFound>
    </Page>
  )
}

export default ComingSoon
