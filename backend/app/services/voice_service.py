import os
import uuid
import logging
from gtts import gTTS

logger = logging.getLogger("voice_service")

# Define path for storing generated audio files
STATIC_AUDIO_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    "static", 
    "audios"
)

def text_to_speech(text: str) -> str:
    """
    Synthesizes speech from a text block and saves it as an MP3.
    Returns the relative URL path of the static audio resource.
    """
    # Ensure static directory exists
    os.makedirs(STATIC_AUDIO_DIR, exist_ok=True)
    
    # Clean text to prevent gTTS crashes on blank or extremely long text blocks
    clean_text = text.strip()
    if not clean_text:
        clean_text = "No response content to read."
        
    # Limit speech synthesis length for performance
    if len(clean_text) > 400:
        clean_text = clean_text[:400] + "... and so on."
        
    filename = f"{uuid.uuid4()}.mp3"
    file_path = os.path.join(STATIC_AUDIO_DIR, filename)
    
    try:
        logger.info(f"Synthesizing audio file: {filename}")
        tts = gTTS(text=clean_text, lang='en', slow=False)
        tts.save(file_path)
        logger.info(f"Successfully generated voice at {file_path}")
        
        # Return public stream path
        return f"/static/audios/{filename}"
    except Exception as e:
        logger.error(f"Text-to-speech rendering failed: {e}")
        # Return fallback silent audio path or empty string
        return ""
