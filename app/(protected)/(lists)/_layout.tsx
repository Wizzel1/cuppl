import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import Constants from 'expo-constants';
import { usePathname, withLayoutContext } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const { Navigator } = createMaterialTopTabNavigator<MaterialTopTabNavigationEventMap>();
export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function ListsLayout() {
  const [showTabBar, setShowTabBar] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const shouldHideTabBar = pathname.startsWith('/co_z');

    setTimeout(
      () => {
        setShowTabBar(!shouldHideTabBar);
      },
      shouldHideTabBar ? 200 : 0
    );
  }, [pathname]);
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <MaterialTopTabs
        screenOptions={{
          tabBarStyle: showTabBar
            ? styles.containerStyle
            : { display: 'none', height: 0, marginBottom: 0 },
          tabBarIndicatorStyle: styles.indicator,
          tabBarActiveTintColor: '#F4F4F5',
          tabBarInactiveTintColor: '#27272A',
          tabBarAndroidRipple: {
            color: 'transparent',
          },
        }}>
        <MaterialTopTabs.Screen name="(todos)" options={{ title: 'To-Do Lists' }} />
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
    width: '46%',
    alignSelf: 'center',
    marginHorizontal: 8,
  },
  containerStyle: {
    marginTop: Constants.statusBarHeight,
    backgroundColor: '#F4F4F5',
    width: '90%',
    alignSelf: 'center',
    height: 50,
    borderRadius: 24,
    shadowColor: 'transparent',
    marginBottom: 24,
  },
});
