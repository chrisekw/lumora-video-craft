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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: Analyze the sample video using Lovable AI
    console.log('Analyzing sample video style with Lovable AI...');
    
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
                text: 'Please analyze the style of this video and provide a detailed description.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: sampleVideoUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.text();
      console.error('Lovable AI analysis error:', error);
      
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits in Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Failed to analyze video style: ${error}`);
    }

    const analysisData = await analysisResponse.json();
    const styleDescription = analysisData.choices[0].message.content;
    console.log('Style analysis completed');

    // Step 2: Generate new video with the analyzed style
    console.log('Generating new video with cloned style...');
    
    const videoPrompt = `Create a video frame matching this style: ${styleDescription}. 
    Content: "${contentText}". 
    Resolution: ${resolution}, Aspect ratio: ${aspectRatio}. 
    High quality, professional, engaging video with the same visual style and aesthetic.`;

    const videoResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: videoPrompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!videoResponse.ok) {
      const error = await videoResponse.text();
      console.error('Video generation error:', error);
      throw new Error(`Failed to generate video: ${error}`);
    }

    const videoData = await videoResponse.json();
    const videoUrl = videoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!videoUrl) {
      throw new Error('No video generated');
    }

    console.log('Video cloned successfully');

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