import React from 'react';
import { View } from 'react-native';
import FloatingAddButton from './FloatingAddButton';

export default function withFAB(Component) {
  return function FABWrapper(props) {
    return (
      <View style={{ flex: 1 }}>
        <Component {...props} />
        <FloatingAddButton />
      </View>
    );
  };
}