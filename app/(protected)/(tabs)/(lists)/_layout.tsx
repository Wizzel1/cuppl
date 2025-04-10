import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import Constants from 'expo-constants';
import { withLayoutContext } from 'expo-router';
import { Dimensions, StyleSheet, View } from 'react-native';

const { Navigator } = createMaterialTopTabNavigator<MaterialTopTabNavigationEventMap>();
export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function ListsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <MaterialTopTabs
        screenOptions={{
          tabBarStyle: styles.containerStyle,
          tabBarIndicatorStyle: styles.indicator,
          tabBarActiveTintColor: '#F4F4F5',
          tabBarInactiveTintColor: '#27272A',
          tabBarAndroidRipple: {
            color: 'transparent',
          },
        }}>
        <MaterialTopTabs.Screen name="todos" options={{ title: 'To-Do Lists' }} />
        <MaterialTopTabs.Screen name="shopping" options={{ title: 'Shopping Lists' }} />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: '#27272A',
    position: 'absolute',
    zIndex: -1,
    borderRadius: 18,
    height: '80%',
    bottom: '10%',
    width: '47%',
    alignSelf: 'center',
    marginHorizontal: 6,
  },
  containerStyle: {
    marginTop: Constants.statusBarHeight + 16,
    backgroundColor: '#F4F4F5',
    alignSelf: 'center',
    width: Dimensions.get('window').width - 48,
    height: 50,
    borderRadius: 24,
    shadowColor: 'transparent',
    marginBottom: 24,
  },
});
