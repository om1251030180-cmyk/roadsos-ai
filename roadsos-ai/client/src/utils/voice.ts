'use client';

import axios from 'axios';

export type VoiceStyle = 'emergency' | 'professional' | 'friendly' | 'calm' | 'authoritative';

interface VoiceSynthesisResponse {
  ok: boolean;
  audio: string; // base64 data URL
  meta: {
    voiceId: string;
    language: string;
    textLength: number;
    duration: number;
  };
}

/**
 * Synthesize text to speech using ElevenLabs API
 */
export async function synthesizeVoice(
  text: string,
  style: VoiceStyle = 'professional'
): Promise<string | null> {
  try {
    const response = await axios.post<VoiceSynthesisResponse>(
      'http://localhost:4000/api/voice',
      {
        text,
        voiceId: style, // Maps to voice ID in backend
        language: 'en',
      },
      {
        timeout: 30000, // 30 second timeout for voice generation
      }
    );

    if (response.data?.ok && response.data?.audio) {
      return response.data.audio;
    }

    return null;
  } catch (error) {
    console.error('Voice synthesis error:', error);
    return null;
  }
}

/**
 * Play audio from data URL or blob
 */
export function playAudio(audioDataUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(audioDataUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Stop currently playing audio
 */
export function stopAudio(): void {
  // This is a simple implementation - in production you'd manage audio state
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Synthesize and play text in one operation
 */
export async function speak(text: string, style: VoiceStyle = 'professional'): Promise<boolean> {
  try {
    const audioDataUrl = await synthesizeVoice(text, style);
    if (!audioDataUrl) {
      console.warn('Failed to synthesize voice');
      return false;
    }

    await playAudio(audioDataUrl);
    return true;
  } catch (error) {
    console.error('Speak error:', error);
    return false;
  }
}

/**
 * Get available voices
 */
export async function getAvailableVoices() {
  try {
    const response = await axios.get('http://localhost:4000/api/voice/voices');
    return response.data;
  } catch (error) {
    console.error('Error fetching voices:', error);
    return null;
  }
}

/**
 * Check voice synthesis service health
 */
export async function checkVoiceServiceHealth() {
  try {
    const response = await axios.get('http://localhost:4000/api/voice/health');
    return response.data;
  } catch (error) {
    console.error('Voice service health check failed:', error);
    return null;
  }
}
