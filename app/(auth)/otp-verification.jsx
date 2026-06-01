import { Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtpDigit, clearOtp, setLoggedIn, setVerifiedToken } from "../../store/slices/authSlice";
import { authAPI } from "../../services/api";

const logo = require("../../assets/icons/app-icon.png");

export default function OtpVerification() {
    const dispatch = useDispatch();
    const { otp, otpFlow, otpToken, mobile, password, name } = useSelector((state) => state.auth);
    const inputs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        dispatch(setOtpDigit({ index, value: digit }));
        if (digit && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            Alert.alert("Error", "Please enter complete OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.verifyOtp(otpToken, otpCode);
            
            if (otpFlow === 'forgot-password') {
                dispatch(setVerifiedToken(response.verified_token));
                router.push("/change-password");
            } else if (otpFlow === 'register') {
                const [firstName, ...lastNameParts] = name.split(' ');
                const lastName = lastNameParts.join(' ') || firstName;
                await authAPI.register(mobile, password, firstName, lastName);
                dispatch(setLoggedIn(true));
                router.replace("/(tabs)/home");
            }
            dispatch(clearOtp());
        } catch (error) {
            Alert.alert("Verification Failed", error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const purpose = otpFlow === 'forgot-password' ? 'reset_password' : 'register';
            const response = await authAPI.sendOtp(mobile, purpose);
            dispatch(setOtpToken(response.otp_token));
            dispatch(clearOtp());
            inputs.current[0]?.focus();
            Alert.alert("Success", "OTP sent successfully");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Unable to resend OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            <View className="bg-[#4A43EC] pt-16 pb-10 px-6">
                <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                    <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                </View>
                <Text className="text-white text-[36px] font-bold mb-1">OTP Verification</Text>
                <Text className="text-white/80 text-[14px]">OTP has been sent to your registered mobile number</Text>
            </View>

            <View className="flex-1 bg-white px-6 pt-10">

                <View className="flex-row justify-between mb-10">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputs.current[index] = ref)}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            style={{
                                width: 70,
                                height: 70,
                                borderWidth: 1,
                                borderColor: digit ? '#4A43EC' : '#E5E7EB',
                                borderRadius: 12,
                                textAlign: 'center',
                                fontSize: 22,
                                color: '#000',
                            }}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading}
                    className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-6"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-[16px] font-semibold">Submit</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-500 text-[14px]">Didn't get the OTP?  </Text>
                    <TouchableOpacity onPress={handleResend} disabled={resending}>
                        {resending ? (
                            <ActivityIndicator size="small" color="#4A43EC" />
                        ) : (
                            <Text className="text-[#4A43EC] text-[14px] font-semibold">Resend OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}
