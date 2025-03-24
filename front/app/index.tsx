import { Redirect,  } from 'expo-router'
import { useAuth } from '@/lib/data/pocketbase/auth'

export default function App() {
    return <Redirect href={'/drawer/for_you'} />

}
