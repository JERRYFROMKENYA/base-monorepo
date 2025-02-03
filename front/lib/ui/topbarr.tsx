import React from "react";
import { View, Text, StatusBar, StyleSheet, SafeAreaView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const TranslucentTopBar = () => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.text}>Notice that the status bar has light text!</Text>
        <StatusBar style="light" />
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: 60,
  },
  text: {
    color: '#fff',
  },
});
export default TranslucentTopBar;

