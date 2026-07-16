import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PURPLE = "#4A43EC";

const faqs = [
    {
        question: "How do I onboard a new project?",
        answer: "Go to the Projects tab, click the 'Add Project' or onboarding floating action, and complete Steps 1 to 6. You can also save drafts and upload unit details via CSV.",
    },
    {
        question: "What documents are required for KYC?",
        answer: "You need to upload clear photos of your Profile Photo, Aadhar Card (Front), and PAN Card under the KYC section. Admin approvals usually take up to 24 hours.",
    },
    {
        question: "How do I complete a task assigned to me?",
        answer: "Open the Tasks tab (third tab), click the 'Done' button next to the assigned task. This will update the status to Completed in the database and alert your manager.",
    },
    {
        question: "How does map navigation work?",
        answer: "Click the location pin icon on any task or project. The app will launch the in-built navigation system to draw a root polyline from your current location using GPS.",
    },
    {
        question: "Why is my location permission required?",
        answer: "Location access is necessary to find nearby projects relative to your position and to draw turn-by-turn navigation on the map.",
    },
];

export default function SupportScreen() {
    const [expandedFaq, setExpandedFaq] = useState(null);

    const handleCall = () => {
        Linking.openURL("tel:+918000000001").catch(() => {
            Alert.alert("Error", "Unable to place call to support team.");
        });
    };

    const handleWhatsApp = () => {
        Linking.openURL("http://wa.me/918000000001").catch(() => {
            Alert.alert("Error", "WhatsApp is not installed or number is invalid.");
        });
    };

    const handleEmail = () => {
        Linking.openURL("mailto:support@squarft.com?subject=Field Officer App Support Query").catch(() => {
            Alert.alert("Error", "No email client configured on your device.");
        });
    };

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="border-b border-[#EEF2F7] bg-white px-4 pb-3.5 pt-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            activeOpacity={0.78}
                            onPress={() => router.back()}
                            className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#F1F3FA]"
                        >
                            <Ionicons name="arrow-back" size={18} color="#111827" />
                        </TouchableOpacity>
                        <View className="ml-3">
                            <Text className="text-[18px] font-lato-bold text-[#0F172A]">Help & Support</Text>
                            <Text className="mt-0.5 text-[11px] text-[#64748B]">Get immediate assistance & FAQs</Text>
                        </View>
                    </View>
                </View>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Support Channels */}
                    <Text className="mb-2 text-[10px] font-lato-bold uppercase tracking-[1.5px] text-[#64748B]">Contact Support</Text>
                    <View className="mb-5 rounded-[12px] border border-[#E2E8F0] bg-white p-3">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleCall}
                            className="flex-row items-center border-b border-[#F1F5F9] pb-3"
                        >
                            <View className="h-9 w-9 items-center justify-center rounded-[8px] bg-[#EBF1FF]">
                                <Ionicons name="call-outline" size={16} color={PURPLE} />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-[12px] font-lato-bold text-[#111827]">Call Support Hotline</Text>
                                <Text className="text-[10px] text-[#64748B]">+91 80000 00001</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleWhatsApp}
                            className="flex-row items-center border-b border-[#F1F5F9] py-3"
                        >
                            <View className="h-9 w-9 items-center justify-center rounded-[8px] bg-[#DCFCE7]">
                                <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-[12px] font-lato-bold text-[#111827]">Chat on WhatsApp</Text>
                                <Text className="text-[10px] text-[#64748B]">Instant messaging support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleEmail}
                            className="flex-row items-center pt-3"
                        >
                            <View className="h-9 w-9 items-center justify-center rounded-[8px] bg-[#FFF7ED]">
                                <Ionicons name="mail-outline" size={16} color="#EA580C" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-[12px] font-lato-bold text-[#111827]">Email Queries</Text>
                                <Text className="text-[10px] text-[#64748B]">support@squarft.com</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* FAQ Accordion */}
                    <Text className="mb-2 text-[10px] font-lato-bold uppercase tracking-[1.5px] text-[#64748B]">Frequently Asked Questions</Text>
                    <View className="rounded-[12px] border border-[#E2E8F0] bg-white px-3">
                        {faqs.map((faq, index) => {
                            const isExpanded = expandedFaq === index;

                            return (
                                <View key={index} className={`border-b border-[#F1F5F9] last:border-b-0 py-3`}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setExpandedFaq(isExpanded ? null : index)}
                                        className="flex-row items-center justify-between"
                                    >
                                        <Text className="flex-1 pr-2 text-[12px] font-lato-bold text-[#111827]">{faq.question}</Text>
                                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="#64748B" />
                                    </TouchableOpacity>
                                    {isExpanded && (
                                        <Text className="mt-2 text-[11px] leading-4 text-[#475569]">{faq.answer}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Footer / App details */}
                    <View className="mt-8 items-center">
                        <Text className="text-[10px] text-[#94A3B8]">SquarFT Field Officer Application</Text>
                        <Text className="mt-0.5 text-[9px] text-[#CBD5E1]">v1.0.2 (Beta Development Build)</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
