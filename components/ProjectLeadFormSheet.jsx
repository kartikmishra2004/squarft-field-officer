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
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const steps = ["1 Info", "2 Location", "3 Stage", "4 Notes"];
const ANDROID_KEYBOARD_EXTRA_SCROLL = 72;
const ANDROID_KEYBOARD_EXTRA_HEIGHT = 240;
const IOS_KEYBOARD_EXTRA_SCROLL = 40;
const IOS_KEYBOARD_EXTRA_HEIGHT = 66;
const ANDROID_CONTENT_BOTTOM_PADDING = 180;
const IOS_CONTENT_BOTTOM_PADDING = 140;
const mainTypes = [
    {
        id: "Residential",
        label: "Residential",
        image: require("../assets/icons/property-types/House2.png"),
        cloudImage: require("../assets/icons/property-types/Clouds.png"),
    },
    {
        id: "Commercial",
        label: "Commercial",
        image: require("../assets/icons/property-types/commercial.png"),
    },
];

const subTypesData = {
    Residential: [
        { id: "Plot", label: "Plot", image: require("../assets/icons/property-types/plot.png") },
        { id: "Villa", label: "Villa", image: require("../assets/icons/property-types/villa.png") },
        { id: "Apartment", label: "Apartment", image: require("../assets/icons/property-types/apartment.png") },
        { id: "Rowhouse", label: "Rowhouse", image: require("../assets/icons/property-types/rowhouse.png") },
    ],
    Commercial: [
        { id: "Shop", label: "Shop", image: require("../assets/icons/property-types/Shop.png") },
        { id: "Showroom", label: "Showroom", image: require("../assets/icons/property-types/showroom.png") },
        { id: "Office", label: "Office", image: require("../assets/icons/property-types/office.png") },
    ],
};

const subTypeOptions = {
    Rowhouse: ["1bhk", "2bhk", "3bhk", "4bhk", "5+bhk"],
    Apartment: ["1bhk", "2bhk", "3bhk", "4bhk", "5+bhk"],
    Office: ["Ready to move", "Co-working", "Bare shell"],
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
            <Text className="mb-1.5 text-xs font-lato-bold text-black">{label}</Text>
            <View className="h-12 justify-center rounded-xl border border-gray-200 bg-white px-4">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    className="text-[13px] font-lato text-gray-800"
                    style={{ paddingVertical: 0, textAlignVertical: "center", includeFontPadding: false }}
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
            className={`mb-2 mr-2 h-9 items-center justify-center rounded-full px-4 ${
                active ? "bg-[#4A43EC]" : "border border-gray-200 bg-white"
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
            <Text className={`text-xs font-lato-bold ${active ? "text-white" : "text-gray-600"}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function CategoryImageCard({ item, active, onPress }) {
    return (
        <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPress}
            className="relative mb-3 overflow-hidden rounded-xl border bg-white"
            style={{
                borderColor: active ? "#4A43EC" : "#F3F4F6",
                backgroundColor: active ? "#F4F7FF" : "#FFFFFF",
                width: (width - 50) / 2,
                height: 96,
                shadowColor: "#111827",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            <Text className="absolute left-2.5 top-2 z-10 text-[10px] font-lato-bold text-black" numberOfLines={1}>
                {item.label}
            </Text>
            <View className="flex-1 items-end justify-end">
                <Image
                    source={item.image}
                    className="h-[70%] w-[80%]"
                    resizeMode="contain"
                />
            </View>
        </TouchableOpacity>
    );
}

function TypeImageCard({ item, active, onPress }) {
    return (
        <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPress}
            className="mb-3 mr-3 items-center overflow-hidden rounded-lg border bg-white"
            style={{
                borderColor: active ? "#4A43EC" : "#F3F4F6",
                backgroundColor: active ? "#F4F7FF" : "#FFFFFF",
                width: width * 0.22,
                height: 80,
                shadowColor: "#111827",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            <Text
                className={`mb-0.5 mt-1.5 text-[9px] font-lato-bold ${
                    active ? "text-[#4A43EC]" : "text-black"
                }`}
                numberOfLines={1}
            >
                {item.label}
            </Text>
            <View className="w-full flex-1 justify-end">
                <Image source={item.image} className="h-[60%] w-full" resizeMode="contain" />
            </View>
        </TouchableOpacity>
    );
}

function SubTypeDropdown({ propertyType, subType, open, onToggle, onSelect }) {
    if (!propertyType || !subTypeOptions[propertyType]) return null;

    return (
        <View>
            <Text className="mb-1.5 text-xs font-lato-bold text-black">Configuration / Status</Text>
            <Pressable
                onPress={onToggle}
                className="h-12 flex-row items-center rounded-xl border border-gray-200 px-4"
            >
                <Text className={`flex-1 text-[13px] ${subType ? "text-gray-900" : "text-gray-400"}`}>
                    {subType || "Select option"}
                </Text>
                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
            </Pressable>
            {open && (
                <View
                    className="mb-1 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white"
                    style={{
                        elevation: 3,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    }}
                >
                    {subTypeOptions[propertyType].map((option, index) => (
                        <Pressable
                            key={option}
                            onPress={() => onSelect(option)}
                            className={`px-4 py-3 ${
                                index < subTypeOptions[propertyType].length - 1 ? "border-b border-gray-100" : ""
                            }`}
                        >
                            <Text className="text-[13px] text-gray-800">{option}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

function RadioOption({ label, selected, onPress }) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className={`mb-3 h-12 flex-row items-center rounded-xl border px-4 ${
                selected ? "border-[#4A43EC] bg-[#F4F7FF]" : "border-gray-200 bg-white"
            }`}
        >
            <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#4A43EC]" : "border-[#D1D5DB]"
                }`}
            >
                {selected && <View className="h-2.5 w-2.5 rounded-full bg-[#4A43EC]" />}
            </View>
            <Text className={`ml-3 text-[13px] font-lato-bold ${selected ? "text-[#4A43EC]" : "text-gray-800"}`}>
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
            className="h-10 flex-1 items-center justify-center rounded-xl border"
            style={{
                borderColor: active ? style.border : "#E5E7EB",
                backgroundColor: active ? style.bg : "#FFFFFF",
            }}
        >
            <Text
                className="text-[13px] font-lato-bold"
                style={{ color: active ? style.text : "#9CA3AF" }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function ProjectLeadFormSheet({ visible, translateY, screenHeight, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const scrollRef = useRef(null);
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
    const [projectType, setProjectType] = useState("");
    const [subType, setSubType] = useState("");
    const [showSubTypeDropdown, setShowSubTypeDropdown] = useState(false);
    const [leadStage, setLeadStage] = useState("New Lead");
    const [interactionType, setInteractionType] = useState("Call");
    const [priority, setPriority] = useState("Hot");
    const [voiceNoteUri, setVoiceNoteUri] = useState(null);
    const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
    const [followUpPickerOpen, setFollowUpPickerOpen] = useState(false);
    const [followUpPickerStep, setFollowUpPickerStep] = useState("date");
    const [selectedFollowUpDate, setSelectedFollowUpDate] = useState(null);
    const visibleProjectTypes = subTypesData[category] ?? [];
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
        setCategory(nextCategory);
        setProjectType("");
        setSubType("");
        setShowSubTypeDropdown(false);
    };

    const selectProjectType = (nextProjectType) => {
        setProjectType(nextProjectType);
        setSubType("");
        setShowSubTypeDropdown(false);
    };

    const selectSubType = (nextSubType) => {
        setSubType(nextSubType);
        setShowSubTypeDropdown(false);
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
            subType,
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

    useEffect(() => {
        scrollRef.current?.scrollToPosition?.(0, 0, false);
        scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    }, [currentStep]);

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
            className="absolute inset-0 z-50 bg-[#F8F9FE]"
            style={{
                transform: [{ translateY }],
                minHeight: screenHeight,
            }}
        >
            <StatusBar barStyle="light-content" />
            <View className="flex-1">
                <SafeAreaView className="bg-[#4A43EC]" edges={["top"]}>
                    <View className="bg-[#4A43EC] px-5 pb-8" {...panResponder.panHandlers}>
                        <View className="mt-2 mb-8 flex-row items-center justify-between">
                            <TouchableOpacity
                                activeOpacity={0.78}
                                onPress={handleClose}
                                className="p-1"
                            >
                                <Ionicons name="arrow-back" size={20} color="white" />
                            </TouchableOpacity>
                            <Text className="flex-1 text-center text-base font-lato-bold text-white">
                                Add New Project Lead
                            </Text>
                            <View style={{ width: 20 }} />
                        </View>

                        <View className="mt-2 flex-row items-start justify-between">
                            {steps.map((step, index) => {
                                const active = index === currentStep;

                                return (
                                    <View
                                        key={step}
                                        className="items-center"
                                        style={{ width: (width - 40) / steps.length }}
                                    >
                                        <View
                                            className={`mb-1.5 h-7 w-7 items-center justify-center rounded-full ${
                                                active ? "bg-white" : "border border-white/40 bg-transparent"
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-lato-bold ${
                                                    active ? "text-[#4A43EC]" : "text-white/60"
                                                }`}
                                            >
                                                {index + 1}
                                            </Text>
                                        </View>
                                        <Text
                                            className={`text-center text-[8px] font-lato ${
                                                active ? "text-white" : "text-white/60"
                                            }`}
                                            numberOfLines={1}
                                        >
                                            {step.replace(/^\d\s*/, "")}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </SafeAreaView>

                <View className="-mt-5 flex-1 overflow-hidden rounded-t-[20px] bg-white">
                    <KeyboardAwareScrollView
                        innerRef={(ref) => {
                            scrollRef.current = ref;
                        }}
                        className="flex-1 px-5 pt-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom:
                                Platform.OS === "android"
                                    ? ANDROID_CONTENT_BOTTOM_PADDING
                                    : IOS_CONTENT_BOTTOM_PADDING,
                            flexGrow: 1,
                        }}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                        enableOnAndroid
                        extraScrollHeight={
                            Platform.OS === "android" ? ANDROID_KEYBOARD_EXTRA_SCROLL : IOS_KEYBOARD_EXTRA_SCROLL
                        }
                        extraHeight={
                            Platform.OS === "android" ? ANDROID_KEYBOARD_EXTRA_HEIGHT : IOS_KEYBOARD_EXTRA_HEIGHT
                        }
                        viewIsInsideTabBar={Platform.OS === "android"}
                        enableAutomaticScroll
                        keyboardOpeningTime={Platform.OS === "android" ? 0 : 250}
                        enableResetScrollToCoords={false}
                        nestedScrollEnabled={Platform.OS === "android"}
                    >
                    {/* Step 1: Basic Project Info */}
                    {currentStep === 0 && (
                        <View className="gap-6">
                            <Text className="text-base font-lato-bold text-black">
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

                            <Text className="text-xs font-lato-bold text-black">Property Category</Text>
                            <View className="flex-row justify-between">
                                {mainTypes.map((item) => (
                                    <CategoryImageCard
                                        key={item.id}
                                        item={item}
                                        active={category === item.id}
                                        onPress={() => selectCategory(item.id)}
                                    />
                                ))}
                            </View>

                            <Text className="text-sm font-lato-bold text-black">Property Type</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row"
                            >
                                {visibleProjectTypes.map((item) => (
                                    <TypeImageCard
                                        key={item.id}
                                        item={item}
                                        active={projectType === item.id}
                                        onPress={() => selectProjectType(item.id)}
                                    />
                                ))}
                            </ScrollView>

                            <SubTypeDropdown
                                propertyType={projectType}
                                subType={subType}
                                open={showSubTypeDropdown}
                                onToggle={() => setShowSubTypeDropdown((open) => !open)}
                                onSelect={selectSubType}
                            />

                            <TouchableOpacity
                                activeOpacity={0.86}
                                onPress={nextStep}
                                className="items-center rounded-xl bg-[#4A43EC] py-4"
                            >
                                <Text className="text-sm font-lato-bold text-white">
                                    Next: Location Info {"\u2192"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: Location Info */}
                    {currentStep === 1 && (
                        <View className="gap-6">
                            <Text className="text-base font-lato-bold text-black">
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
                                className="h-12 flex-row items-center justify-center rounded-2xl border border-dashed border-[#4A43EC]/30 bg-[#F4F7FF]"
                            >
                                <Ionicons name="location-outline" size={20} color="#4A43EC" />
                                <Text className="ml-2 text-xs font-lato-bold text-[#4A43EC]">
                                    Pick Location on Map
                                </Text>
                            </TouchableOpacity>

                            <View className="h-[130px] items-center justify-center rounded-2xl bg-[#F4F7FF]">
                                <Ionicons name="map-outline" size={48} color="#D1D5DB" />
                                <Text className="mt-2 text-[13px] text-[#9CA3AF]">
                                    Map preview will appear here
                                </Text>
                            </View>

                            <View className="flex-row" style={{ columnGap: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={prevStep}
                                    className="flex-1 items-center justify-center rounded-xl bg-gray-100 py-4"
                                >
                                    <Text className="text-sm font-lato-bold text-gray-700">
                                        {"\u2190"} Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={nextStep}
                                    className="flex-[2] items-center justify-center rounded-xl bg-[#4A43EC] py-4"
                                >
                                    <Text className="text-sm font-lato-bold text-white">
                                        Next: Stage {"\u2192"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Step 3: Current Lead Stage */}
                    {currentStep === 2 && (
                        <View className="gap-5">
                            <Text className="text-base font-lato-bold text-black">
                                Step 3: Current Lead Stage
                            </Text>
                            <Text className="text-[11px] text-gray-400">
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
                                    className="flex-1 items-center justify-center rounded-xl bg-gray-100 py-4"
                                >
                                    <Text className="text-sm font-lato-bold text-gray-700">
                                        {"\u2190"} Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={nextStep}
                                    className="flex-[2] items-center justify-center rounded-xl bg-[#4A43EC] py-4"
                                >
                                    <Text className="text-sm font-lato-bold text-white">
                                        Next: Notes {"\u2192"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Step 4: First Interaction Notes */}
                    {currentStep === 3 && (
                        <View className="gap-5">
                            <Text className="text-base font-lato-bold text-black">
                                Step 4: First Interaction Notes
                            </Text>

                            <Text className="text-xs font-lato-bold text-black">Interaction Type</Text>
                            <View className="flex-row flex-wrap">
                                {interactionTypes.map((item) => (
                                    <Chip
                                        key={item}
                                        label={item}
                                        active={interactionType === item}
                                        onPress={() => setInteractionType(item)}
                                    />
                                ))}
                            </View>

                            <View>
                                <Text className="mb-1.5 text-xs font-lato-bold text-black">
                                    What did the builder say?
                                </Text>
                                <View className="min-h-[100px] rounded-xl border border-gray-200 bg-white px-4 py-3">
                                    <TextInput
                                        value={form.builderNotes}
                                        onChangeText={setField("builderNotes")}
                                        placeholder="e.g. Builder said partner is out of station. Need to call again on Monday."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        textAlignVertical="top"
                                        className="text-[13px] font-lato text-gray-800"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="mb-1.5 text-xs font-lato-bold text-black">
                                    Next Follow-up Date & Time
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={toggleFollowUpPicker}
                                    className="h-12 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4"
                                >
                                    <Text className={`text-[13px] font-lato ${form.followUpDate ? "text-gray-800" : "text-gray-400"}`}>
                                        {form.followUpDate || "Select date & time"}
                                    </Text>
                                    <Ionicons
                                        name={followUpPickerOpen ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>

                                {followUpPickerOpen && (
                                    <View className="mt-2 rounded-xl border border-gray-200 bg-[#F8F9FE] p-3">
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

                            <Text className="text-xs font-lato-bold text-black">Priority</Text>
                            <View className="flex-row" style={{ columnGap: 10 }}>
                                {priorities.map((item) => (
                                    <PriorityChip
                                        key={item}
                                        label={item}
                                        active={priority === item}
                                        onPress={() => setPriority(item)}
                                    />
                                ))}
                            </View>

                            <View className="rounded-xl border border-gray-200 bg-[#F8F9FE] p-2.5">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={toggleVoiceRecording}
                                    className={`h-[46px] flex-row items-center justify-center rounded-xl ${
                                        isRecordingVoiceNote ? "bg-[#FEE2E2]" : "bg-white"
                                    }`}
                                >
                                    <MaterialCommunityIcons
                                        name={isRecordingVoiceNote ? "stop-circle" : "microphone"}
                                        size={22}
                                        color={isRecordingVoiceNote ? "#EF4444" : "#4A43EC"}
                                    />
                                    <Text
                                        className={`ml-2 text-[13px] font-lato-bold ${
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
                                    className="flex-1 items-center justify-center rounded-xl bg-gray-100 py-4"
                                >
                                    <Text className="text-sm font-lato-bold text-gray-700">
                                        {"\u2190"} Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.86}
                                    onPress={handleSave}
                                    className="flex-[2] flex-row items-center justify-center rounded-xl bg-[#4A43EC] py-4"
                                >
                                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                    <Text className="ml-1 text-sm font-lato-bold text-white">
                                        Save Lead
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    </KeyboardAwareScrollView>
                </View>
            </View>
        </Animated.View>
    );
}
