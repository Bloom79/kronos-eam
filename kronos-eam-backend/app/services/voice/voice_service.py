"""
Unified voice service combining STT and TTS capabilities
"""

import logging
from typing import Optional, Dict, Any, List, Union
from enum import Enum
import asyncio
import tempfile
import os

from app.services.voice.speech_to_text import SpeechToTextService
from app.services.voice.text_to_speech import TextToSpeechService, VoiceGender, AudioEncoding
from app.services.voice.gemini_tts import GeminiTTSService, GeminiVoice
from app.services.agent_service import agent_service, AgentType
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class TTSProvider(str, Enum):
    """Available TTS providers"""
    GEMINI = "gemini"
    GOOGLE_CLOUD = "google_cloud"
    AUTO = "auto"


class VoiceService:
    """
    Unified voice service for speech processing
    Combines STT, TTS, and agent interactions
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.stt_service = SpeechToTextService()
        self.tts_google = TextToSpeechService()
        self.tts_gemini = GeminiTTSService()
        self._initialized = False
        
        # Default configurations
        self.default_language = self.settings.VOICE_LANGUAGE_CODE or "it-IT"
        self.default_tts_provider = TTSProvider.GEMINI
    
    async def initialize(self):
        """Initialize all voice services"""
        if self._initialized:
            return
            
        try:
            # Initialize services in parallel
            await asyncio.gather(
                self.stt_service.initialize(),
                self.tts_google.initialize(),
                self.tts_gemini.initialize()
            )
            
            self._initialized = True
            logger.info("Voice service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize voice service: {str(e)}")
            # Continue with available services
            self._initialized = True
    
    async def process_voice_query(
        self,
        audio_data: bytes,
        tenant_id: str,
        user_id: Optional[str] = None,
        language_code: Optional[str] = None,
        agent_type: Optional[AgentType] = None,
        tts_provider: TTSProvider = TTSProvider.AUTO,
        voice_style: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete voice interaction pipeline:
        1. Convert speech to text
        2. Process with agent
        3. Convert response to speech
        
        Args:
            audio_data: Input audio bytes
            tenant_id: Tenant identifier
            user_id: User identifier
            language_code: Language for STT/TTS
            agent_type: Specific agent to use
            tts_provider: TTS provider preference
            voice_style: Voice style for response
            
        Returns:
            Complete interaction result with audio response
        """
        try:
            await self.initialize()
            
            language_code = language_code or self.default_language
            
            # Step 1: Speech to Text
            stt_result = await self.stt_service.transcribe_audio(
                audio_data=audio_data,
                language_code=language_code
            )
            
            if not stt_result.get("success"):
                return {
                    "success": False,
                    "error": "Failed to transcribe audio",
                    "details": stt_result
                }
            
            transcript = stt_result["transcript"]
            
            # Step 2: Process with Agent
            agent_result = await agent_service.process_message(
                message=transcript,
                tenant_id=tenant_id,
                user_id=user_id,
                agent_type=agent_type,
                context={"voice_interaction": True, "language": language_code}
            )
            
            if not agent_result.get("success"):
                response_text = "Mi dispiace, non sono riuscito a elaborare la tua richiesta."
            else:
                response_text = agent_result.get("result", {}).get(
                    "summary",
                    "Ho elaborato la tua richiesta."
                )
            
            # Step 3: Text to Speech
            tts_result = await self.synthesize_response(
                text=response_text,
                language_code=language_code,
                provider=tts_provider,
                voice_style=voice_style
            )
            
            return {
                "success": True,
                "transcript": transcript,
                "response_text": response_text,
                "audio_response": tts_result.get("audio_content", b""),
                "agent_type": agent_result.get("agent_type"),
                "confidence": stt_result.get("confidence", 0),
                "language": language_code,
                "tts_provider": tts_result.get("provider", "unknown")
            }
            
        except Exception as e:
            logger.error(f"Voice query processing error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def synthesize_response(
        self,
        text: str,
        language_code: Optional[str] = None,
        provider: TTSProvider = TTSProvider.AUTO,
        voice_style: Optional[str] = None,
        voice_name: Optional[Union[str, GeminiVoice]] = None
    ) -> Dict[str, Any]:
        """
        Synthesize text to speech with provider selection
        
        Args:
            text: Text to synthesize
            language_code: Language code
            provider: TTS provider to use
            voice_style: Style prompt for Gemini
            voice_name: Specific voice name
            
        Returns:
            Audio data and metadata
        """
        language_code = language_code or self.default_language
        
        # Auto-select provider based on requirements
        if provider == TTSProvider.AUTO:
            # Use Gemini for style control, Google Cloud for specific voices
            if voice_style:
                provider = TTSProvider.GEMINI
            else:
                provider = self.default_tts_provider
        
        try:
            if provider == TTSProvider.GEMINI:
                # Use Gemini TTS
                result = await self.tts_gemini.synthesize_speech(
                    text=text,
                    voice_name=voice_name if isinstance(voice_name, GeminiVoice) else None,
                    style_prompt=voice_style,
                    language_hint=language_code[:2]
                )
                result["provider"] = "gemini"
                
            else:
                # Use Google Cloud TTS
                result = await self.tts_google.synthesize_speech(
                    text=text,
                    language_code=language_code,
                    voice_name=voice_name if isinstance(voice_name, str) else None
                )
                result["provider"] = "google_cloud"
            
            return result
            
        except Exception as e:
            logger.error(f"TTS synthesis error with {provider}: {str(e)}")
            
            # Try fallback provider
            if provider == TTSProvider.GEMINI:
                logger.info("Falling back to Google Cloud TTS")
                return await self.tts_google.synthesize_speech(
                    text=text,
                    language_code=language_code
                )
            else:
                logger.info("Falling back to Gemini TTS")
                return await self.tts_gemini.synthesize_speech(
                    text=text,
                    language_hint=language_code[:2]
                )
    
    async def stream_voice_interaction(
        self,
        audio_stream,
        tenant_id: str,
        user_id: Optional[str] = None,
        language_code: Optional[str] = None
    ):
        """
        Stream voice interaction for real-time processing
        
        Args:
            audio_stream: Async generator yielding audio chunks
            tenant_id: Tenant identifier
            user_id: User identifier
            language_code: Language code
            
        Yields:
            Partial results and final audio response
        """
        # Placeholder for streaming implementation
        yield {
            "type": "partial_transcript",
            "transcript": "Streaming not yet implemented"
        }
    
    def is_smartphone_required(self) -> Dict[str, Any]:
        """
        Check if smartphone app is mandatory for voice features
        
        Returns:
            Analysis of voice feature requirements
        """
        return {
            "smartphone_required": False,
            "reason": "Web browsers support WebRTC and Media Streams API",
            "browser_requirements": {
                "microphone_access": True,
                "audio_playback": True,
                "webrtc_support": True,
                "minimum_browsers": {
                    "chrome": ">=60",
                    "firefox": ">=55",
                    "safari": ">=11",
                    "edge": ">=79"
                }
            },
            "advantages_of_app": [
                "Better audio quality control",
                "Background audio processing",
                "Offline speech recognition",
                "Push-to-talk hardware button",
                "Lower latency"
            ],
            "web_limitations": [
                "Requires HTTPS for microphone access",
                "User must grant microphone permissions",
                "No background processing",
                "Limited offline capabilities"
            ],
            "recommendation": "Web-first approach with optional mobile app for power users"
        }
    
    async def test_voice_capabilities(self) -> Dict[str, Any]:
        """Test all voice capabilities"""
        results = {
            "stt": {"available": False, "error": None},
            "tts_gemini": {"available": False, "error": None},
            "tts_google": {"available": False, "error": None}
        }
        
        try:
            # Test STT
            await self.stt_service.initialize()
            results["stt"]["available"] = True
        except Exception as e:
            results["stt"]["error"] = str(e)
        
        try:
            # Test Gemini TTS
            await self.tts_gemini.initialize()
            test_result = await self.tts_gemini.synthesize_speech(
                "Test",
                voice_name=GeminiVoice.DEFAULT
            )
            results["tts_gemini"]["available"] = test_result.get("success", False)
        except Exception as e:
            results["tts_gemini"]["error"] = str(e)
        
        try:
            # Test Google Cloud TTS
            await self.tts_google.initialize()
            voices = await self.tts_google.list_voices()
            results["tts_google"]["available"] = len(voices) > 0
        except Exception as e:
            results["tts_google"]["error"] = str(e)
        
        return results


# Singleton instance
voice_service = VoiceService()