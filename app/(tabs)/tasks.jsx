import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fieldOfficerTasks, taskStatusFilters } from "../../data/tasksData";

const PURPLE = "#4A43EC";

const priorityColors = {
    High: "#B91C1C",
    Medium: "#B45309",
    Low: "#2563EB",
};

function openMapLocation(tracking) {
    if (!tracking?.latitude || !tracking?.longitude) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${tracking.latitude},${tracking.longitude}`).catch(() => {});
}

export default function Tasks() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [tasks, setTasks] = useState(fieldOfficerTasks);

    const filteredTasks = useMemo(() => {
        if (activeFilter === "all") return tasks;
        if (activeFilter === "today") return tasks.filter((task) => task.due === "Today");
        if (activeFilter === "open") return tasks.filter((task) => task.status !== "Completed");
        return tasks.filter((task) => task.status === "Completed");
    }, [activeFilter, tasks]);

    const openTasks = tasks.filter((task) => task.status !== "Completed").length;

    const markComplete = (taskId) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? { ...task, status: "Completed", managerValidation: "Ready for final closure" }
                    : task
            )
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" backgroundColor={PURPLE} />
            <SafeAreaView className="flex-1 bg-[#4A43EC]" edges={["top"]}>
                <View className="bg-[#4A43EC] px-4 pb-5 pt-3">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-[20px] font-lato-bold text-white">Tasks</Text>
                            <Text className="mt-1 text-[12px] text-white/75">{openTasks} open tasks</Text>
                        </View>
                        <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-white/15">
                            <Ionicons name="checkbox-outline" size={21} color="#fff" />
                        </View>
                    </View>
                </View>

                <View className="-mt-3 flex-1 rounded-t-[18px] bg-white">
                    <View className="px-4 pt-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                            {taskStatusFilters.map((filter) => {
                                const isActive = activeFilter === filter.key;

                                return (
                                    <TouchableOpacity
                                        key={filter.key}
                                        activeOpacity={0.8}
                                        onPress={() => setActiveFilter(filter.key)}
                                        className={`mr-2 h-8 items-center justify-center rounded-full border px-3.5 ${
                                            isActive ? "border-[#4A43EC] bg-[#4A43EC]" : "border-[#E2E8F0] bg-white"
                                        }`}
                                    >
                                        <Text className={`text-[11px] font-lato-bold ${isActive ? "text-white" : "text-[#475569]"}`}>
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 108, paddingHorizontal: 16, paddingTop: 12 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredTasks.map((task) => {
                            const isCompleted = task.status === "Completed";

                            return (
                                <View
                                    key={task.id}
                                    className="mb-2.5 rounded-[12px] border border-[#E5E7EB] bg-white p-3"
                                >
                                    <View className="flex-row items-start justify-between">
                                        <View className="mr-3 flex-1">
                                            <Text className="text-[14px] font-lato-bold text-[#111827]" numberOfLines={2}>
                                                {task.title}
                                            </Text>
                                            <Text className="mt-1 text-[11px] text-[#64748B]" numberOfLines={1}>
                                                {task.projectName} - {task.location}
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-lato-bold text-[#4A43EC]">{task.status}</Text>
                                    </View>

                                    <View className="mt-3 flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={13} color="#64748B" />
                                            <Text className="ml-1.5 text-[11px] font-semibold text-[#475569]">
                                                {task.due}, {task.time}
                                            </Text>
                                            <View className="mx-2 h-1 w-1 rounded-full bg-[#CBD5E1]" />
                                            <Text className="text-[11px] font-lato-bold" style={{ color: priorityColors[task.priority] ?? "#475569" }}>
                                                {task.priority}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => openMapLocation(task.tracking)}
                                                className="mr-2 h-8 w-8 items-center justify-center rounded-[8px] bg-[#EBF1FF]"
                                            >
                                                <Ionicons name="location-outline" size={14} color={PURPLE} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                onPress={() => markComplete(task.id)}
                                                disabled={isCompleted}
                                                className={`h-8 items-center justify-center rounded-[8px] px-3 ${
                                                    isCompleted ? "bg-[#DCFCE7]" : "bg-[#4A43EC]"
                                                }`}
                                            >
                                                <Text className={`text-[11px] font-lato-bold ${isCompleted ? "text-[#16A34A]" : "text-white"}`}>
                                                    {isCompleted ? "Done" : "Done"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {!filteredTasks.length && (
                            <View className="mt-16 items-center">
                                <Ionicons name="checkmark-done-outline" size={28} color="#CBD5E1" />
                                <Text className="mt-3 text-[14px] font-lato-bold text-[#64748B]">No tasks here</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
