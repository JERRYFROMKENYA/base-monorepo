import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  Button,
  Surface,
  TextInput,
  HelperText,
  Text,
} from 'react-native-paper'
import * as Yup from 'yup'

import { styles } from '@/lib'
import SafeScreen from '@/lib/presentation/SafeScreen'
import { useAuth } from '@/lib/data/pocketbase/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const { signIn } = useAuth()

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .required('Please enter an email.'),
    password: Yup.string()
      .min(8, 'Too Short! must be at least 8 characters.')
      .max(64, 'Too Long!')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%=^&*])/,
        'Must 1 uppercase, 1 lowercase, 1 number and 1 special case character',
      )
      .required('Please enter a password'),
  })

  const handleSubmit = () => {
    validationSchema
      .validate({ email, password }, { abortEarly: false })
      .then(async () => {
        console.log({ email, password })
        setErrors({ email: '', password: '' })
        const result = await signIn(email, password);

        if (result && result.error) {
          console.error(result.error);
          setError(result.error);
        } else {
          console.log("Logged in successfully");
          router.replace("/drawer");
        }
      })
      .catch((err) => {
        const newErrors = { email: '', password: '' }
        err.inner.forEach((error) => {
          // @ts-ignore
          newErrors[error.path] = error.message
        })
        setErrors(newErrors)
      })
  }

  return (
    <SafeScreen>
      <Surface style={{ ...styles.screen, alignItems: undefined }}>
        <Image
          alt="Logo"
          source={require('@/assets/images/icon.png')}
          style={{
            height: 150,
            width: 150,
            borderRadius: 16,
            marginBottom: 32,
            marginHorizontal: 'auto',
          }}
        />

        <Text variant="headlineLarge" style={{ textAlign: 'center' }}>
          Welcome!
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
          We're excited to have you back. Please log in to continue.
        </Text>

        <Surface elevation={0}>
          <TextInput
            maxLength={64}
            mode="outlined"
            label="Email"
            value={email}
            error={!!errors.email}
            onBlur={() => validationSchema.validateAt('email', { email }).catch((err) => setErrors((prev) => ({ ...prev, email: err.message })))}
            placeholder="Enter your email..."
            onChangeText={setEmail}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>
        </Surface>

        <Surface elevation={0}>
          <TextInput
            maxLength={64}
            mode="outlined"
            label="Password"
            value={password}
            error={!!errors.password}
            // onBlur={() => validationSchema.validateAt('password', { password }).catch((err) => setErrors((prev) => ({ ...prev, password: err.message })))}
            placeholder="Enter your password..."
            onChangeText={setPassword}
            secureTextEntry
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>
        </Surface>

        <Button mode="contained" onPress={handleSubmit}>
          Login
        </Button>

        <Button mode="contained-tonal" onPress={() => router.push('/(auth)/signup')}>
          New here?
        </Button>
      </Surface>
    </SafeScreen>
  )
}

export default Login
