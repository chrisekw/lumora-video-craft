import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloneVideoRequest {
  sampleVideoUrl: string;
  contentText: string;
  logoUrl?: string;
  clipUrl?: string;
  resolution: string;
  aspectRatio: string;
  projectId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sampleVideoUrl, 
      contentText, 
      logoUrl, 
      clipUrl, 
      resolution, 
      aspectRatio, 
      projectId 
    }: CloneVideoRequest = await req.json();
    
    console.log('Cloning video style for project:', projectId);
    console.log('Sample video URL:', sampleVideoUrl);
    console.log('Content text:', contentText);

    if (!sampleVideoUrl || !contentText || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sampleVideoUrl, contentText, and projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    
    if (!OPENAI_API_KEY || !REPLICATE_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    // Step 1: Analyze the sample video using OpenAI Vision API
    console.log('Analyzing sample video style...');
    
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Analyze this video and describe its visual style, pacing, transitions, color scheme, typography, and overall aesthetic in detail. Focus on elements that can be replicated.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze the style of this video and provide a detailed description that can be used to create similar content.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: sampleVideoUrl
                }
              }
            ]
          }
        ],
        max_completion_tokens: 500
      })
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.text();
      console.error('OpenAI analysis error:', error);
      throw new Error(`Failed to analyze video style: ${error}`);
    }

    const analysisData = await analysisResponse.json();
    const styleDescription = analysisData.choices[0].message.content;
    console.log('Style analysis completed:', styleDescription);

    // Step 2: Generate new video with the analyzed style
    console.log('Generating new video with cloned style...');
    
    const dimensions = resolution === '4K' ? { width: 3840, height: 2160 } :
                     resolution === '1080p' ? { width: 1920, height: 1080 } :
                     { width: 1280, height: 720 };

    if (aspectRatio === '1:1') {
      dimensions.width = dimensions.height;
    } else if (aspectRatio === '9:16') {
      const temp = dimensions.width;
      dimensions.width = Math.round(dimensions.height * 9 / 16);
      dimensions.height = temp;
    }

    const videoPrompt = `Create a video with this content: "${contentText}". 
    Style requirements based on analysis: ${styleDescription}. 
    Resolution: ${resolution}, Aspect ratio: ${aspectRatio}. 
    High quality, professional, engaging video with the same visual style and pacing.`;

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
          num_inference_steps: 25,
          width: dimensions.width,
          height: dimensions.height,
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
    const maxAttempts = 72; // 6 minutes max

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
          console.log('Video cloned successfully:', videoUrl);
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
        styleAnalysis: styleDescription,
        generatedAt: new Date().toISOString(),
        resolution,
        aspectRatio,
        contentText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in clone-video-style function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to clone video style',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});