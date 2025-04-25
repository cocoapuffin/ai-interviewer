import { Link } from 'lucide-react'
import { ReactNode } from 'react'
import Image from 'next/image'

const RootLayout = ({children} : {children : ReactNode}) => {
  return (
    <div className='root-layout'>
      <nav>
          <Image src='/logo.svg' alt="logo" width={38} height={32}/> <h2 className='text-primary-200'>ai-interviewer</h2>
      </nav>
      {children}
    </div>
  )
}

export default RootLayout