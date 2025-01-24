import { Image } from 'expo-image'
import { router, useRouter } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  Button,
  Surface,
  TextInput,
  HelperText,
  Text, Divider,
} from 'react-native-paper'
import * as Yup from 'yup'

import { styles } from '@/lib'
import SafeScreen from '@/lib/presentation/SafeScreen'
import { useAuth } from '@/lib/data/pocketbase/auth'
import { View } from '@/lib/presentation/Themed'
import { usePocketBase } from '@/lib/data/pocketbase'
import { Alert } from 'react-native'

export default function AuthScreen() {
  const { pb } = usePocketBase();
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, createNewAccount, user } = useAuth();
  const router = useRouter();
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const[name, setFullName] = useState("");
  // const[username, setUsername] = useState("")
  const [error, setError] = useState("");

  const handlePasswordReset = async () => {
    await pb.collection('users').requestPasswordReset(resetEmail).then((res) => {
      Alert.alert("Password Reset", "Password reset email sent successfully, check your Inbox");
    });
  };

  const handleLogin = async () => {
    const result = await signIn(email, password);

    if (result && result.error) {
      console.error(result.error);
      setError(result.error);
    } else {
      console.log("Logged in successfully");
      router.replace("/drawer");
    }
  };

  const handleSignUp = async () => {
    const result = await createNewAccount({ email, password, passwordConfirm: confirmPassword,  name});
    if (result && result.error) {
      console.error(result.error);
    } else {
      console.log("Account created successfully");
      router.replace("/(auth)/onboarding");

    }
  };

  return (
    <SafeScreen onRefresh={() => { }}>
      <View style={{ justifyContent: "center", alignItems: "center", height: "100%", width: "100%" , padding:10}}>
        <Image
          source={require('@/assets/images/welcome_design.png')}
          style={{ width: 250,
            marginBottom: 20,
            height: 200,
            marginTop:80 }}
        />
        <Surface
          elevation={0}
          style={{
          height: "auto",
          marginBottom: 100,
          width: "95%",
          padding: 20,
          paddingTop: 8,
          borderRadius: 20,
          justifyContent: "space-between"
        }}>

          <Text variant={"headlineLarge"} style={{ alignSelf: "flex-start", marginLeft: 20, marginBottom: 20, fontWeight:"bold", fontSize:30 }}>{isLogin&&!isPasswordReset ? "Login" : !isPasswordReset? "Sign Up" : "Forgot Password"}</Text>
          {error && <Text style={{ color: "red", alignSelf: "center", marginBottom:12 }}>{String(error).split(":")[1]}</Text>}
          {isPasswordReset ? (
            <>
              <Text style={{color:"gray"}}>{`Don’t worry! It happens. \n\nPlease enter the address associated with your account.\n`}</Text>
              <TextInput label={"Email"} onChangeText={setResetEmail} />
              <View style={{ height: 10, backgroundColor: "transparent" }}></View>
              <Button mode={"contained"} textColor={"white"} buttonColor={"gray"} onPress={handlePasswordReset}>Reset Password</Button>
              <Button onPress={() => setIsPasswordReset(false)}>Back to Login</Button>
            </>
          ) : (
            <>
              {!isLogin && (<>
                  <View style={{ height: 10, backgroundColor: "transparent" }}></View>
                  <TextInput mode={"flat"} contentStyle={{backgroundColor:"none"}}  label={"Name"}  onChangeText={setFullName} />
                  <View style={{ height: 10, backgroundColor: "transparent" }}></View>
                  {/*<TextInput mode={"flat"} contentStyle={{backgroundColor:"none"}}  label={"@ username"}  onChangeText={setUsername} />*/}
                  <View style={{ height: 10, backgroundColor: "transparent" }}></View>
                </>
              )}
              <TextInput label={"Email"} onChangeText={(e)=>setEmail(e.trim())} />
              <View style={{ height: 10, backgroundColor: "transparent" }}></View>
              <TextInput secureTextEntry label={"Password"} onChangeText={setPassword} />
              {!isLogin && (
                <>
                  <View style={{ height: 10, backgroundColor: "transparent" }}></View>
                  <TextInput label={"Confirm Password"} secureTextEntry onChangeText={setConfirmPassword} />
                </>
              )}
              <View style={{ height: 10, backgroundColor: "transparent" }}></View>

              <View style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                margin: 10,
                backgroundColor: "transparent"
              }}>

                {isLogin && <Button style={{ alignSelf: "flex-end", justifyContent:"flex-end" }} onPress={() => setIsPasswordReset(true)}>Forgot
                  Password?</Button>}
              </View>
              <Button mode={"contained"}
                      textColor={"#f1eeee"}
                      onPress={isLogin ? handleLogin : handleSignUp}>{isLogin ? "Login" : "Sign Up"}</Button>

              {isLogin&&<>
                <View style={{flexDirection:"row", alignSelf:"center", justifyContent: "center", marginBottom:10}}>
                  <Divider style={{borderColor:"gray", height:2, marginTop:20, width:"40%"}} />
                  <Text style={{marginTop:10 ,marginHorizontal:10}}>or</Text>
                  <Divider style={{borderColor:"gray", height:2, marginTop:20,width:"40%"}} />
                </View>
              </>}
              {isLogin&&<Button icon={"google"} mode={"contained"} buttonColor={"gray"} textColor={"white"}> Sign in With
                Google</Button>}
              <View style={{flexDirection:"row", alignItems:"center", justifyContent:"center"}}>
                <Text>{isLogin && !isPasswordReset ? "New to Base ? ": "Have you joined us before ?"}</Text>
                <Button  style={{ alignSelf: "flex-start", marginTop:0 }} onPress={() => {setError();setIsLogin(!isLogin)}}>{isLogin && !isPasswordReset ? "Register ": "Login"}</Button>
              </View>

            </>
          )}
        </Surface>
      </View>
      {/*<OnboardingModal visible={isOnboardingVisible} onDismiss={() => setIsOnboardingVisible(false)} />*/}
    </SafeScreen>
  );
}
