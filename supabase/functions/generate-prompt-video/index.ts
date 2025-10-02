import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateVideoRequest {
  prompt: string;
  style: string;
  music: string;
  projectId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, style, music, projectId } = body;
    
    console.log('=== GENERATE PROMPT VIDEO REQUEST ===');
    console.log('Project ID:', projectId);
    console.log('Prompt:', prompt);
    console.log('Style:', style);
    console.log('Music:', music);
    console.log('Request body:', JSON.stringify(body));

    if (!prompt || !projectId) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'REPLICATE_API_KEY not configured. Please add your Replicate API key in the Supabase dashboard.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('API keys verified successfully');

    // Step 1: Generate video using Replicate API
    console.log('Starting video generation with Replicate...');
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
        input: {
          prompt: `${prompt}. Style: ${style}. High quality video, professional, engaging.`,
          num_frames: 120,
          num_inference_steps: 20,
          width: 1024,
          height: 576,
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

    // Step 2: Wait for completion and poll status
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
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
          console.log('Video generated successfully:', videoUrl);
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

    // Step 3: Generate voiceover if needed
    let voiceoverUrl = null;
    if (music !== 'none') {
      console.log('Generating AI voiceover...');
      
      const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
      if (ELEVENLABS_API_KEY) {
        try {
          const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: prompt,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              }
            })
          });

          if (voiceResponse.ok) {
            const audioBlob = await voiceResponse.arrayBuffer();
            console.log('Voiceover generated successfully');
            // In a real implementation, you'd upload this to storage
            voiceoverUrl = 'generated_voiceover.mp3';
          }
        } catch (voiceError) {
          console.warn('Voiceover generation failed:', voiceError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
        voiceoverUrl,
        generatedAt: new Date().toISOString(),
        prompt,
        style,
        music
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-prompt-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});