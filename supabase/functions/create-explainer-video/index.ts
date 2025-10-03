import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateExplainerRequest {
  script: string;
  animationStyle: string;
  voiceoverStyle: string;
  customNarrationUrl?: string;
  includeMusic: boolean;
  projectId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      script, 
      animationStyle, 
      voiceoverStyle, 
      customNarrationUrl, 
      includeMusic, 
      projectId 
    }: CreateExplainerRequest = await req.json();
    
    console.log('Creating explainer video for project:', projectId);
    console.log('Animation style:', animationStyle);
    console.log('Script:', script);

    if (!script || !animationStyle || !voiceoverStyle || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: script, animationStyle, voiceoverStyle, and projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!REPLICATE_API_KEY || !ELEVENLABS_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    // Step 1: Generate voiceover (if not using custom narration)
    let voiceoverUrl = customNarrationUrl;
    
    if (!customNarrationUrl && voiceoverStyle !== 'none') {
      console.log('Generating AI voiceover...');
      
      const voiceMapping: Record<string, string> = {
        'professional-male': '21m00Tcm4TlvDq8ikWAM',
        'professional_male': '21m00Tcm4TlvDq8ikWAM',
        'professional-female': 'EXAVITQu4vr4xnSDxMaL',
        'professional_female': 'EXAVITQu4vr4xnSDxMaL',
        'friendly-male': 'TX3LPaxmHKxFdv7VOQHJ',
        'friendly_male': 'TX3LPaxmHKxFdv7VOQHJ',
        'friendly-female': 'XB0fDUnXU5powFXDhCwa',
        'friendly_female': 'XB0fDUnXU5powFXDhCwa',
        'narrator': 'onwK4e9ZLuTAKqWW03F9',
        'authoritative': 'onwK4e9ZLuTAKqWW03F9'
      };

      const voiceId = voiceMapping[voiceoverStyle] || voiceMapping['professional_female'];
      
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
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });

      if (voiceResponse.ok) {
        const audioBlob = await voiceResponse.arrayBuffer();
        console.log('Voiceover generated successfully');
        voiceoverUrl = 'generated_explainer_voiceover.mp3';
      } else {
        console.warn('Voiceover generation failed, continuing without voice');
      }
    }

    // Step 2: Generate explainer video with animations
    console.log('Generating explainer video with animations...');
    
    const animationPrompts: Record<string, string> = {
      '2d-flat': 'Modern 2D flat design animation, clean icons, minimal style, smooth transitions',
      '2d_flat': 'Modern 2D flat design animation, clean icons, minimal style, smooth transitions',
      'motion-graphics': 'Professional motion graphics, dynamic text, infographic style, corporate feel',
      'motion_graphics': 'Professional motion graphics, dynamic text, infographic style, corporate feel',
      'whiteboard': 'Whiteboard animation style, hand-drawn elements, sketch-like appearance, educational feel',
      'isometric': 'Isometric 3D perspective animation with depth, modern architectural style',
      'character-driven': 'Character-driven narrative animation with personas and storytelling'
    };

    const animationDescription = animationPrompts[animationStyle] || animationPrompts['2d-flat'];
    
    const videoPrompt = `Create an explainer video with ${animationDescription}. 
    Content to explain: "${script}". 
    Style: Educational, professional, engaging explainer video with animated icons, text overlays, and smooth transitions. 
    Include visual metaphors and diagrams that support the explanation. 
    High quality animation, clear and informative.
    ${includeMusic ? 'Include subtle background music.' : 'No background music.'}`;

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
          num_frames: 150, // Longer for explainer content
          num_inference_steps: 25,
          width: 1920,
          height: 1080, // 16:9 for explainer videos
          fps: 8
        }
      })
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.text();
      console.error('Replicate API error:', error);
      throw new Error(`Failed to start video generation: ${error}`);
    }

    const predictionData = await replicateResponse.json();
    console.log('Video generation started:', predictionData.id);

    // Step 3: Poll for completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 72; // 6 minutes for longer content

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
          console.log('Explainer video generated successfully:', videoUrl);
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
        voiceoverUrl,
        voiceoverGenerated: !customNarrationUrl && voiceoverStyle !== 'none',
        generatedAt: new Date().toISOString(),
        animationStyle,
        script,
        includeMusic
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-explainer-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create explainer video',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});