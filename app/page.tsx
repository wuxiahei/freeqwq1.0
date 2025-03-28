import type { FC } from 'react'
import React from 'react'
import Main from '@/app/components'

interface HomeProps {
  searchParams: { userName?: string; token?: string }
}

const Home: FC<HomeProps> = ({ searchParams }) => {
  const { userName, token } = searchParams

  return <Main userName={userName} token={token}/>
}

export default Home
