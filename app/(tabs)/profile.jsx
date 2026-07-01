import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Image, Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { profileLinks } from "../../data/profileData";
import { authAPI } from "../../services/api";
import { logout } from "../../store/slices/authSlice";
import { clearOfficerProfile, fetchOfficerProfile } from "../../store/slices/profileSlice";

const profileImage = require("../../assets/images/profile-officer.png");

const statToneStyles = {
    primary: { bg: "#F1EFFF", text: "#4A43EC" },
    success: { bg: "#DCFCE7", text: "#16A34A" },
};

const statConfig = [
    { key: "total_leads", label: "Total Leads", tone: "primary" },
    { key: "meetings_done", label: "Meetings Done", tone: "success" },
    { key: "onboarded", label: "Onboarded", tone: "primary" },
    { key: "projects_live", label: "Projects Live", tone: "success" },
];

function getInitials(name) {
    return (name || "FO")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "FO";
}

async function openUrl(url, fallbackMessage = "Unable to open this link.") {
    try {
        const supported = await Linking.canOpenURL(url);
        if (!supported) {
            Alert.alert("Unavailable", fallbackMessage);
            return;
        }
        await Linking.openURL(url);
    } catch {
        Alert.alert("Unavailable", fallbackMessage);
    }
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

function ErrorBanner({ message, onRetry, loading }) {
    return (
        <View className="mb-3 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-3">
            <View className="flex-row items-start">
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <View className="ml-2 flex-1">
                    <Text className="text-[12px] font-lato-bold text-[#991B1B]">Profile could not be refreshed</Text>
                    <Text className="mt-1 text-[11px] leading-4 text-[#B91C1C]">{message}</Text>
                </View>
            </View>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onRetry}
                disabled={loading}
                className="mt-2 h-8 flex-row items-center justify-center rounded-[8px] bg-[#DC2626]"
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="refresh" size={13} color="#fff" />
                        <Text className="ml-1.5 text-[11px] font-lato-bold text-white">Retry</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

export default function Profile() {
    const dispatch = useDispatch();
    const { profile, performanceThisMonth, reportingManager, loading, error } = useSelector((state) => state.profile);

    useEffect(() => {
        dispatch(fetchOfficerProfile());
    }, [dispatch]);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } finally {
            dispatch(clearOfficerProfile());
            dispatch(logout());
            router.replace("/(auth)/login");
        }
    };

    const handleRetry = () => {
        dispatch(fetchOfficerProfile());
    };

    const handleCallManager = () => {
        if (!reportingManager?.phone) {
            Alert.alert("Phone unavailable", "No reporting manager phone number is available.");
            return;
        }
        openUrl(`tel:${reportingManager.phone}`, "Unable to call this number.");
    };

    const handleQuickLinkPress = (link) => {
        if (link.label === "Map View - Nearby Projects") {
            router.push("/(screens)/nearby-projects");
        }
    };

    const stats = statConfig.map((stat) => ({
        ...stat,
        value: performanceThisMonth?.[stat.key] ?? 0,
    }));

    const profileName = profile?.name || "Field Officer";
    const roleDisplay = profile?.role_display || "Field Officer";
    const managerName = reportingManager?.name || "Not assigned";
    const managerRole = reportingManager?.role_display || "Reporting Manager";
    const managerMeta = [managerRole, reportingManager?.location].filter(Boolean).join(" - ");

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1 bg-[#4A43EC]" edges={["top"]}>
                <View className="bg-[#4A43EC] px-4 pb-7 pt-3">
                    <View className="flex-row items-center">
                        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                            <Image
                                source={profile?.avatar_url ? { uri: profile.avatar_url } : profileImage}
                                className="h-12 w-12"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="ml-3 flex-1">
                            <View className="flex-row items-center">
                                <Text className="text-[18px] font-lato-bold text-white" numberOfLines={1}>
                                    {profileName}
                                </Text>
                                {profile?.is_verified && (
                                    <Ionicons name="checkmark-circle" size={14} color="#10F528" style={{ marginLeft: 5 }} />
                                )}
                            </View>
                            <Text className="mt-1 text-[12px] text-white/80">
                                {roleDisplay}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    className="-mt-4 flex-1 rounded-t-[18px] bg-white px-4 pt-4"
                    contentContainerStyle={{ paddingBottom: 96 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading && Boolean(profile)}
                            onRefresh={handleRetry}
                            tintColor="#4A43EC"
                            colors={["#4A43EC"]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {loading && !profile ? (
                        <View className="mb-3 h-10 flex-row items-center justify-center rounded-[10px] bg-[#F8F9FF]">
                            <ActivityIndicator size="small" color="#4A43EC" />
                            <Text className="ml-2 text-[12px] font-lato-bold text-[#4A43EC]">Loading profile</Text>
                        </View>
                    ) : null}

                    {error ? <ErrorBanner message={error} onRetry={handleRetry} loading={loading} /> : null}

                    <Section title="Performance This Month">
                        <View className="flex-row flex-wrap justify-between">
                            {stats.map((stat) => {
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
                                    {getInitials(managerName)}
                                </Text>
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-[13px] font-lato-bold text-[#111827]">
                                    {managerName}
                                </Text>
                                <Text className="mt-0.5 text-[10px] text-[#64748B]">{managerMeta}</Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleCallManager}
                                disabled={!reportingManager?.phone}
                                className="h-8 w-8 items-center justify-center rounded-[8px] border border-[#DDE2FF] bg-white"
                                style={{ opacity: reportingManager?.phone ? 1 : 0.45 }}
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
                                onPress={() => handleQuickLinkPress(link)}
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
