import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, Linking, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { followUps, meetings } from "../../data/homeData";

const profileImage = require("../../assets/images/profile-officer.png");

const stats = [
    { value: "123", label: "Total Leads" },
    { value: "45", label: "Meeting" },
    { value: "34", label: "Onboarding" },
    { value: "14", label: "Live" },
];

const followUpToneStyles = {
    danger: {
        accent: "#EF4444",
        badgeBg: "#FEE2E2",
        badgeText: "#B91C1C",
        icon: "alert-circle",
    },
    hot: {
        accent: "#F97316",
        badgeBg: "#FFEDD5",
        badgeText: "#C2410C",
        icon: "flame",
    },
    warning: {
        accent: "#F59E0B",
        badgeBg: "#FEF3C7",
        badgeText: "#B45309",
        icon: "document-text",
    },
};

const meetingToneStyles = {
    primary: {
        accent: "#4A43EC",
        tileBg: "#EBF1FF",
        tileText: "#4A43EC",
        badgeBg: "#F1EFFF",
        badgeText: "#4A43EC",
    },
    success: {
        accent: "#16A34A",
        tileBg: "#DCFCE7",
        tileText: "#16A34A",
        badgeBg: "#DCFCE7",
        badgeText: "#16A34A",
    },
};

async function openUrl(url) {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    }
}

function callPhoneNumber(phoneNumber) {
    openUrl(`tel:${phoneNumber}`);
}

function openMapLocation(latitude, longitude) {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    openUrl(url);
}

export default function Home() {
    const [activeTab, setActiveTab] = useState("meeting");
    const { width } = useWindowDimensions();
    const notchWidth = Math.min(width * 0.250, 102);
    const notchHeight = 16;

    const isFollowUp = activeTab === "followUp";

    return (
        <View className="flex-1 bg-[#4A43EC]">
            <StatusBar style="dark" />
            <SafeAreaView className="rounded-b-[20px] bg-white" edges={["top"]}>
                <View className="px-4 pb-[15px] pt-2">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                                <Image source={profileImage} className="h-12 w-12" resizeMode="cover" />
                            </View>
                            <View className="ml-2.5">
                                <View className="flex-row items-center">
                                    <Text className="text-[18px] font-lato-bold text-black">
                                        Manas Gangrade
                                    </Text>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={14}
                                        color="#10F528"
                                        style={{ marginLeft: 5 }}
                                    />
                                </View>
                                <Text className="mt-0.5 text-[12px] text-black/60">
                                    Field Officer  - Indore Zone
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <TouchableOpacity
                                activeOpacity={0.75}
                                className="mr-2 h-8 w-8 items-center justify-center rounded-full"
                            >
                                <MaterialCommunityIcons name="wallet" size={23} color="#4A43EC" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.75}
                                className="h-8 w-8 items-center justify-center rounded-full"
                            >
                                <Ionicons name="notifications" size={22} color="#4A43EC" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        className="mt-5 flex-row justify-between rounded-[15px] bg-white px-5 py-3.5"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.06,
                            shadowRadius: 16.5,
                            elevation: 4,
                        }}
                    >
                        {stats.map((item) => (
                            <View
                                key={item.label}
                                className="h-[75px] w-[75px] items-center justify-center rounded-[15px] bg-[#EBF1FF]"
                            >
                                <Text className="text-[13px] font-semibold text-[#333333]">
                                    {item.value}
                                </Text>
                                <Text
                                    className="mt-2 text-center text-[10px] font-semibold text-black"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </SafeAreaView>

            <View className="relative h-[82px] overflow-visible bg-[#4A43EC] px-7 pt-[27px]">
                <View className="z-10 flex-row items-center justify-between">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveTab("meeting")}
                        className={`h-9 w-[107px] items-center justify-center rounded-[10px] border border-white ${
                            isFollowUp ? "bg-white" : "bg-[#4A43EC]"
                        }`}
                    >
                        <Text
                            className={`text-[14px] font-semibold ${
                                isFollowUp ? "text-[#4A43EC]" : "text-white"
                            }`}
                        >
                            Meeting
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-white"
                    >
                        <Ionicons name="add" size={27} color="#4A43EC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveTab("followUp")}
                        className={`h-9 w-[107px] items-center justify-center rounded-[10px] ${
                            isFollowUp ? "border border-white bg-[#4A43EC]" : "bg-white"
                        }`}
                    >
                        <Text
                            className={`text-[14px] font-semibold ${
                                isFollowUp ? "text-white" : "text-[#4A43EC]"
                            }`}
                        >
                            Follow Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View
                className="relative flex-1 overflow-visible rounded-t-[20px] bg-white"
                style={{
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }}
            >
                <View
                    className="absolute top-0 z-10 bg-[#4A43EC]"
                    style={{
                        left: (width - notchWidth) / 2,
                        width: notchWidth,
                        height: notchHeight,
                        borderBottomLeftRadius: 18,
                        borderBottomRightRadius: 18,
                    }}
                >
                    <View className="mx-auto mt-0 h-[4px] w-[54px] rounded-full bg-[#D9D9D9]" />
                </View>
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ minHeight: 570, paddingBottom: 120, paddingTop: notchHeight + 18 }}
                    showsVerticalScrollIndicator={false}
                >
                    {isFollowUp ? (
                        <View className="px-4">

                            {followUps.map((item) => {
                                const tone = followUpToneStyles[item.tone] ?? followUpToneStyles.warning;

                                return (
                                    <View
                                        key={item.id}
                                        className="mb-2 rounded-[12px] border border-[#EEF0F4] bg-white px-3 py-2.5"
                                        style={{
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.04,
                                            shadowRadius: 8,
                                            elevation: 1,
                                        }}
                                    >
                                        <View className="flex-row items-start justify-between">
                                            <View className="mr-2 flex-1">
                                                <Text
                                                    className="text-[12px] font-lato-bold text-[#111827]"
                                                    numberOfLines={1}
                                                >
                                                    {item.projectName}
                                                </Text>
                                                <View className="mt-0.5 flex-row items-center">
                                                    <Text className="text-[10px] text-[#6B7280]" numberOfLines={1}>
                                                        {item.builderName}
                                                    </Text>
                                                    <View className="mx-1.5 h-0.5 w-0.5 rounded-full bg-[#C8CDD8]" />
                                                    <Text className="text-[10px] text-[#6B7280]">{item.time}</Text>
                                                </View>
                                            </View>
                                            <View
                                                className="rounded-full px-2 py-0.5"
                                                style={{ backgroundColor: tone.badgeBg }}
                                            >
                                                <Text
                                                    className="text-[9px] font-semibold"
                                                    style={{ color: tone.badgeText }}
                                                >
                                                    {item.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mt-2 rounded-[9px] bg-[#F8F9FF] px-2.5 py-2">
                                            <Text className="text-[10px] leading-4 text-[#4B5563]">
                                                {item.note}
                                            </Text>
                                        </View>

                                        <View className="mt-2 flex-row items-center">
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                onPress={() => callPhoneNumber(item.phoneNumber)}
                                                className="mr-2 h-8 flex-1 flex-row items-center justify-center rounded-[9px] bg-[#4A43EC]"
                                            >
                                                <Ionicons name="call" size={12} color="#fff" />
                                                <Text className="ml-1.5 text-[11px] font-lato-bold text-white">
                                                    Call
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                className="h-8 flex-1 items-center justify-center rounded-[9px] bg-[#EBF1FF]"
                                            >
                                                <Text className="text-[11px] font-lato-bold text-[#4A43EC]">
                                                    Done
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="px-4">

                            {meetings.map((item) => {
                                const tone = meetingToneStyles[item.tone] ?? meetingToneStyles.primary;

                                return (
                                    <View
                                        key={item.id}
                                        className="mb-2 rounded-[12px] border border-[#EEF0F4] bg-white px-3 py-2.5"
                                        style={{
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.04,
                                            shadowRadius: 8,
                                            elevation: 1,
                                        }}
                                    >
                                        <View className="flex-row items-start justify-between">
                                            <View className="mr-2 flex-1">
                                                <Text
                                                    className="text-[12px] font-lato-bold text-[#111827]"
                                                    numberOfLines={1}
                                                >
                                                    {item.projectName}
                                                </Text>
                                                <View className="mt-0.5 flex-row items-center">
                                                    <Text className="text-[10px] text-[#6B7280]" numberOfLines={1}>
                                                        {item.location} - {item.type}
                                                    </Text>
                                                    <View className="mx-1.5 h-0.5 w-0.5 rounded-full bg-[#C8CDD8]" />
                                                    <Text className="text-[10px] text-[#6B7280]">{item.time}</Text>
                                                </View>
                                            </View>
                                            <View
                                                className="rounded-full px-2 py-0.5"
                                                style={{ backgroundColor: tone.badgeBg }}
                                            >
                                                <Text
                                                    className="text-[9px] font-semibold"
                                                    style={{ color: tone.badgeText }}
                                                >
                                                    {item.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mt-2 rounded-[9px] bg-[#F8F9FF] px-2.5 py-2">
                                            <Text className="text-[10px] leading-4 text-[#4B5563]">
                                                Meet at {item.location} for {item.type.toLowerCase()}.
                                            </Text>
                                        </View>

                                        <View className="mt-2 flex-row items-center">
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                className="mr-2 h-8 flex-1 flex-row items-center justify-center rounded-[9px] bg-[#4A43EC]"
                                            >
                                                <Ionicons name="play-outline" size={12} color="#fff" />
                                                <Text className="ml-1.5 text-[11px] font-lato-bold text-white">
                                                    Start
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                onPress={() => openMapLocation(item.latitude, item.longitude)}
                                                className="h-8 flex-1 flex-row items-center justify-center rounded-[9px] bg-[#EBF1FF]"
                                            >
                                                <Ionicons name="location-outline" size={12} color="#4A43EC" />
                                                <Text className="ml-1.5 text-[11px] font-lato-bold text-[#4A43EC]">
                                                    Navigate
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
