import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Scene {
  text: string;
  visuals: string;
  style: string;
  duration?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scene, sceneIndex }: { scene: Scene; sceneIndex: number } = await req.json();
    
    if (!scene) {
      return new Response(
        JSON.stringify({ error: "Scene data is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "Replicate API key not configured. Please add it in Supabase Secrets." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct a detailed prompt for video generation
    const videoPrompt = `${scene.visuals}. ${scene.style} style. High quality, cinematic, ${scene.duration || 5} seconds.`;
    
    console.log(`Generating video for scene ${sceneIndex}:`, videoPrompt);

    // Start video generation with Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "e047b1d734c550671fb4de7f7df7f9341ed498b4aa7cd88b82533b60dfec33e3",
        input: {
          prompt: videoPrompt,
          num_frames: Math.min((scene.duration || 5) * 8, 49),
          num_inference_steps: 50,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Replicate rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid Replicate API key. Please update your API key in Supabase Secrets." }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (errorText.includes('insufficient_quota') || errorText.includes('billing')) {
        return new Response(
          JSON.stringify({ 
            error: "Insufficient Replicate credits. Please add credits to your Replicate account." 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Replicate API error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prediction = await response.json();
    console.log('Video generation started:', prediction.id);

    return new Response(
      JSON.stringify({
        predictionId: prediction.id,
        status: prediction.status,
        sceneIndex,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-scene-video function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
