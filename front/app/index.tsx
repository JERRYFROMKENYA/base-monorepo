import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

export default function App() {
  // const [initializing, setInitializing] = useState(true)
  // const [user, setUser] = useState()
  //
  // // Handle user state changes
  // function onAuthStateChanged(user: any) {
  //   setUser(user)
  //   if (initializing) setInitializing(false)
  // }
  //
  // useEffect(() => {
  //   // const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  //   // return subscriber; // unsubscribe on unmount
  // }, [])


  return <Redirect href={'/drawer'} />
}
