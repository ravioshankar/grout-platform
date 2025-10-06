import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Privacy Policy" />


      <ThemedView style={styles.content}>
        <ThemedText style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Information We Collect</ThemedText>
          <ThemedText style={styles.text}>
            • Test scores and practice session data stored locally on your device{'\n'}
            • Study progress and bookmarked questions{'\n'}
            • App usage analytics to improve user experience{'\n'}
            • No personal information like name, email, or phone number is collected
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>How We Use Your Information</ThemedText>
          <ThemedText style={styles.text}>
            • Track your learning progress and test performance{'\n'}
            • Provide personalized study recommendations{'\n'}
            • Improve app functionality and user experience{'\n'}
            • All data processing occurs locally on your device
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Data Storage</ThemedText>
          <ThemedText style={styles.text}>
            • All your data is stored locally on your device{'\n'}
            • No data is transmitted to external servers{'\n'}
            • Data is automatically deleted when you uninstall the app{'\n'}
            • You can clear all data through the app settings
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Third-Party Services</ThemedText>
          <ThemedText style={styles.text}>
            This app does not use any third-party analytics, advertising, or tracking services.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Children's Privacy</ThemedText>
          <ThemedText style={styles.text}>
            This app is suitable for users of all ages. We do not knowingly collect personal information from children under 13.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Changes to Privacy Policy</ThemedText>
          <ThemedText style={styles.text}>
            We may update this privacy policy from time to time. Changes will be reflected in the app with an updated "Last updated" date.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Contact Us</ThemedText>
          <ThemedText style={styles.text}>
            If you have questions about this privacy policy, please contact us through the app store review system.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
});