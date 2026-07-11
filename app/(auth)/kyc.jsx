import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { kycAPI, profileAPI, setAuthToken } from '../../services/api';
import { setLoggedIn } from '../../store/slices/authSlice';

const isApprovedStatus = (status) => ['verified', 'approved'].includes(String(status || '').toLowerCase());
const isReviewStatus = (status) => ['under_review', 'pending'].includes(String(status || '').toLowerCase());

const statusMeta = {
  verified: {
    icon: 'check-decagram-outline',
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'KYC Approved',
    message: 'Your KYC has been approved. You can continue using the field officer dashboard.',
    action: 'Continue to Dashboard',
  },
  under_review: {
    icon: 'clock-outline',
    color: '#CA8A04',
    bg: '#FEF9C3',
    title: 'KYC Under Review',
    message: 'Your documents have been submitted. App access will unlock after admin approval.',
    action: 'Refresh Status',
  },
  pending: {
    icon: 'clock-outline',
    color: '#CA8A04',
    bg: '#FEF9C3',
    title: 'KYC Under Review',
    message: 'Your documents have been submitted. App access will unlock after admin approval.',
    action: 'Refresh Status',
  },
};

export default function KycScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();

  const [status, setStatus] = useState(params.status || 'missing');
  const [rejectionReason, setRejectionReason] = useState(params.rejectionReason || '');
  const [fetchingKyc, setFetchingKyc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields (Photos only)
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadharFront, setAadharFront] = useState(null);
  const [panCard, setPanCard] = useState(null);

  // Fetch KYC state on mount
  const loadKycStatus = async () => {
    try {
      setFetchingKyc(true);
      const res = await profileAPI.getProfile();
      if (res && res.success && res.data?.profile) {
        const currentStatus = res.data.profile.kyc_status || 'missing';
        setStatus(currentStatus);
        setRejectionReason(res.data.profile.rejection_reason || '');

        if (currentStatus === 'verified') {
          dispatch(setLoggedIn(true));
          router.replace('/(tabs)/home');
          return;
        }

        if (currentStatus !== 'missing') {
          try {
            const kycRes = await kycAPI.getMyKyc();
            if (kycRes && kycRes.success && kycRes.data) {
              if (kycRes.data.profile_photo_url) setProfilePhoto({ uri: kycRes.data.profile_photo_url });
              if (kycRes.data.aadhar_front_url) setAadharFront({ uri: kycRes.data.aadhar_front_url });
              if (kycRes.data.pan_card_url) setPanCard({ uri: kycRes.data.pan_card_url });
            }
          } catch (e) {
            console.log('No existing KYC details found:', e.message);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile/KYC status:', err);
    } finally {
      setFetchingKyc(false);
    }
  };

  useEffect(() => {
    loadKycStatus();
  }, []);

  const pickImage = async (setter, useCamera = false) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert(
        'Permission needed',
        useCamera ? 'Camera permission is required.' : 'Photo library permission is required.'
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled) setter(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!profilePhoto) {
      Alert.alert('Incomplete KYC', 'Please upload your Selfie captured from your camera.');
      return;
    }
    if (!aadharFront) {
      Alert.alert('Incomplete KYC', 'Please upload your Aadhaar Card Front.');
      return;
    }
    if (!panCard) {
      Alert.alert('Incomplete KYC', 'Please upload your PAN Card.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      const appendFile = (key, file, defaultName) => {
        if (file && file.uri) {
          if (file.uri.startsWith('http')) {
            // Already uploaded on server
            return;
          }
          formData.append(key, {
            uri: file.uri,
            name: file.fileName || defaultName,
            type: file.mimeType || 'image/jpeg',
          });
        }
      };

      appendFile('selfie', profilePhoto, 'selfie.jpg');
      appendFile('aadhar_front', aadharFront, 'aadhar_front.jpg');
      appendFile('pan_card', panCard, 'pan_card.jpg');

      if (status === 'rejected' || status === 'pending') {
        await kycAPI.updateKyc(formData);
      } else {
        await kycAPI.uploadKyc(formData);
      }

      Alert.alert('KYC Submitted', 'Your KYC documents have been submitted for admin approval.');
      loadKycStatus();
    } catch (error) {
      Alert.alert('Submission Failed', error.response?.data?.message || 'Unable to submit KYC. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthToken(null);
      dispatch(setLoggedIn(false));
      router.replace('/(auth)/login');
    } catch (e) {
      router.replace('/(auth)/login');
    }
  };

  const UploadBox = ({ label, value, existingUrl, icon, onPress, onRemove, useCamera }) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      {value || existingUrl ? (
        <View style={styles.uploadedCard}>
          <View style={styles.fileRow}>
            <View style={styles.fileIcon}>
              <MaterialCommunityIcons name={useCamera ? 'camera' : 'file-image-outline'} size={20} color="#4A43EC" />
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {value?.fileName || 'Document uploaded'}
            </Text>
            {value ? (
              <Pressable onPress={onRemove} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </Pressable>
            ) : (
              <Pressable onPress={onPress} style={styles.replaceButton}>
                <Text style={styles.replaceText}>Replace</Text>
              </Pressable>
            )}
          </View>
          <Image source={{ uri: value?.uri || existingUrl }} style={styles.preview} resizeMode="cover" />
        </View>
      ) : (
        <Pressable onPress={onPress} style={styles.uploadBox}>
          <View style={styles.uploadIcon}>
            <MaterialCommunityIcons name={icon} size={28} color="#4A43EC" />
          </View>
          <Text style={styles.uploadTitle}>{useCamera ? 'Open Camera' : 'Upload Image'}</Text>
          <Text style={styles.uploadHint}>JPG or PNG</Text>
        </Pressable>
      )}
    </View>
  );

  const currentStatus = String(status || '').toLowerCase();
  const showStatusOnly = isApprovedStatus(currentStatus) || isReviewStatus(currentStatus);
  const meta = statusMeta[currentStatus] || statusMeta.under_review;
  const isRejected = currentStatus === 'rejected';

  if (fetchingKyc) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A43EC" />
        <Text style={styles.loaderText}>Loading KYC Status...</Text>
      </View>
    );
  }

  if (showStatusOnly) {
    return (
      <SafeAreaView style={styles.statusContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.statusIcon, { backgroundColor: meta.bg }]}>
          <MaterialCommunityIcons name={meta.icon} size={54} color={meta.color} />
        </View>
        <Text style={styles.statusTitle}>{meta.title}</Text>
        <Text style={styles.statusMessage}>{meta.message}</Text>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: meta.color }]}
          onPress={() => {
            if (isApprovedStatus(currentStatus)) {
              dispatch(setLoggedIn(true));
              router.replace('/(tabs)/home');
            } else {
              loadKycStatus();
            }
          }}
        >
          <Text style={styles.primaryButtonText}>{meta.action}</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={handleLogout}
        >
          <Text style={styles.secondaryButtonText}>Log Out</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={handleLogout} style={styles.logoutButtonHeader}>
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
        </Pressable>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isRejected && (
            <View style={styles.rejectedBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.rejectedText}>
                Your KYC was rejected{rejectionReason ? `: ${rejectionReason}` : '. Please re-upload valid documents.'}
              </Text>
            </View>
          )}

          <Text style={styles.subtitle}>
            Upload these documents once. You can access the app only after admin approval.
          </Text>

          <UploadBox
            label="Profile Photo / Selfie"
            value={profilePhoto}
            existingUrl={profilePhoto?.uri}
            icon="camera-outline"
            useCamera
            onPress={() => pickImage(setProfilePhoto, true)}
            onRemove={() => setProfilePhoto(null)}
          />

          <UploadBox
            label="Aadhaar Front"
            value={aadharFront}
            existingUrl={aadharFront?.uri}
            icon="cloud-upload-outline"
            onPress={() => pickImage(setAadharFront, false)}
            onRemove={() => setAadharFront(null)}
          />



          <UploadBox
            label="PAN Card"
            value={panCard}
            existingUrl={panCard?.uri}
            icon="card-account-details-outline"
            onPress={() => pickImage(setPanCard, false)}
            onRemove={() => setPanCard(null)}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitButton, submitting && styles.disabledButton]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>{isRejected ? 'Re-submit KYC' : 'Submit KYC'}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  loaderContainer: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justify: 'center' },
  loaderText: { color: '#6B7280', fontSize: 14, marginTop: 12 },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerSpacer: { width: 28 },
  logoutButtonHeader: { padding: 4 },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 42 },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },
  rejectedBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rejectedText: { color: '#B91C1C', fontSize: 13, lineHeight: 19, flex: 1 },
  fieldBlock: { marginBottom: 22 },
  label: { color: '#374151', fontSize: 14, fontWeight: '700', marginBottom: 9 },
  uploadBox: {
    height: 158,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B9C5FF',
    backgroundColor: '#F7F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitle: { color: '#111827', fontSize: 14, fontWeight: '700' },
  uploadHint: { color: '#9CA3AF', fontSize: 11, marginTop: 4 },
  uploadedCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F4F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileName: { flex: 1, color: '#111827', fontSize: 13, fontWeight: '700' },
  removeButton: { backgroundColor: '#FEF2F2', borderRadius: 20, padding: 8 },
  replaceButton: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  replaceText: { color: '#4A43EC', fontSize: 12, fontWeight: '700' },
  preview: { width: '100%', height: 178, borderRadius: 12 },
  submitButton: {
    backgroundColor: '#4A43EC',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  statusContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  statusIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusTitle: { color: '#111827', fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  statusMessage: { color: '#6B7280', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  primaryButton: {
    minWidth: 190,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 22,
    marginTop: 30,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  secondaryButtonText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
