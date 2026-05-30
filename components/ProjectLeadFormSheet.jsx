import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioPlayer,
    useAudioPlayerStatus,
    useAudioRecorder,
    useAudioRecorderState,
} from "expo-audio";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const steps = ["1 Info", "2 Location", "3 Stage", "4 Notes"];
const projectCategories = ["Residential", "Commercial", "Mixed-use", "Plotting", "Township"];
const projectTypes = ["Apartment", "Plot", "Villa", "Row House", "Shop", "Office",  "Showroom" ];
const projectTypesByCategory = {
    Residential: ["Apartment", "Plot", "Villa", "Row House"],
    Commercial: ["Shop", "Office", "Showroom"],
    "Mixed-use": ["Apartment", "Shop", "Office"],
    Plotting: ["Plot"],
    Township: ["Apartment", "Plot", "Villa", "Row House"],
};
const leadStages = [
    "New Lead",
    "Contacted",
    "Builder Asked to Call Later",
    "Follow-up Required",
    "Meeting Scheduled",
    "Interested",
];
const interactionTypes = ["Call", "WhatsApp", "Site Visit", "Office Visit", "Reference"];
const priorities = ["Hot", "Warm", "Cold"];
const followUpTimeOptions = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
];

const categoryImages = {
    Residential: require("../assets/images/residential.png"),
    Commercial: require("../assets/images/commercial.png"),
    "Mixed-use": require("../assets/images/showroom.png"),
    Plotting: require("../assets/images/plot.png"),
    Township: require("../assets/images/rowhouse.png"),
};

const typeImages = {
    Apartment: require("../assets/images/apartment.png"),
    Plot: require("../assets/images/plot.png"),
    Villa: require("../assets/images/villa.png"),
    "Row House": require("../assets/images/rowhouse.png"),
    Shop: require("../assets/images/Shop.png"),
    Office: require("../assets/images/office.png"),
    Showroom: require("../assets/images/showroom.png")
};

function formatDuration(durationMillis = 0) {
    const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function formatFollowUpDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getFollowUpDateLabel(date, index) {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";

    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function Field({ label, placeholder, value, onChangeText, keyboardType, containerClassName = "" }) {
    return (
        <View className={containerClassName}>
            <Text className="mb-2 text-[14px] font-lato text-[#5F6068]">{label}</Text>
            <View className="h-[48px] justify-center rounded-[12px] border border-[#E2E2E5] bg-white px-4">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#B8B8BD"
                    keyboardType={keyboardType}
                    className="text-[15px] font-lato text-[#111827]"
                />
            </View>
        </View>
    );
}

function Chip({ label, active, onPress }) {
    return (
        <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPress}
            className={`mb-2 mr-2 h-[31px] items-center justify-center rounded-full px-3.5 ${
                active ? "bg-[#4A43EC]" : "border border-[#E0E1E6] bg-white"
            }`}
            style={
                active
                    ? {
                          shadowColor: "#4A43EC",
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.14,
                          shadowRadius: 6,
                          elevation: 2,
                      }
                    : null
            }
        >
            <Text className={`text-[13px] font-lato-bold ${active ? "text-white" : "text-[#686A73]"}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function CategoryImageCard({ label, active, onPress, image }) {
    return (
        <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPress}
            className="mb-3 overflow-hidden rounded-[9px] border bg-white"
            style={{
                borderColor: active ? "#4A43EC" : "#FFFFFF",
                width: "48%",
                height: 102,
            }}
        >
            <View className="flex-1 px-2.5 py-2">
                <Text className="text-[13px] font-lato text-[#111111]" numberOfLines={1}>
                    {label}
                </Text>
                <Image
                    source={image}
                    className="absolute bottom-0 right-1 h-[78px] w-[115px]"
                    resizeMode="contain"
                />
            </View>
        </TouchableOpacity>
    );
}

function TypeImageCard({ label, active, onPress, image }) {
    return (
        <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPress}
            className="mb-3 overflow-hidden rounded-[9px] border bg-white"
            style={{
                borderColor: active ? "#4A43EC" : "#FFFFFF",
                width: "23%",
                height: 91,
            }}
        >
            <View className="flex-1 items-center px-1.5 pb-1 pt-2">
                <Text className="text-center text-[11px] font-lato text-[#111111]" numberOfLines={1}>
                    {label}
                </Text>
                <Image source={image} className="mt-1 h-[62px] w-[68px]" resizeMode="contain" />
            </View>
        </TouchableOpacity>
    );
}

function RadioOption({ label, selected, onPress }) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className={`mb-3 h-[52px] flex-row items-center rounded-[12px] border px-4 ${
                selected ? "border-[#4A43EC] bg-[#F5F4FF]" : "border-[#E2E2E5] bg-white"
            }`}
        >
            <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#4A43EC]" : "border-[#D1D5DB]"
                }`}
            >
                {selected && <View className="h-2.5 w-2.5 rounded-full bg-[#4A43EC]" />}
            </View>
            <Text className={`ml-3 text-[15px] font-lato ${selected ? "text-[#4A43EC]" : "text-[#374151]"}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function PriorityChip({ label, active, onPress }) {
    const colors = {
        Hot: { border: "#EF4444", text: "#EF4444", bg: "#FEE2E2" },
        Warm: { border: "#F97316", text: "#F97316", bg: "#FFEDD5" },
        Cold: { border: "#6B7280", text: "#6B7280", bg: "#F3F4F6" },
    };
    const style = colors[label] || colors.Cold;

    return (
        <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPress}
            className={`h-[36px] flex-1 items-center justify-center rounded-[12px] border-2`}
            style={{
                borderColor: active ? style.border : "#E5E7EB",
                backgroundColor: active ? style.bg : "#FFFFFF",
            }}
        >
            <Text
                className="text-[15px] font-lato-bold"
                style={{ color: active ? style.text : "#9CA3AF" }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function ProjectLeadFormSheet({ visible, translateY, screenHeight, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [form, setForm] = useState({
        projectName: "",
        builderName: "",
        contactPerson: "",
        mobile: "",
        whatsapp: "",
        city: "",
        area: "",
        colony: "",
        fullAddress: "",
        builderNotes: "",
        followUpDate: "",
    });
    const [category, setCategory] = useState("Residential");
    const [projectType, setProjectType] = useState("Apartment");
    const [leadStage, setLeadStage] = useState("New Lead");
    const [interactionType, setInteractionType] = useState("Call");
    const [priority, setPriority] = useState("Hot");
    const [voiceNoteUri, setVoiceNoteUri] = useState(null);
    const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
    const [followUpPickerOpen, setFollowUpPickerOpen] = useState(false);
    const [followUpPickerStep, setFollowUpPickerStep] = useState("date");
    const [selectedFollowUpDate, setSelectedFollowUpDate] = useState(null);
    const visibleProjectTypes = projectTypesByCategory[category] ?? projectTypes;
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder, 250);
    const voicePlayer = useAudioPlayer(voiceNoteUri ? { uri: voiceNoteUri } : null, {
        updateInterval: 250,
    });
    const voicePlayerStatus = useAudioPlayerStatus(voicePlayer);
    const isRecordingVoiceNote = recorderState.isRecording;
    const isPlayingVoiceNote = voicePlayerStatus.playing;
    const followUpDateOptions = useMemo(
        () =>
            Array.from({ length: 10 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index);

                return {
                    id: date.toISOString(),
                    label: getFollowUpDateLabel(date, index),
                    value: formatFollowUpDate(date),
                };
            }),
        []
    );

    const setField = (field) => (value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const selectCategory = (nextCategory) => {
        const nextTypes = projectTypesByCategory[nextCategory] ?? projectTypes;

        setCategory(nextCategory);
        if (!nextTypes.includes(projectType)) {
            setProjectType(nextTypes[0]);
        }
    };

    const selectFollowUpDate = (dateOption) => {
        setSelectedFollowUpDate(dateOption);
        setFollowUpPickerStep("time");
    };

    const selectFollowUpTime = (timeOption) => {
        if (!selectedFollowUpDate) return;

        setForm((current) => ({
            ...current,
            followUpDate: `${selectedFollowUpDate.value}, ${timeOption}`,
        }));
        setFollowUpPickerOpen(false);
        setFollowUpPickerStep("date");
    };

    const toggleFollowUpPicker = () => {
        setFollowUpPickerOpen((open) => {
            if (!open) {
                setFollowUpPickerStep("date");
            }

            return !open;
        });
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    const handleSave = () => {
        console.log("Saving lead:", {
            form,
            category,
            projectType,
            leadStage,
            interactionType,
            priority,
            voiceNoteUri,
            voiceNoteDuration,
        });
        handleClose();
    };

    const startVoiceRecording = async () => {
        try {
            const permission = await requestRecordingPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Microphone permission needed", "Please allow microphone access to record a voice note.");
                return;
            }

            if (isPlayingVoiceNote) {
                voicePlayer.pause();
            }

            setVoiceNoteUri(null);
            setVoiceNoteDuration(0);
            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch {
            Alert.alert("Recording failed", "Could not start voice recording. Please try again.");
        }
    };

    const stopVoiceRecording = async () => {
        try {
            const duration = recorderState.durationMillis;

            await audioRecorder.stop();
            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            const uri = audioRecorder.uri || recorderState.url;
            if (uri) {
                setVoiceNoteUri(uri);
                setVoiceNoteDuration(duration);
            }
        } catch {
            Alert.alert("Recording failed", "Could not save the voice note. Please try again.");
        }
    };

    const toggleVoiceRecording = () => {
        if (isRecordingVoiceNote) {
            stopVoiceRecording();
            return;
        }

        startVoiceRecording();
    };

    const toggleVoicePlayback = async () => {
        if (!voiceNoteUri) return;

        if (isPlayingVoiceNote) {
            voicePlayer.pause();
            return;
        }

        await voicePlayer.seekTo(0);
        voicePlayer.play();
    };

    const deleteVoiceNote = () => {
        if (isPlayingVoiceNote) {
            voicePlayer.pause();
        }

        setVoiceNoteUri(null);
        setVoiceNoteDuration(0);
    };

    useEffect(() => {
        if (voicePlayerStatus.didJustFinish) {
            voicePlayer.seekTo(0);
        }
    }, [voicePlayer, voicePlayerStatus.didJustFinish]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 8,
                onPanResponderMove: (_, gestureState) => {
                    translateY.setValue(Math.max(0, gestureState.dy));
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dy > 135 || gestureState.vy > 1.1) {
                        onClose();
                        return;
                    }

                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        damping: 24,
                        stiffness: 190,
                    }).start();
                },
            }),
        [onClose, translateY]
    );

    if (!visible) return null;

    return (
        <Animated.View
            className="absolute inset-0 z-50 bg-[#F3F4F8]"
            style={{
                transform: [{ translateY }],
                minHeight: screenHeight,
            }}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <SafeAreaView className="bg-white" edges={["top"]}>
                    <View className="bg-white px-6 pb-4 pt-3" {...panResponder.panHandlers}>
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                activeOpacity={0.78}
                                onPress={handleClose}
                                className="h-11 w-11 items-center justify-center rounded-[11px] bg-[#F5F5F8]"
                            >
                                <Ionicons name="arrow-back" size={24} color="#111111" />
                            </TouchableOpacity>
                            <Text className="ml-4 text-[22px] font-lato-bold text-[#111111]">
                                Add New Project Lead
                            </Text>
                        </View>

                        <View
                            className="mt-5 h-[50px] flex-row rounded-[15px] border border-[#E2E3EB] bg-[#F0F1F6] p-1"
                            style={{ overflow: "hidden" }}
                        >
                            {steps.map((step, index) => {
                                const active = index === currentStep;

                                return (
                                    <View
                                        key={step}
                                        className="flex-1 items-center justify-center"
                                        style={{
                                            backgroundColor: active ? "#4A43EC" : "transparent",
                                            borderRadius: 10,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Text
                                            className={`text-[15px] font-lato ${
                                                active ? "text-white" : "text-[#8E9098]"
                                            }`}
                                        >
                                            {step}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </SafeAreaView>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 98 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Step 1: Basic Project Info */}
                    {currentStep === 0 && (
                        <View className="rounded-[16px] border border-[#E6E7EF] bg-white px-4 py-5">
                            <Text className="mb-5 text-[17px] font-lato text-[#4A43EC]">
                                Step 1: Basic Project Info
                            </Text>

                            <Field
                                label="Project Name *"
                                placeholder="e.g. Skyline Residency"
                                value={form.projectName}
                                onChangeText={setField("projectName")}
                                containerClassName="mb-4"
                            />

                            <Field
                                label="Builder / Developer Name *"
                                placeholder="e.g. Shree Developers"
                                value={form.builderName}
                                onChangeText={setField("builderName")}
                                containerClassName="mb-4"
                            />

                            <Field
                                label="Contact Person"
                                placeholder="Name"
                                value={form.contactPerson}
                                onChangeText={setField("contactPerson")}
                                containerClassName="mb-4"
                            />

                            <View className="mb-4 flex-row" style={{ columnGap: 10 }}>
                                <Field
                                    label="Mobile *"
                                    placeholder="**********"
                                    value={form.mobile}
                                    onChangeText={setField("mobile")}
                                    keyboardType="phone-pad"
                                    containerClassName="flex-1"
                                />
                                <Field
                                    label="WhatsApp"
                                    placeholder="***********"
                                    value={form.whatsapp}
                                    onChangeText={setField("whatsapp")}
                                    keyboardType="phone-pad"
                                    containerClassName="flex-1"
                                />
                            </View>

                            <Text className="mb-2.5 text-[14px] font-lato text-[#111111]">Project Category</Text>
                            <View className="mb-3 flex-row flex-wrap justify-between">
                                {projectCategories.map((item) => (
                                    <CategoryImageCard
                                        key={item}
                                        label={item}
                                        active={category === item}
                                        onPress={() => selectCategory(item)}
                                        image={categoryImages[item]}
                                    />
                                ))}
                            </View>

                            <Text className="mb-2.5 text-[14px] font-lato text-[#111111]">Property Type</Text>
                            <View className="mb-5 flex-row flex-wrap gap-8">
                                {visibleProjectTypes.map((item) => (
                                    <TypeImageCard
                                        key={item}
                                        label={item}
                                        active={projectType === item}
                                        onPress={() => setProjectType(item)}
                                        image={typeImages[item]}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.86}
                                onPress={nextStep}
                                className="h-[45px] flex-row items-center justify-center rounded-[14px] bg-[#4A43EC]"
                            >
                                <Text className="text-[17px] font-lato-bold text-white">
                                    Next: Location Info {"\u2192"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: Location Info */}
                    {currentStep === 1 && (
                        <View className="rounded-[16px] border border-[#E6E7EF] bg-white px-4 py-5">
                            <Text className="mb-5 text-[17px] font-lato text-[#4A43EC]">
                                Step 2: Location Info
                            </Text>

                            <View className="mb-4 flex-row" style={{ columnGap: 10 }}>
                                <Field
                                    label="City"
                                    placeholder="Indore"
                                    value={form.city}
                                    onChangeText={setField("city")}
                                    containerClassName="flex-1"
                                />
                                <Field
                                    label="Area"
                                    placeholder="Vijay Nagar"
                                    value={form.area}
                                    onChangeText={setField("area")}
                                    containerClassName="flex-1"
                                />
                            </View>

                            <Field
                                label="Colony / Landmark"
                                placeholder="Near MR-9 Flyover"
                                value={form.colony}
                                onChangeText={setField("colony")}
                                containerClassName="mb-4"
                            />

                            <Field
                                label="Full Address"
                                placeholder="Enter full address"
                                value={form.fullAddress}
                                onChangeText={setField("fullAddress")}
                                containerClassName="mb-4"
                            />

                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="mb-4 h-[52px] flex-row items-center justify-center rounded-[12px] border-2 border-dashed border-[#4A43EC] bg-[#f4f4f7]"
                            >
                                <Ionicons name="location-outline" size={20} color="#4A43EC" />
                                <Text className="ml-2 text-[15px] font-lato-bold text-[#4A43EC]">
                                    Pick Location on Map
                                </Text>
                            </TouchableOpacity>

                            <View className="mb-5 h-[130px] items-center justify-center rounded-[12px] bg-[#F5F5F8]">
                                <Ionicons name="map-outline" size={48} color="#D1D5DB" />
                                <Text className="mt-2 text-[13px] text-[#9CA3AF]">
                                    Map preview will appear here
                                </Text>
                            </View>

                            <View className="flex-row" style={{ columnGap: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={prevStep}
                                    className="h-[40px] flex-1 items-center justify-center rounded-[14px] bg-[#F3F4F6]"
                                >
                                    <Text className="text-[17px] font-lato-bold text-[#374151]">
                                        {"\u2190"} Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={nextStep}
                                    className="h-[40px] flex-[2] items-center justify-center rounded-[14px] bg-[#4A43EC]"
                                >
                                    <Text className="text-[17px] font-lato-bold text-white">
                                        Next: Stage {"\u2192"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Step 3: Current Lead Stage */}
                    {currentStep === 2 && (
                        <View className="rounded-[16px] border border-[#E6E7EF] bg-white px-4 py-5">
                            <Text className="mb-2 text-[17px] font-lato text-[#4A43EC]">
                                Step 3: Current Lead Stage
                            </Text>
                            <Text className="mb-5 text-[13px] text-[#9CA3AF]">
                                What is the current stage of this project?
                            </Text>

                            {leadStages.map((stage) => (
                                <RadioOption
                                    key={stage}
                                    label={stage}
                                    selected={leadStage === stage}
                                    onPress={() => setLeadStage(stage)}
                                />
                            ))}

                            <View className="mt-2 flex-row" style={{ columnGap: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={prevStep}
                                    className="h-[40px] flex-1 items-center justify-center rounded-[14px] bg-[#F3F4F6]"
                                >
                                    <Text className="text-[17px] font-lato-bold text-[#374151]">
                                        {"\u2190"} Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={nextStep}
                                    className="h-[40px] flex-[2] items-center justify-center rounded-[14px] bg-[#4A43EC]"
                                >
                                    <Text className="text-[17px] font-lato-bold text-white">
                                        Next: Notes {"\u2192"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Step 4: First Interaction Notes */}
                    {currentStep === 3 && (
                        <View className="rounded-[16px] border border-[#E6E7EF] bg-white px-4 py-5">
                            <Text className="mb-5 text-[17px] font-lato text-[#4A43EC]">
                                Step 4: First Interaction Notes
                            </Text>

                            <Text className="mb-2.5 text-[14px] font-lato text-[#5F6068]">Interaction Type</Text>
                            <View className="mb-4 flex-row flex-wrap">
                                {interactionTypes.map((item) => (
                                    <Chip
                                        key={item}
                                        label={item}
                                        active={interactionType === item}
                                        onPress={() => setInteractionType(item)}
                                    />
                                ))}
                            </View>

                            <View className="mb-4">
                                <Text className="mb-2 text-[14px] font-lato text-[#5F6068]">
                                    What did the builder say?
                                </Text>
                                <View className="min-h-[100px] rounded-[12px] border border-[#E2E2E5] bg-white px-4 py-3">
                                    <TextInput
                                        value={form.builderNotes}
                                        onChangeText={setField("builderNotes")}
                                        placeholder="e.g. Builder said partner is out of station. Need to call again on Monday."
                                        placeholderTextColor="#B8B8BD"
                                        multiline
                                        textAlignVertical="top"
                                        className="text-[15px] font-lato text-[#111827]"
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="mb-2 text-[14px] font-lato text-[#5F6068]">
                                    Next Follow-up Date & Time
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={toggleFollowUpPicker}
                                    className="h-[48px] flex-row items-center justify-between rounded-[12px] border border-[#E2E2E5] bg-white px-4"
                                >
                                    <Text className="text-[15px] font-lato text-[#B8B8BD]">
                                        {form.followUpDate || "Select date & time"}
                                    </Text>
                                    <Ionicons
                                        name={followUpPickerOpen ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>

                                {followUpPickerOpen && (
                                    <View className="mt-2 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                                        <View className="mb-3 flex-row items-center justify-between">
                                            <Text className="text-[13px] font-lato-bold text-[#374151]">
                                                {followUpPickerStep === "date" ? "Select date" : "Select time"}
                                            </Text>
                                            {followUpPickerStep === "time" && (
                                                <TouchableOpacity
                                                    activeOpacity={0.75}
                                                    onPress={() => setFollowUpPickerStep("date")}
                                                    className="flex-row items-center"
                                                >
                                                    <Ionicons name="chevron-back" size={16} color="#4A43EC" />
                                                    <Text className="text-[12px] font-lato-bold text-[#4A43EC]">
                                                        Date
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {followUpPickerStep === "date" ? (
                                            <View className="flex-row flex-wrap justify-between">
                                                {followUpDateOptions.map((dateOption) => (
                                                    <TouchableOpacity
                                                        key={dateOption.id}
                                                        activeOpacity={0.82}
                                                        onPress={() => selectFollowUpDate(dateOption)}
                                                        className="mb-2 h-[52px] justify-center rounded-[10px] border bg-white px-3"
                                                        style={{
                                                            borderColor:
                                                                selectedFollowUpDate?.id === dateOption.id
                                                                    ? "#4A43EC"
                                                                    : "#E5E7EB",
                                                            width: "48%",
                                                        }}
                                                    >
                                                        <Text className="text-[13px] font-lato-bold text-[#111827]">
                                                            {dateOption.label}
                                                        </Text>
                                                        <Text className="mt-0.5 text-[11px] text-[#8B8D95]">
                                                            {dateOption.value}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        ) : (
                                            <View>
                                                <Text className="mb-2 text-[12px] font-lato text-[#8B8D95]">
                                                    {selectedFollowUpDate?.value}
                                                </Text>
                                                <View className="flex-row flex-wrap justify-between">
                                                    {followUpTimeOptions.map((timeOption) => (
                                                        <TouchableOpacity
                                                            key={timeOption}
                                                            activeOpacity={0.82}
                                                            onPress={() => selectFollowUpTime(timeOption)}
                                                            className="mb-2 h-[38px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white"
                                                            style={{ width: "31%" }}
                                                        >
                                                            <Text className="text-[12px] font-lato-bold text-[#374151]">
                                                                {timeOption}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            <Text className="mb-2.5 text-[14px] font-lato text-[#5F6068]">Priority</Text>
                            <View className="mb-4 flex-row" style={{ columnGap: 10 }}>
                                {priorities.map((item) => (
                                    <PriorityChip
                                        key={item}
                                        label={item}
                                        active={priority === item}
                                        onPress={() => setPriority(item)}
                                    />
                                ))}
                            </View>

                            <View className="mb-5 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-2.5">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={toggleVoiceRecording}
                                    className={`h-[46px] flex-row items-center justify-center rounded-[10px] ${
                                        isRecordingVoiceNote ? "bg-[#FEE2E2]" : "bg-white"
                                    }`}
                                >
                                    <MaterialCommunityIcons
                                        name={isRecordingVoiceNote ? "stop-circle" : "microphone"}
                                        size={22}
                                        color={isRecordingVoiceNote ? "#EF4444" : "#4A43EC"}
                                    />
                                    <Text
                                        className={`ml-2 text-[15px] font-lato-bold ${
                                            isRecordingVoiceNote ? "text-[#EF4444]" : "text-[#374151]"
                                        }`}
                                    >
                                        {isRecordingVoiceNote ? "Stop Recording" : "Add Voice Note"}
                                    </Text>
                                    <Text className="ml-2 text-[13px] text-[#9CA3AF]">
                                        {isRecordingVoiceNote
                                            ? formatDuration(recorderState.durationMillis)
                                            : voiceNoteUri
                                              ? "Recorded"
                                              : "Tap to record"}
                                    </Text>
                                </TouchableOpacity>

                                {voiceNoteUri && !isRecordingVoiceNote && (
                                    <View className="mt-2 flex-row items-center">
                                        <TouchableOpacity
                                            activeOpacity={0.82}
                                            onPress={toggleVoicePlayback}
                                            className="h-9 w-9 items-center justify-center rounded-full bg-[#4A43EC]"
                                        >
                                            <Ionicons
                                                name={isPlayingVoiceNote ? "pause" : "play"}
                                                size={17}
                                                color="#FFFFFF"
                                            />
                                        </TouchableOpacity>
                                        <View className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                                            <View
                                                className="h-2 rounded-full bg-[#4A43EC]"
                                                style={{
                                                    width: `${
                                                        voicePlayerStatus.duration
                                                            ? Math.min(
                                                                  (voicePlayerStatus.currentTime /
                                                                      voicePlayerStatus.duration) *
                                                                      100,
                                                                  100
                                                              )
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </View>
                                        <Text className="mr-3 text-[12px] font-lato text-[#6B7280]">
                                            {formatDuration(voiceNoteDuration)}
                                        </Text>
                                        <TouchableOpacity
                                            activeOpacity={0.82}
                                            onPress={deleteVoiceNote}
                                            className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]"
                                        >
                                            <Ionicons name="trash-outline" size={17} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row" style={{ columnGap: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={prevStep}
                                    className="h-[40px] flex-1 items-center justify-center rounded-[14px] bg-[#F3F4F6]"
                                >
                                    <Text className="text-[17px] font-lato-bold text-[#374151]">
                                        {"\u2190"} Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={handleSave}
                                    className="h-[40px] flex-[2] flex-row items-center justify-center rounded-[14px] bg-[#10B981]"
                                >
                                    <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                                    <Text className="ml-1 text-[17px] font-lato-bold text-white">
                                        Save Lead
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}
