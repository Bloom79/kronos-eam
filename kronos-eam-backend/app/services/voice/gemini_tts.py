"""
Text-to-Speech service using Gemini 2.5 Flash/Pro Preview TTS
"""

import os
import logging
from typing import Optional, Dict, Any, List
import asyncio
from enum import Enum
import base64

import google.generativeai as genai
from google.generativeai import types

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class GeminiVoice(str, Enum):
    """Available Gemini voices with characteristics"""
    # Energetic voices
    ZEPHYR = "Zephyr"  # Bright
    PUCK = "Puck"  # Upbeat
    CHARON = "Charon"  # Dynamic
    
    # Warm voices
    KORE = "Kore"  # Warm
    FENRIR = "Fenrir"  # Engaging
    AOEDE = "Aoede"  # Bright
    
    # Professional voices
    ORPHEUS = "Orpheus"  # Deep
    PEGASUS = "Pegasus"  # Formal
    NOVA = "Nova"  # Professional
    
    # Calm voices
    LUNA = "Luna"  # Soft
    RIVER = "River"  # Soothing
    CORAL = "Coral"  # Calm
    
    # Default
    DEFAULT = "Aoede"


class GeminiTTSService:
    """Service for converting text to speech using Gemini 2.5 TTS"""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self._initialized = False
        self.model_name = "gemini-2.5-flash-preview-tts"  # or gemini-2.5-pro-preview-tts
        
        # Voice recommendations by language
        self.language_voices = {
            "it": [GeminiVoice.KORE, GeminiVoice.LUNA, GeminiVoice.NOVA],
            "en": [GeminiVoice.PUCK, GeminiVoice.ORPHEUS, GeminiVoice.AOEDE],
            "es": [GeminiVoice.FENRIR, GeminiVoice.CORAL, GeminiVoice.RIVER],
            "fr": [GeminiVoice.ZEPHYR, GeminiVoice.PEGASUS, GeminiVoice.LUNA],
            "de": [GeminiVoice.CHARON, GeminiVoice.NOVA, GeminiVoice.ORPHEUS]
        }
    
    async def initialize(self):
        """Initialize the Gemini client"""
        if self._initialized:
            return
            
        try:
            # Configure Gemini
            genai.configure(api_key=self.settings.GOOGLE_API_KEY)
            self.client = genai.GenerativeModel(self.model_name)
            
            self._initialized = True
            logger.info("Gemini TTS client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini TTS client: {str(e)}")
            raise
    
    async def synthesize_speech(
        self,
        text: str,
        voice_name: Optional[GeminiVoice] = None,
        style_prompt: Optional[str] = None,
        language_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Convert text to speech using Gemini TTS
        
        Args:
            text: Text to synthesize
            voice_name: Specific Gemini voice to use
            style_prompt: Natural language prompt for speech style
            language_hint: Language hint (e.g., 'it', 'en')
            
        Returns:
            Audio data and metadata
        """
        try:
            await self.initialize()
            
            # Select voice if not specified
            if not voice_name:
                voice_name = self._select_voice_for_language(language_hint)
            
            # Build the prompt
            if style_prompt:
                prompt = f"{style_prompt}: {text}"
            else:
                prompt = text
            
            # Configure generation
            config = types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name.value
                        )
                    )
                )
            )
            
            # Generate audio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.generate_content(
                    contents=prompt,
                    config=config
                )
            )
            
            # Extract audio data
            if response.parts and hasattr(response.parts[0], 'data'):
                audio_data = response.parts[0].data
                
                # Decode if base64 encoded
                if isinstance(audio_data, str):
                    audio_content = base64.b64decode(audio_data)
                else:
                    audio_content = audio_data
                
                return {
                    "success": True,
                    "audio_content": audio_content,
                    "text_length": len(text),
                    "voice": voice_name.value,
                    "model": self.model_name,
                    "format": "wav",  # Gemini returns WAV format
                    "style": style_prompt
                }
            else:
                raise ValueError("No audio data in response")
                
        except Exception as e:
            logger.error(f"Gemini TTS synthesis error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "audio_content": b""
            }
    
    async def synthesize_multi_speaker(
        self,
        dialogue: List[Dict[str, str]],
        default_voice: Optional[GeminiVoice] = None
    ) -> Dict[str, Any]:
        """
        Synthesize multi-speaker dialogue
        
        Args:
            dialogue: List of speaker/text pairs
            default_voice: Default voice for unspecified speakers
            
        Returns:
            Audio data and metadata
        """
        try:
            await self.initialize()
            
            # Build multi-speaker prompt
            prompt_parts = []
            for turn in dialogue:
                speaker = turn.get("speaker", "Speaker")
                text = turn.get("text", "")
                voice = turn.get("voice", default_voice or GeminiVoice.DEFAULT)
                
                prompt_parts.append(f"{speaker} ({voice.value}): {text}")
            
            full_prompt = "\n".join(prompt_parts)
            
            # Configure generation
            config = types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig()
            )
            
            # Generate audio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.generate_content(
                    contents=full_prompt,
                    config=config
                )
            )
            
            # Extract audio data
            if response.parts and hasattr(response.parts[0], 'data'):
                audio_data = response.parts[0].data
                
                if isinstance(audio_data, str):
                    audio_content = base64.b64decode(audio_data)
                else:
                    audio_content = audio_data
                
                return {
                    "success": True,
                    "audio_content": audio_content,
                    "speakers": len(dialogue),
                    "model": self.model_name,
                    "format": "wav"
                }
            else:
                raise ValueError("No audio data in response")
                
        except Exception as e:
            logger.error(f"Multi-speaker synthesis error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "audio_content": b""
            }
    
    def _select_voice_for_language(self, language_hint: Optional[str]) -> GeminiVoice:
        """Select appropriate voice based on language"""
        if not language_hint:
            return GeminiVoice.DEFAULT
        
        # Get language code (first 2 chars)
        lang_code = language_hint[:2].lower()
        
        # Get recommended voices for language
        recommended = self.language_voices.get(lang_code, [GeminiVoice.DEFAULT])
        
        # Return first recommended voice
        return recommended[0]
    
    def get_voice_characteristics(self) -> Dict[str, str]:
        """Get voice characteristics mapping"""
        return {
            GeminiVoice.ZEPHYR.value: "Bright, energetic",
            GeminiVoice.PUCK.value: "Upbeat, cheerful",
            GeminiVoice.CHARON.value: "Dynamic, engaging",
            GeminiVoice.KORE.value: "Warm, friendly",
            GeminiVoice.FENRIR.value: "Engaging, conversational",
            GeminiVoice.AOEDE.value: "Bright, clear",
            GeminiVoice.ORPHEUS.value: "Deep, authoritative",
            GeminiVoice.PEGASUS.value: "Formal, professional",
            GeminiVoice.NOVA.value: "Professional, neutral",
            GeminiVoice.LUNA.value: "Soft, gentle",
            GeminiVoice.RIVER.value: "Soothing, calm",
            GeminiVoice.CORAL.value: "Calm, measured"
        }
    
    def get_style_prompt_examples(self) -> List[Dict[str, str]]:
        """Get example style prompts"""
        return [
            {
                "use_case": "friendly_assistant",
                "prompt": "Say warmly and helpfully",
                "example": "Say warmly and helpfully: How can I assist you today?"
            },
            {
                "use_case": "professional_report",
                "prompt": "Say professionally and clearly",
                "example": "Say professionally and clearly: The maintenance report shows..."
            },
            {
                "use_case": "urgent_alert",
                "prompt": "Say urgently with emphasis",
                "example": "Say urgently with emphasis: Critical system alert detected!"
            },
            {
                "use_case": "casual_conversation",
                "prompt": "Say casually and conversationally",
                "example": "Say casually and conversationally: Hey there! Let me help you with that."
            },
            {
                "use_case": "technical_explanation",
                "prompt": "Say clearly with measured pace",
                "example": "Say clearly with measured pace: The photovoltaic system operates by..."
            }
        ]
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages"""
        return [
            "English (US)", "Spanish", "Portuguese", "French", "German",
            "Italian", "Dutch", "Polish", "Russian", "Swedish",
            "Turkish", "Danish", "Norwegian", "Finnish", "Japanese",
            "Korean", "Mandarin Chinese", "Arabic", "Czech", "Greek",
            "Hebrew", "Hindi", "Hungarian", "Vietnamese"
        ]