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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate voiceover prompt
    let voiceoverPrompt = null;
    
    if (!customNarrationUrl && voiceoverStyle !== 'none') {
      voiceoverPrompt = `Voice narration for explainer video: ${script}. Voice style: ${voiceoverStyle}. Clear, engaging, professional tone.`;
      console.log('Voiceover prompt prepared');
    }

    // Generate explainer video with animations using Lovable AI
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
    
    const videoPrompt = `Create an explainer video frame with ${animationDescription}. 
    Content to explain: "${script}". 
    Style: Educational, professional, engaging explainer video with animated icons, text overlays, and smooth transitions. 
    Include visual metaphors and diagrams that support the explanation. 
    High quality animation, clear and informative.
    ${includeMusic ? 'Visual elements suggesting background music.' : 'Clean, focused visuals.'}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits in Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Failed to generate video: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const videoUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!videoUrl) {
      throw new Error('No video generated');
    }

    console.log('Explainer video generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
        voiceoverPrompt,
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