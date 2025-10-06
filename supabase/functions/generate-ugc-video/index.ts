import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateUGCRequest {
  characterType: string;
  script: string;
  voiceStyle: string;
  brandColor: string;
  logoUrl?: string;
  includeWatermark: boolean;
  projectId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      characterType, 
      script, 
      voiceStyle, 
      brandColor, 
      logoUrl, 
      includeWatermark, 
      projectId 
    }: GenerateUGCRequest = await req.json();
    
    console.log('Generating UGC video for project:', projectId);
    console.log('Character type:', characterType);
    console.log('Script:', script);
    console.log('Voice style:', voiceStyle);

    if (!characterType || !script || !voiceStyle || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: characterType, script, voiceStyle, and projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!REPLICATE_API_KEY || !ELEVENLABS_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    // Step 1: Generate voiceover
    console.log('Generating voiceover...');
    
    const voiceMapping = {
      'natural-male': '21m00Tcm4TlvDq8ikWAM',
      'natural-female': 'EXAVITQu4vr4xnSDxMaL',
      'energetic': 'IKne3meq5aSn9XLyUdCD',
      'calm': 'pFZP5JQG7iQjIQuC4Bku',
      'youthful': 'IKne3meq5aSn9XLyUdCD'
    };

    const voiceId = voiceMapping[voiceStyle] || voiceMapping['natural-female'];
    
    const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: voiceStyle.includes('energetic') ? 0.8 : 0.4,
          use_speaker_boost: true
        }
      })
    });

    if (!voiceResponse.ok) {
      const error = await voiceResponse.text();
      console.error('ElevenLabs API error:', error);
      
      let errorMessage = 'Failed to generate voiceover';
      try {
        const errorJson = JSON.parse(error);
        if (voiceResponse.status === 401) {
          errorMessage = 'Invalid ElevenLabs API key. Please check your API key at https://elevenlabs.io/app/settings/api-keys';
        } else if (voiceResponse.status === 402) {
          errorMessage = 'Insufficient ElevenLabs credits. Please add credits at https://elevenlabs.io/app/subscription';
        } else if (errorJson.detail) {
          errorMessage = `ElevenLabs Error: ${errorJson.detail.message || errorJson.detail}`;
        }
      } catch {
        errorMessage = error || errorMessage;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: voiceResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBlob = await voiceResponse.arrayBuffer();
    console.log('Voiceover generated successfully');

    // Step 2: Generate video with character and script
    console.log('Generating UGC-style video...');
    
    const characterPrompts = {
      'realistic-human': 'Realistic human influencer, natural lighting, professional setup',
      'cartoon': 'Animated cartoon character, vibrant colors, fun and engaging',
      'ai-influencer': 'Modern AI-generated influencer, perfect lighting, trendy background'
    };

    const videoPrompt = `Create a UGC-style promotional video featuring a ${characterPrompts[characterType]}. 
    The character should be presenting this content: "${script}". 
    Style: Social media UGC format, engaging, authentic, with captions and emojis. 
    Brand color: ${brandColor}. Professional quality but authentic UGC feel. 
    Include dynamic text overlays and smooth transitions.`;

    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
        input: {
          prompt: videoPrompt,
          num_frames: 120,
          num_inference_steps: 20,
          width: 1080,
          height: 1920, // 9:16 aspect ratio for social media
          fps: 8
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate API error:', errorText);
      
      let errorMessage = 'Failed to start video generation';
      try {
        const errorJson = JSON.parse(errorText);
        if (replicateResponse.status === 402) {
          errorMessage = 'Insufficient Replicate API credits. Please add credits at https://replicate.com/account/billing';
        } else {
          errorMessage = errorJson.detail || errorJson.title || errorMessage;
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: replicateResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const predictionData = await replicateResponse.json();
    console.log('Video generation started:', predictionData.id);

    // Step 3: Poll for completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60;

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionData.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('Generation status:', statusData.status);
        
        if (statusData.status === 'succeeded' && statusData.output) {
          videoUrl = Array.isArray(statusData.output) ? statusData.output[0] : statusData.output;
          console.log('UGC video generated successfully:', videoUrl);
          break;
        } else if (statusData.status === 'failed') {
          throw new Error('Video generation failed');
        }
      }
      
      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
        voiceoverGenerated: true,
        generatedAt: new Date().toISOString(),
        characterType,
        script,
        voiceStyle,
        brandColor
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ugc-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate UGC video',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});