import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

interface StudySessionProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  estimatedTime: number;
}

export function StudySession({ isActive, onStart, onPause, onComplete, estimatedTime }: StudySessionProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const estimatedSeconds = estimatedTime * 60;
    return Math.min((elapsedTime / estimatedSeconds) * 100, 100);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    onPause();
  };

  if (!isActive) {
    return (
      <TouchableOpacity style={styles.startSessionButton} onPress={onStart}>
        <Ionicons name="play-circle" size={24} color="#4CAF50" />
        <ThemedText style={styles.startSessionText}>Start Study Session</ThemedText>
        <ThemedText style={styles.estimatedTime}>~{estimatedTime} min</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.activeSession}>
      <ThemedView style={styles.sessionHeader}>
        <ThemedView style={styles.timeInfo}>
          <ThemedText type="defaultSemiBold" style={styles.elapsedTime}>
            {formatTime(elapsedTime)}
          </ThemedText>
          <ThemedText style={styles.targetTime}>
            / {estimatedTime} min
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.sessionControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePause}
          >
            <Ionicons 
              name={isPaused ? "play" : "pause"} 
              size={20} 
              color="#FF9800" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.completeButton]}
            onPress={onComplete}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView 
            style={[
              styles.progressFill, 
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
        </ThemedView>
        <ThemedText style={styles.progressText}>
          {Math.round(getProgressPercentage())}%
        </ThemedText>
      </ThemedView>
      
      {isPaused && (
        <ThemedView style={styles.pausedIndicator}>
          <Ionicons name="pause-circle" size={16} color="#FF9800" />
          <ThemedText style={styles.pausedText}>Session Paused</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  startSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  startSessionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
  },
  activeSession: {
    backgroundColor: '#fff8f0',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  elapsedTime: {
    fontSize: 24,
    color: '#FF9800',
  },
  targetTime: {
    fontSize: 14,
    color: '#666',
  },
  sessionControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#FF9800',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  pausedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
  },
  pausedText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
});