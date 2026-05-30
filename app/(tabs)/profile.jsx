import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { officerProfile, performanceStats, profileLinks } from "../../data/profileData";
import { logout } from "../../store/slices/authSlice";

const profileImage = require("../../assets/images/profile-officer.png");

const statToneStyles = {
    primary: { bg: "#F1EFFF", text: "#4A43EC" },
    success: { bg: "#DCFCE7", text: "#16A34A" },
};

function openUrl(url) {
    Linking.openURL(url).catch(() => {});
}

function Section({ title, children }) {
    return (
        <View className="mb-3 rounded-[12px] border border-[#E5E7EB] bg-white p-3">
            <Text className="mb-2.5 text-[10px] font-lato-bold uppercase tracking-[1.5px] text-[#64748B]">
                {title}
            </Text>
            {children}
        </View>
    );
}

export default function Profile() {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/(auth)/login");
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1 bg-[#4A43EC]" edges={["top"]}>
                <View className="bg-[#4A43EC] px-4 pb-7 pt-3">
                    <View className="flex-row items-center">
                        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                            <Image source={profileImage} className="h-12 w-12" resizeMode="cover" />
                        </View>
                        <View className="ml-3 flex-1">
                            <View className="flex-row items-center">
                                <Text className="text-[18px] font-lato-bold text-white">{officerProfile.name}</Text>
                                <Ionicons name="checkmark-circle" size={14} color="#10F528" style={{ marginLeft: 5 }} />
                            </View>
                            <Text className="mt-1 text-[12px] text-white/80">
                                {officerProfile.area} - {officerProfile.zone}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    className="-mt-4 flex-1 rounded-t-[18px] bg-white px-4 pt-4"
                    contentContainerStyle={{ paddingBottom: 96 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Section title="Performance This Month">
                        <View className="flex-row flex-wrap justify-between">
                            {performanceStats.map((stat) => {
                                const tone = statToneStyles[stat.tone] ?? statToneStyles.primary;

                                return (
                                    <View
                                        key={stat.label}
                                        className="mb-2 h-[64px] w-[48.5%] items-center justify-center rounded-[10px]"
                                        style={{ backgroundColor: tone.bg }}
                                    >
                                        <Text className="text-[18px] font-lato-bold" style={{ color: tone.text }}>
                                            {stat.value}
                                        </Text>
                                        <Text className="mt-0.5 text-[10px] font-semibold text-[#475569]">{stat.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Section>

                    <Section title="Reporting Manager">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF]">
                                <Text className="text-[11px] font-lato-bold text-[#4A43EC]">
                                    {officerProfile.manager.initials}
                                </Text>
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-[13px] font-lato-bold text-[#111827]">
                                    {officerProfile.manager.name}
                                </Text>
                                <Text className="mt-0.5 text-[10px] text-[#64748B]">{officerProfile.manager.role}</Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => openUrl(`tel:${officerProfile.manager.phoneNumber}`)}
                                className="h-8 w-8 items-center justify-center rounded-[8px] border border-[#DDE2FF] bg-white"
                            >
                                <Ionicons name="call-outline" size={15} color="#4A43EC" />
                            </TouchableOpacity>
                        </View>
                    </Section>

                    <Section title="Quick Links">
                        {profileLinks.map((link) => (
                            <TouchableOpacity
                                key={link.label}
                                activeOpacity={0.8}
                                className="h-11 flex-row items-center border-b border-[#F1F5F9] last:border-b-0"
                            >
                                <Ionicons name={link.icon} size={15} color="#4A43EC" />
                                <Text className="ml-3 flex-1 text-[12px] font-lato-bold text-[#111827]">{link.label}</Text>
                                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </Section>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleLogout}
                        className="h-11 flex-row items-center justify-center rounded-[10px] border border-[#EF4444] bg-white"
                    >
                        <Ionicons name="log-out-outline" size={15} color="#EF4444" />
                        <Text className="ml-2 text-[12px] font-lato-bold text-[#EF4444]">Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
