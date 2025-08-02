"""
Text-to-Speech service using Google Cloud TTS
"""

import os
import logging
from typing import Optional, Dict, Any, List
import asyncio
from enum import Enum

from google.cloud import texttospeech
from google.oauth2 import service_account

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class VoiceGender(str, Enum):
    """Available voice genders"""
    NEUTRAL = "NEUTRAL"
    FEMALE = "FEMALE"
    MALE = "MALE"


class AudioEncoding(str, Enum):
    """Supported audio encodings"""
    MP3 = "MP3"
    LINEAR16 = "LINEAR16"
    OGG_OPUS = "OGG_OPUS"


class TextToSpeechService:
    """Service for converting text to speech using Google Cloud TTS"""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self._initialized = False
        self._voices_cache = {}
    
    async def initialize(self):
        """Initialize the TTS client"""
        if self._initialized:
            return
            
        try:
            # Initialize credentials if provided
            if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
                credentials = service_account.Credentials.from_service_account_file(
                    os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
                )
                self.client = texttospeech.TextToSpeechClient(credentials=credentials)
            else:
                self.client = texttospeech.TextToSpeechClient()
            
            self._initialized = True
            logger.info("TTS client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS client: {str(e)}")
            raise
    
    async def synthesize_speech(
        self,
        text: str,
        language_code: str = "it-IT",
        voice_name: Optional[str] = None,
        gender: VoiceGender = VoiceGender.NEUTRAL,
        speaking_rate: float = 1.0,
        pitch: float = 0.0,
        audio_encoding: AudioEncoding = AudioEncoding.MP3
    ) -> Dict[str, Any]:
        """
        Convert text to speech
        
        Args:
            text: Text to synthesize
            language_code: Language code (e.g., 'it-IT', 'en-US')
            voice_name: Specific voice name (optional)
            gender: Voice gender
            speaking_rate: Speaking rate (0.25 to 4.0)
            pitch: Voice pitch (-20.0 to 20.0)
            audio_encoding: Output audio format
            
        Returns:
            Audio data and metadata
        """
        try:
            await self.initialize()
            
            # Prepare synthesis input
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configure voice
            if voice_name:
                voice = texttospeech.VoiceSelectionParams(
                    name=voice_name,
                    language_code=language_code
                )
            else:
                voice = texttospeech.VoiceSelectionParams(
                    language_code=language_code,
                    ssml_gender=getattr(texttospeech.SsmlVoiceGender, gender.value)
                )
            
            # Configure audio
            audio_config = texttospeech.AudioConfig(
                audio_encoding=getattr(texttospeech.AudioEncoding, audio_encoding.value),
                speaking_rate=speaking_rate,
                pitch=pitch
            )
            
            # Perform synthesis
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                self.client.synthesize_speech,
                synthesis_input,
                voice,
                audio_config
            )
            
            return {
                "success": True,
                "audio_content": response.audio_content,
                "text_length": len(text),
                "language": language_code,
                "voice": voice_name or f"{language_code}-{gender.value}",
                "format": audio_encoding.value,
                "duration_estimate": len(text) / 150 * 60  # Rough estimate
            }
            
        except Exception as e:
            logger.error(f"TTS synthesis error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "audio_content": b""
            }
    
    async def synthesize_ssml(
        self,
        ssml: str,
        language_code: str = "it-IT",
        voice_name: Optional[str] = None,
        gender: VoiceGender = VoiceGender.NEUTRAL,
        audio_encoding: AudioEncoding = AudioEncoding.MP3
    ) -> Dict[str, Any]:
        """
        Synthesize speech from SSML markup
        
        Args:
            ssml: SSML markup text
            language_code: Language code
            voice_name: Specific voice name
            gender: Voice gender
            audio_encoding: Output format
            
        Returns:
            Audio data and metadata
        """
        try:
            await self.initialize()
            
            # Prepare SSML input
            synthesis_input = texttospeech.SynthesisInput(ssml=ssml)
            
            # Configure voice
            if voice_name:
                voice = texttospeech.VoiceSelectionParams(
                    name=voice_name,
                    language_code=language_code
                )
            else:
                voice = texttospeech.VoiceSelectionParams(
                    language_code=language_code,
                    ssml_gender=getattr(texttospeech.SsmlVoiceGender, gender.value)
                )
            
            # Configure audio
            audio_config = texttospeech.AudioConfig(
                audio_encoding=getattr(texttospeech.AudioEncoding, audio_encoding.value)
            )
            
            # Perform synthesis
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                self.client.synthesize_speech,
                synthesis_input,
                voice,
                audio_config
            )
            
            return {
                "success": True,
                "audio_content": response.audio_content,
                "language": language_code,
                "voice": voice_name or f"{language_code}-{gender.value}",
                "format": audio_encoding.value
            }
            
        except Exception as e:
            logger.error(f"SSML synthesis error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "audio_content": b""
            }
    
    async def list_voices(self, language_code: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List available voices
        
        Args:
            language_code: Filter by language (optional)
            
        Returns:
            List of available voices
        """
        try:
            await self.initialize()
            
            # Check cache
            cache_key = language_code or "all"
            if cache_key in self._voices_cache:
                return self._voices_cache[cache_key]
            
            # List voices
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                self.client.list_voices,
                language_code
            )
            
            # Format voice data
            voices = []
            for voice in response.voices:
                voices.append({
                    "name": voice.name,
                    "language_codes": voice.language_codes,
                    "gender": voice.ssml_gender.name,
                    "natural_sample_rate": voice.natural_sample_rate_hertz
                })
            
            # Cache results
            self._voices_cache[cache_key] = voices
            
            return voices
            
        except Exception as e:
            logger.error(f"Error listing voices: {str(e)}")
            return []
    
    def create_ssml_with_emphasis(
        self,
        text: str,
        emphasis_words: List[str],
        breaks: List[Dict[str, Any]] = None
    ) -> str:
        """
        Create SSML markup with emphasis and breaks
        
        Args:
            text: Plain text
            emphasis_words: Words to emphasize
            breaks: List of break positions and durations
            
        Returns:
            SSML markup
        """
        ssml = "<speak>"
        
        # Add emphasis to specified words
        for word in emphasis_words:
            text = text.replace(
                word,
                f'<emphasis level="strong">{word}</emphasis>'
            )
        
        # Add breaks
        if breaks:
            for break_info in breaks:
                position = break_info.get("position", 0)
                duration = break_info.get("duration", "500ms")
                text = text[:position] + f'<break time="{duration}"/>' + text[position:]
        
        ssml += text + "</speak>"
        
        return ssml
    
    def get_recommended_voice(self, language_code: str, use_case: str = "assistant") -> Dict[str, Any]:
        """
        Get recommended voice for language and use case
        
        Args:
            language_code: Language code
            use_case: Use case ('assistant', 'narrator', 'casual')
            
        Returns:
            Recommended voice configuration
        """
        recommendations = {
            "it-IT": {
                "assistant": {"name": "it-IT-Wavenet-C", "gender": "MALE"},
                "narrator": {"name": "it-IT-Wavenet-A", "gender": "FEMALE"},
                "casual": {"name": "it-IT-Standard-B", "gender": "FEMALE"}
            },
            "en-US": {
                "assistant": {"name": "en-US-Neural2-J", "gender": "MALE"},
                "narrator": {"name": "en-US-Neural2-C", "gender": "FEMALE"},
                "casual": {"name": "en-US-Wavenet-D", "gender": "MALE"}
            },
            "es-ES": {
                "assistant": {"name": "es-ES-Neural2-B", "gender": "MALE"},
                "narrator": {"name": "es-ES-Neural2-A", "gender": "FEMALE"},
                "casual": {"name": "es-ES-Standard-C", "gender": "FEMALE"}
            }
        }
        
        # Get recommendation or default
        lang_voices = recommendations.get(language_code, {})
        voice_config = lang_voices.get(use_case, {
            "name": None,
            "gender": "NEUTRAL"
        })
        
        return voice_config