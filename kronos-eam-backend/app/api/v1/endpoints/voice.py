"""
Voice Features endpoints for speech-to-text and text-to-speech
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import io

from app.api.deps import get_current_active_user, get_tenant_db
from app.schemas.auth import TokenData
from app.services.voice.voice_service import voice_service, TTSProvider
from app.services.agent_service import AgentType
from app.services.voice.gemini_tts import GeminiVoice
from app.services.voice.text_to_speech import VoiceGender, AudioEncoding

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language_code: Optional[str] = Form(None),
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Transcribe audio to text using STT
    
    - **audio**: Audio file (WAV, MP3)
    - **language_code**: Language hint (e.g., 'it-IT', 'en-US')
    """
    try:
        # Read audio data
        audio_data = await audio.read()
        
        # Get file extension
        file_ext = audio.filename.split('.')[-1].lower()
        if file_ext not in ['wav', 'mp3', 'ogg', 'webm']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported audio format: {file_ext}"
            )
        
        # Transcribe
        result = await voice_service.stt_service.transcribe_audio(
            audio_data=audio_data,
            language_code=language_code,
            format=file_ext
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Transcription failed")
            )
        
        return {
            "transcript": result["transcript"],
            "language": result.get("language", "unknown"),
            "confidence": result.get("confidence", 0),
            "duration": result.get("duration", 0),
            "model": result.get("model", "unknown")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription error: {str(e)}"
        )


@router.post("/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    language_code: Optional[str] = Form("it-IT"),
    provider: Optional[TTSProvider] = Form(TTSProvider.AUTO),
    voice_name: Optional[str] = Form(None),
    voice_style: Optional[str] = Form(None),
    audio_format: Optional[str] = Form("mp3"),
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Synthesize text to speech
    
    - **text**: Text to convert to speech
    - **language_code**: Language code (e.g., 'it-IT', 'en-US')
    - **provider**: TTS provider (gemini, google_cloud, auto)
    - **voice_name**: Specific voice name
    - **voice_style**: Style prompt for Gemini (e.g., 'Say cheerfully')
    - **audio_format**: Output format (mp3, wav, ogg)
    """
    try:
        # Validate audio format
        if audio_format not in ['mp3', 'wav', 'ogg']:
            audio_format = 'mp3'
        
        # Convert voice name to appropriate type
        gemini_voice = None
        if voice_name and provider == TTSProvider.GEMINI:
            try:
                gemini_voice = GeminiVoice(voice_name)
            except:
                pass
        
        # Synthesize
        result = await voice_service.synthesize_response(
            text=text,
            language_code=language_code,
            provider=provider,
            voice_style=voice_style,
            voice_name=gemini_voice or voice_name
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Synthesis failed")
            )
        
        # Return audio as streaming response
        audio_content = result["audio_content"]
        
        return StreamingResponse(
            io.BytesIO(audio_content),
            media_type=f"audio/{audio_format}",
            headers={
                "Content-Disposition": f"attachment; filename=speech.{audio_format}",
                "X-Voice": result.get("voice", "unknown"),
                "X-Provider": result.get("provider", "unknown")
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Synthesis error: {str(e)}"
        )


@router.post("/voice-chat")
async def voice_chat(
    audio: UploadFile = File(...),
    language_code: Optional[str] = Form(None),
    agent_type: Optional[AgentType] = Form(None),
    tts_provider: Optional[TTSProvider] = Form(TTSProvider.AUTO),
    voice_style: Optional[str] = Form(None),
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Complete voice interaction with AI agent
    
    - **audio**: Audio file with user's speech
    - **language_code**: Language code
    - **agent_type**: Specific agent to use
    - **tts_provider**: TTS provider for response
    - **voice_style**: Voice style for response
    """
    try:
        # Read audio data
        audio_data = await audio.read()
        
        # Process voice query
        result = await voice_service.process_voice_query(
            audio_data=audio_data,
            tenant_id=current_user.tenant_id,
            user_id=current_user.sub,
            language_code=language_code,
            agent_type=agent_type,
            tts_provider=tts_provider,
            voice_style=voice_style
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Voice chat failed")
            )
        
        # Return audio response with metadata
        return StreamingResponse(
            io.BytesIO(result["audio_response"]),
            media_type="audio/mp3",
            headers={
                "Content-Disposition": "attachment; filename=response.mp3",
                "X-Transcript": result.get("transcript", ""),
                "X-Response-Text": result.get("response_text", ""),
                "X-Agent-Type": result.get("agent_type", "unknown"),
                "X-Language": result.get("language", "unknown")
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice chat error: {str(e)}"
        )


@router.get("/voices")
async def list_available_voices(
    provider: Optional[TTSProvider] = TTSProvider.AUTO,
    language_code: Optional[str] = None,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Get list of available voices"""
    try:
        voices = {
            "gemini": [],
            "google_cloud": []
        }
        
        # Get Gemini voices
        if provider in [TTSProvider.GEMINI, TTSProvider.AUTO]:
            gemini_voices = voice_service.tts_gemini.get_voice_characteristics()
            voices["gemini"] = [
                {
                    "name": voice,
                    "characteristics": desc,
                    "provider": "gemini"
                }
                for voice, desc in gemini_voices.items()
            ]
        
        # Get Google Cloud voices
        if provider in [TTSProvider.GOOGLE_CLOUD, TTSProvider.AUTO]:
            cloud_voices = await voice_service.tts_google.list_voices(language_code)
            voices["google_cloud"] = cloud_voices
        
        return {
            "voices": voices,
            "total": len(voices["gemini"]) + len(voices["google_cloud"])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing voices: {str(e)}"
        )


@router.get("/languages")
async def get_supported_languages(
    current_user: TokenData = Depends(get_current_active_user)
):
    """Get supported languages for STT and TTS"""
    return {
        "stt_languages": voice_service.stt_service.get_supported_languages(),
        "tts_languages": {
            "gemini": voice_service.tts_gemini.get_supported_languages(),
            "google_cloud": [
                {"code": "it-IT", "name": "Italian"},
                {"code": "en-US", "name": "English (US)"},
                {"code": "en-GB", "name": "English (UK)"},
                {"code": "es-ES", "name": "Spanish"},
                {"code": "fr-FR", "name": "French"},
                {"code": "de-DE", "name": "German"},
                {"code": "pt-PT", "name": "Portuguese"},
                {"code": "nl-NL", "name": "Dutch"},
                {"code": "pl-PL", "name": "Polish"},
                {"code": "ru-RU", "name": "Russian"}
            ]
        }
    }


@router.get("/capabilities")
async def check_voice_capabilities(
    current_user: TokenData = Depends(get_current_active_user)
):
    """Check voice capabilities and requirements"""
    # Test capabilities
    test_results = await voice_service.test_voice_capabilities()
    
    # Get requirements
    requirements = voice_service.is_smartphone_required()
    
    return {
        "capabilities": test_results,
        "requirements": requirements,
        "recommendations": {
            "browser": "Use modern browsers with HTTPS for best experience",
            "mobile_app": "Optional for enhanced features",
            "microphone": "High-quality microphone recommended"
        }
    }


@router.get("/style-examples")
async def get_voice_style_examples(
    current_user: TokenData = Depends(get_current_active_user)
):
    """Get examples of voice style prompts for Gemini TTS"""
    return {
        "examples": voice_service.tts_gemini.get_style_prompt_examples(),
        "usage": "Use these style prompts with Gemini TTS for different voice styles"
    }