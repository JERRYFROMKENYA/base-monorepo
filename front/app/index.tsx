import { Redirect,  } from 'expo-router'
import { useAuth } from '@/lib/data/pocketbase/auth'

export default function App() {
  const {user}=useAuth()
    return <Redirect href={'/drawer'} withAnchor={true}  />

}
