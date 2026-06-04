import { Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { fetchOfficerProfile } from "../../store/slices/profileSlice";
import { authAPI } from "../../services/api";
import { setLoggedIn } from "../../store/slices/authSlice";

export default function Settings() {
    const dispatch = useDispatch();
    const { profile, performanceThisMonth, reportingManager, loading } = useSelector((state) => state.profile);

    useEffect(() => {
        dispatch(fetchOfficerProfile());
    }, [dispatch]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await authAPI.logout();
                    dispatch(setLoggedIn(false));
                    router.replace("/login");
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4A43EC" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F5F6FA]" edges={["top"]}>
            <View className="bg-white px-4 pb-4 pt-2">
                <Text className="text-[24px] font-lato-bold text-black">Settings</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View className="mx-4 mt-4 rounded-[16px] bg-white p-4">
                    <View className="flex-row items-center">
                        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#EBF1FF]">
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} className="h-16 w-16" resizeMode="cover" />
                            ) : (
                                <Ionicons name="person" size={32} color="#4A43EC" />
                            )}
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-[18px] font-lato-bold text-black">{profile?.name || "Field Officer"}</Text>
                            <Text className="mt-0.5 text-[13px] text-[#6B7280]">{profile?.role_display || "Field Officer"}</Text>
                            {profile?.is_verified && (
                                <View className="mt-1 flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text className="ml-1 text-[11px] text-[#10B981]">Verified</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Performance This Month */}
                {performanceThisMonth && (
                    <View className="mx-4 mt-3 rounded-[16px] bg-white p-4">
                        <Text className="mb-3 text-[16px] font-lato-bold text-black">Performance This Month</Text>
                        <View className="flex-row flex-wrap">
                            <View className="mb-2 w-1/2 pr-2">
                                <Text className="text-[24px] font-lato-bold text-[#4A43EC]">{performanceThisMonth.total_leads}</Text>
                                <Text className="text-[12px] text-[#6B7280]">Total Leads</Text>
                            </View>
                            <View className="mb-2 w-1/2 pl-2">
                                <Text className="text-[24px] font-lato-bold text-[#4A43EC]">{performanceThisMonth.meetings_done}</Text>
                                <Text className="text-[12px] text-[#6B7280]">Meetings Done</Text>
                            </View>
                            <View className="w-1/2 pr-2">
                                <Text className="text-[24px] font-lato-bold text-[#4A43EC]">{performanceThisMonth.onboarded}</Text>
                                <Text className="text-[12px] text-[#6B7280]">Onboarded</Text>
                            </View>
                            <View className="w-1/2 pl-2">
                                <Text className="text-[24px] font-lato-bold text-[#4A43EC]">{performanceThisMonth.projects_live}</Text>
                                <Text className="text-[12px] text-[#6B7280]">Projects Live</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Reporting Manager */}
                {reportingManager && (
                    <View className="mx-4 mt-3 rounded-[16px] bg-white p-4">
                        <Text className="mb-3 text-[16px] font-lato-bold text-black">Reporting Manager</Text>
                        <Text className="text-[15px] font-lato-bold text-black">{reportingManager.name}</Text>
                        <Text className="mt-0.5 text-[13px] text-[#6B7280]">{reportingManager.role_display}</Text>
                        {reportingManager.location && (
                            <Text className="mt-1 text-[12px] text-[#6B7280]">{reportingManager.location}</Text>
                        )}
                        {reportingManager.phone && (
                            <TouchableOpacity className="mt-2 flex-row items-center">
                                <Ionicons name="call-outline" size={16} color="#4A43EC" />
                                <Text className="ml-1 text-[13px] text-[#4A43EC]">{reportingManager.phone}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Actions */}
                <View className="mx-4 mt-3 rounded-[16px] bg-white">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between border-b border-[#F3F4F6] px-4 py-4"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="lock-closed-outline" size={20} color="#374151" />
                            <Text className="ml-3 text-[15px] text-[#374151]">Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleLogout}
                        className="flex-row items-center justify-between px-4 py-4"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                            <Text className="ml-3 text-[15px] text-[#EF4444]">Logout</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}