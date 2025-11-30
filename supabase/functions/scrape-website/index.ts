import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  url: string;
  projectId?: string;
}

interface ScrapeResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
    content: string;
    script: string;
    images: string[];
    url: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { url, projectId }: ScrapeRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraping URL: ${url}`);

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the actual website content
    console.log('Fetching website content...');
    const websiteResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LumoraBot/1.0)'
      }
    });

    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.status}`);
    }

    const htmlContent = await websiteResponse.text();
    console.log(`Fetched ${htmlContent.length} characters from website`);

    // Use Lovable AI to extract and analyze content
    console.log('Analyzing content with AI...');
    const analysisPrompt = `Analyze this webpage HTML and extract key information for creating a promotional video. Extract:
1. Product/Service Name (title)
2. Brief Description (1-2 sentences)
3. Key Features and Benefits (main content points)
4. Generate a compelling 30-60 second video script that highlights the product/service

HTML Content (first 8000 chars):
${htmlContent.slice(0, 8000)}

Return ONLY a valid JSON object with this structure:
{
  "title": "extracted title",
  "description": "brief description",
  "content": "key features and benefits as bullet points",
  "script": "engaging video script for narration"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a content extraction expert. Extract webpage information and create video scripts. Return only valid JSON.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Payment required. Please add credits to your Lovable AI workspace in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI analysis error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const extractedData = JSON.parse(aiData.choices[0].message.content);

    console.log('Content extracted:', extractedData);

    const processedData = {
      title: extractedData.title || new URL(url).hostname,
      description: extractedData.description || 'Promotional video content',
      content: extractedData.content || '',
      script: extractedData.script || extractedData.description,
      images: [],
      url: url
    };

    // If projectId is provided, update the project with scraped data
    if (projectId) {
      const { error: updateError } = await supabaseClient
        .from('projects')
        .update({
          video_data: processedData,
          status: 'draft'
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project:', updateError);
      }
    }

    console.log(`Successfully scraped and analyzed ${url}`);

    const response: ScrapeResponse = {
      success: true,
      data: processedData
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in scrape-website function:', error);
    
    const response: ScrapeResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});