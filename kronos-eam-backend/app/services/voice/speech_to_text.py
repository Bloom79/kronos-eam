"""
Speech-to-Text service using Gemma 3n model
"""

import os
import logging
from typing import Optional, Dict, Any, Tuple
import numpy as np
import soundfile as sf
from pathlib import Path
import asyncio
import tempfile

from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
import torch
import librosa

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class SpeechToTextService:
    """Service for converting speech to text using Gemma 3n"""
    
    def __init__(self):
        self.settings = get_settings()
        self.model = None
        self.processor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._initialized = False
        
        # Model configuration
        self.model_name = "google/gemma-3n-2b-pt"  # Placeholder - use actual Gemma 3n model
        self.sample_rate = 16000
        self.max_duration = 30  # seconds
    
    async def initialize(self):
        """Initialize the STT model"""
        if self._initialized:
            return
            
        try:
            logger.info("Initializing Gemma 3n STT model...")
            
            # Load processor and model
            self.processor = AutoProcessor.from_pretrained(self.model_name)
            self.model = AutoModelForSpeechSeq2Seq.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                low_cpu_mem_usage=True
            )
            self.model.to(self.device)
            
            self._initialized = True
            logger.info("STT model initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize STT model: {str(e)}")
            # Fallback to Google Cloud Speech-to-Text if Gemma fails
            logger.info("Falling back to Google Cloud Speech-to-Text")
            self._initialized = True
    
    async def transcribe_audio(
        self,
        audio_data: bytes,
        language_code: Optional[str] = None,
        format: str = "wav"
    ) -> Dict[str, Any]:
        """
        Transcribe audio to text
        
        Args:
            audio_data: Raw audio bytes
            language_code: Optional language hint (e.g., 'it-IT', 'en-US')
            format: Audio format ('wav', 'mp3')
            
        Returns:
            Transcription result with text and metadata
        """
        try:
            await self.initialize()
            
            # Save audio to temporary file for processing
            with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as tmp_file:
                tmp_file.write(audio_data)
                tmp_path = tmp_file.name
            
            try:
                # Process audio according to Gemma requirements
                audio_array = self._preprocess_audio(tmp_path)
                
                # Use Gemma model if available
                if self.model and self.processor:
                    result = await self._transcribe_with_gemma(audio_array, language_code)
                else:
                    # Fallback to Google Cloud Speech
                    result = await self._transcribe_with_google_cloud(audio_data, language_code)
                
                return result
                
            finally:
                # Clean up temporary file
                os.unlink(tmp_path)
                
        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "transcript": ""
            }
    
    def _preprocess_audio(self, audio_path: str) -> np.ndarray:
        """
        Preprocess audio to match Gemma requirements:
        - 16kHz sample rate
        - Single channel (mono)
        - Float32 in range [-1, 1]
        """
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=None, mono=False)
            
            # Convert to mono if stereo
            if len(audio.shape) > 1:
                audio = librosa.to_mono(audio)
            
            # Resample to 16kHz if needed
            if sr != self.sample_rate:
                audio = librosa.resample(audio, orig_sr=sr, target_sr=self.sample_rate)
            
            # Ensure float32 and normalize to [-1, 1]
            audio = audio.astype(np.float32)
            if audio.max() > 1.0 or audio.min() < -1.0:
                audio = audio / np.max(np.abs(audio))
            
            # Limit duration to 30 seconds
            max_samples = self.sample_rate * self.max_duration
            if len(audio) > max_samples:
                audio = audio[:max_samples]
            
            return audio
            
        except Exception as e:
            logger.error(f"Audio preprocessing error: {str(e)}")
            raise
    
    async def _transcribe_with_gemma(
        self,
        audio_array: np.ndarray,
        language_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe using Gemma 3n model"""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            
            def _process():
                # Process audio with model
                inputs = self.processor(
                    audio_array,
                    sampling_rate=self.sample_rate,
                    return_tensors="pt"
                ).to(self.device)
                
                # Generate transcription
                with torch.no_grad():
                    generated_ids = self.model.generate(
                        inputs.input_features,
                        max_length=225,
                        language=language_code
                    )
                
                # Decode to text
                transcription = self.processor.batch_decode(
                    generated_ids,
                    skip_special_tokens=True
                )[0]
                
                return transcription
            
            transcript = await loop.run_in_executor(None, _process)
            
            return {
                "success": True,
                "transcript": transcript,
                "language": language_code or "auto-detected",
                "confidence": 0.95,  # Placeholder
                "duration": len(audio_array) / self.sample_rate,
                "model": "gemma-3n"
            }
            
        except Exception as e:
            logger.error(f"Gemma transcription error: {str(e)}")
            raise
    
    async def _transcribe_with_google_cloud(
        self,
        audio_data: bytes,
        language_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """Fallback to Google Cloud Speech-to-Text"""
        try:
            from google.cloud import speech
            
            client = speech.SpeechClient()
            
            # Configure request
            audio = speech.RecognitionAudio(content=audio_data)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=self.sample_rate,
                language_code=language_code or "it-IT",
                enable_automatic_punctuation=True,
                model="latest_long"
            )
            
            # Perform transcription
            response = client.recognize(config=config, audio=audio)
            
            # Extract results
            transcript = ""
            confidence = 0.0
            
            for result in response.results:
                transcript += result.alternatives[0].transcript + " "
                confidence = max(confidence, result.alternatives[0].confidence)
            
            return {
                "success": True,
                "transcript": transcript.strip(),
                "language": language_code or "it-IT",
                "confidence": confidence,
                "model": "google-cloud-speech"
            }
            
        except Exception as e:
            logger.error(f"Google Cloud STT error: {str(e)}")
            raise
    
    async def transcribe_stream(
        self,
        audio_stream,
        language_code: Optional[str] = None
    ):
        """
        Transcribe audio stream in real-time
        
        Args:
            audio_stream: Async generator yielding audio chunks
            language_code: Optional language hint
            
        Yields:
            Partial transcription results
        """
        # This would implement streaming transcription
        # For now, placeholder
        yield {
            "partial": True,
            "transcript": "Streaming transcription not yet implemented"
        }
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages"""
        return {
            "it-IT": "Italian",
            "en-US": "English (US)",
            "en-GB": "English (UK)",
            "es-ES": "Spanish",
            "fr-FR": "French",
            "de-DE": "German",
            "pt-PT": "Portuguese",
            "nl-NL": "Dutch",
            "pl-PL": "Polish",
            "ru-RU": "Russian",
            "zh-CN": "Chinese (Simplified)",
            "ja-JP": "Japanese",
            "ko-KR": "Korean",
            "ar-SA": "Arabic"
        }