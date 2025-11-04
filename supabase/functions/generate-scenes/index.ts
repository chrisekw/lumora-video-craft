import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateScenesRequest {
  prompt?: string;
  script?: string;
}

interface Scene {
  text: string;
  visuals: string;
  style: string;
  duration?: number;
}

interface ScenesResponse {
  title: string;
  scenes: Scene[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, script }: GenerateScenesRequest = await req.json();
    
    if (!prompt && !script) {
      return new Response(
        JSON.stringify({ error: "Either prompt or script is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured. Please add it in Supabase Secrets." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userContent = script || prompt;
    
    console.log('Generating scenes for:', userContent?.substring(0, 100));

    const systemPrompt = `You are a professional video editor and script writer. Your job is to analyze text and break it down into logical video scenes optimized for TikTok-style short-form content.

For each scene, provide:
1. "text": The dialogue or narration for this scene
2. "visuals": A detailed description of what should be shown visually
3. "style": The mood/tone (e.g., "energetic", "calm", "motivational", "dramatic")
4. "duration": Estimated duration in seconds (typically 3-8 seconds per scene)

Rules:
- Each scene should be 3-8 seconds long
- Keep scenes punchy and engaging
- Include clear visual descriptions
- Match the style to the content tone
- Total video should be 30-60 seconds

Return ONLY valid JSON in this exact format:
{
  "title": "Video title",
  "scenes": [
    {
      "text": "Scene narration",
      "visuals": "Visual description",
      "style": "mood/tone",
      "duration": 5
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: script ? `Split this script into scenes:\n\n${script}` : `Generate a video script and split it into scenes for this prompt:\n\n${prompt}` }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "OpenAI rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid OpenAI API key. Please update your API key in Supabase Secrets." }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (errorText.includes('insufficient_quota')) {
        return new Response(
          JSON.stringify({ 
            error: "Insufficient OpenAI credits. Please add credits to your OpenAI account at https://platform.openai.com/account/billing" 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const scenesData = JSON.parse(data.choices[0].message.content) as ScenesResponse;
    
    console.log('Generated scenes:', JSON.stringify(scenesData, null, 2));

    return new Response(
      JSON.stringify(scenesData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-scenes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
