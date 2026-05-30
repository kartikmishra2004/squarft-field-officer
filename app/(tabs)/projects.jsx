import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { projectFilters } from "../../data/projectsData";
import { selectProjects } from "../../store/slices/projectsSlice";

const typeStyles = {
    Hot: { bg: "#FEE2E2", text: "#B91C1C" },
    Warm: { bg: "#FFEDD5", text: "#C2410C" },
    Cold: { bg: "#DBEAFE", text: "#2563EB" },
};

const statusStyles = {
    followUp: { bg: "#FFF7ED", text: "#EA580C" },
    meeting: { bg: "#F1EFFF", text: "#4A43EC" },
};

function openUrl(url) {
    Linking.openURL(url).catch(() => {});
}

export default function Projects() {
    const router = useRouter();
    const projects = useSelector(selectProjects);
    const [activeFilter, setActiveFilter] = useState("all");
    const [query, setQuery] = useState("");

    const filteredProjects = useMemo(() => {
        const searchText = query.trim().toLowerCase();

        return projects.filter((project) => {
            const matchesFilter = activeFilter === "all" || project.statusType === activeFilter;
            const matchesSearch = !searchText || project.projectName.toLowerCase().includes(searchText);

            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, projects, query]);

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <SafeAreaView className="flex-1" edges={["top"]}>
                <View className="px-4 pb-2 pt-1">
                    <Text className="text-[20px] font-lato-bold text-[#0F172A]">Projects</Text>

                    <View className="mt-3 h-11 flex-row items-center rounded-[12px] border border-[#E5E7EB] bg-white px-3">
                        <Ionicons name="search-outline" size={17} color="#8A94A6" />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search project name"
                            placeholderTextColor="#9CA3AF"
                            className="ml-2 flex-1 text-[12px] text-[#111827]"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {query ? (
                            <TouchableOpacity activeOpacity={0.75} onPress={() => setQuery("")}>
                                <Ionicons name="close-circle" size={17} color="#9CA3AF" />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View className="mt-2.5 flex-row">
                        {projectFilters.map((filter) => {
                            const isActive = activeFilter === filter.key;
                            const label = filter.key === "all" ? `${filter.label} (${projects.length})` : filter.label;

                            return (
                                <TouchableOpacity
                                    key={filter.key}
                                    activeOpacity={0.8}
                                    onPress={() => setActiveFilter(filter.key)}
                                    className={`mr-2 h-8 items-center justify-center rounded-full border px-3.5 ${
                                        isActive ? "border-[#4A43EC] bg-[#4A43EC]" : "border-[#E2E8F0] bg-white"
                                    }`}
                                >
                                    <Text
                                        className={`text-[11px] font-lato-bold ${
                                            isActive ? "text-white" : "text-[#475569]"
                                        }`}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96, paddingTop: 2 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {filteredProjects.map((project) => {
                        const typeStyle = typeStyles[project.type] ?? typeStyles.Warm;
                        const statusStyle = statusStyles[project.statusType] ?? statusStyles.followUp;

                        return (
                            <View
                                key={project.id}
                                className="mb-2.5 rounded-[12px] border border-[#E5E7EB] bg-white p-2.5"
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="mr-3 flex-1">
                                        <View className="flex-row items-center">
                                            <Text
                                                className="mr-2 flex-shrink text-[14px] font-lato-bold text-[#0F172A]"
                                                numberOfLines={1}
                                            >
                                                {project.projectName}
                                            </Text>
                                            <View
                                                className="rounded-full px-1.5 py-0.5"
                                                style={{ backgroundColor: typeStyle.bg }}
                                            >
                                                <Text className="text-[9px] font-semibold" style={{ color: typeStyle.text }}>
                                                    {project.type}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="mt-0.5 text-[11px] text-[#64748B]" numberOfLines={1}>
                                            {project.developerName} . {project.location}
                                        </Text>
                                    </View>

                                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: statusStyle.bg }}>
                                        <Text className="text-[9px] font-lato-bold" style={{ color: statusStyle.text }}>
                                            {project.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="mt-2.5 rounded-[10px] bg-[#F8F9FF] px-2.5 py-2">
                                    <Text className="text-[9px] text-[#64748B]">Next action</Text>
                                    <Text className="mt-0.5 text-[12px] font-semibold text-[#111827]">
                                        {project.nextAction}
                                    </Text>
                                </View>

                                <View className="mt-2.5 flex-row items-center justify-between">
                                    <Text className="text-[10px] text-[#94A3B8]">Last contact: {project.lastContact}</Text>

                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => openUrl(`tel:${project.phoneNumber}`)}
                                            className="mr-2 h-7 w-7 items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC]"
                                        >
                                            <Ionicons name="call-outline" size={13} color="#475569" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={() => router.push(`/projects/${project.id}`)}
                                            className="h-7 items-center justify-center rounded-[8px] bg-[#4A43EC] px-3.5"
                                        >
                                            <Text className="text-[11px] font-lato-bold text-white">View</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {!filteredProjects.length ? (
                        <View className="mt-16 items-center">
                            <Ionicons name="search-outline" size={32} color="#CBD5E1" />
                            <Text className="mt-3 text-[14px] font-lato-bold text-[#64748B]">No projects found</Text>
                        </View>
                    ) : null}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
