import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { Client, Account, ID } from 'react-native-appwrite';



export default function App() {
  const client = new Client();
  client
    .setEndpoint('http://34.59.254.83/v1')
    .setProject('6780e5f7002ba6c009a0')
    .setPlatform('com.app.base');
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
