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

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
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

    // Use OpenAI to extract and analyze content
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

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a content extraction expert. Extract webpage information and create video scripts. Return only valid JSON.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      
      let errorMessage = 'Failed to analyze content with AI';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.code === 'insufficient_quota') {
          errorMessage = 'OpenAI API quota exceeded. Please add credits at https://platform.openai.com/account/billing';
        } else if (errorData.error?.message) {
          errorMessage = `OpenAI Error: ${errorData.error.message}`;
        }
      } catch {
        // If we can't parse the error, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const openaiData = await openaiResponse.json();
    const extractedData = JSON.parse(openaiData.choices[0].message.content);

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