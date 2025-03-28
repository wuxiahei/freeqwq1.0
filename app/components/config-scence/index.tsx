import type { FC } from 'react'
import React, { useState } from 'react'
import type { IWelcomeProps } from '../welcome'
import Welcome from '../welcome'
import Auth from '../auth'

const ConfigSence: FC<IWelcomeProps> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated)
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />

  return (
    <div className='mb-5 antialiased font-sans overflow-hidden shrink-0'>
      <Welcome {...props} />
    </div>
  )
}
export default React.memo(ConfigSence)
