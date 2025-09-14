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

    // Simulate website scraping (in production, this would use Firecrawl or similar service)
    // For now, we'll extract basic info from the URL and create mock content
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    const mockData = {
      title: `Content from ${hostname}`,
      description: `Extracted content from ${hostname}${pathname}. This comprehensive overview covers the key information and insights found on this webpage, providing valuable content that can be transformed into engaging video format.`,
      content: `This is the main content extracted from ${url}. The webpage contains important information about ${hostname}'s offerings, key features, and relevant details that visitors find valuable. This content serves as the foundation for creating compelling video narratives that capture the essence of the original webpage while presenting it in an engaging, visual format that resonates with modern audiences.`,
      images: [
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      url: url
    };

    // If projectId is provided, update the project with scraped data
    if (projectId) {
      const { error: updateError } = await supabaseClient
        .from('projects')
        .update({
          video_data: mockData,
          status: 'draft'
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project:', updateError);
      }
    }

    console.log(`Successfully scraped ${url}`);

    const response: ScrapeResponse = {
      success: true,
      data: mockData
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