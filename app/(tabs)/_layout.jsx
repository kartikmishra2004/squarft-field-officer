import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const icons = {
    home: ["home-outline", "home"],
    projects: ["business-outline", "business"],
    profile: ["person-outline", "person"],
};

function TabIcon({ name, focused, color }) {
    const [inactiveIcon, activeIcon] = icons[name];
    return <Ionicons name={focused ? activeIcon : inactiveIcon} size={26} color={color} />;
}

export default function TabsLayout() {
    const searchActive = useSelector((state) => state.app.searchActive);
    const insets = useSafeAreaInsets();
    const androidBottomInset = Platform.OS === "android" ? Math.max(insets.bottom, 0) : 0;
    const iosBottomPadding = Platform.OS === "ios" ? Math.max(insets.bottom - 8, 6) : 8;

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#4A43EC",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: searchActive
                    ? { display: "none" }
                    : {
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: Platform.OS === "ios" ? 0 : androidBottomInset - 1,
                          borderTopRightRadius: 45,
                          borderTopLeftRadius: 45,
                          borderTopColor: "transparent",
                          backgroundColor: "#fff",
                          paddingTop: 10,
                          paddingHorizontal: 15,
                          paddingBottom: Math.max(iosBottomPadding - 4, 4),
                          height: Platform.OS === "ios" ? 74 : 68,
                          ...Platform.select({
                              ios: {
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.25,
                                  shadowRadius: 4,
                              },
                              android: {
                                  elevation: 10,
                              },
                          }),
                      },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
                }}
            />
            <Tabs.Screen
                name="projects"
                options={{
                    headerShown: false,
                    title: "Projects",
                    tabBarIcon: ({ focused, color }) => <TabIcon name="projects" focused={focused} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    title: "Profile",
                    tabBarIcon: ({ focused, color }) => <TabIcon name="profile" focused={focused} color={color} />,
                }}
            />
            <Tabs.Screen name="favourite" options={{ href: null }} />
            <Tabs.Screen name="book" options={{ href: null }} />
            <Tabs.Screen name="discount" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
    );
}
