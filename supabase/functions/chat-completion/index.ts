
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  getRunStatus, 
  getMessages, 
  runAssistantStream
} from "./utils/openAI.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { cleanResponse, containsNonContractContent } from "./utils/validation.ts";
import { withRetry } from "./utils/retryUtils.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.time('serverResponse')
    // Parse the request body
    const { content, subscriptionPlan, conversationId, assistantId, priority, stream, retryCount = 1 } = await req.json();
    
    console.log('[chat-completion]: Request received for chat completion');
    console.log('[chat-completion]: Content length:', content?.length || 0);
    console.log('[chat-completion]: Assistant ID:', assistantId || 'default');
    console.log('[chat-completion]: Conversation ID:', conversationId)
    console.log('[chat-completion]: Priority request:', priority ? 'Yes' : 'No');
    console.log('[chat-completion]: Streaming enabled:', stream ? 'Yes' : 'No');
    console.log('[chat-completion]: Retry count:', retryCount);

    // Check if content appears to be non-contract related
    if (containsNonContractContent(content)) {
      console.log('[chat-completion]: Content appears to be non-contract related. Providing guidance response.');
      return new Response(JSON.stringify({ 
        response: "I'm designed to answer questions about your union contract. Please ask a question related to your contract's terms, policies, or provisions, and I'll provide specific information with references to the relevant sections."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Max retries for all OpenAI operations
    const maxRetries = Math.min(5, retryCount + 2); // Base + client-requested retries, capped at 5
    
    // fetch conversation for the purpose of getting context
    // Get user profile for subscription info
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    // Check for fetch error from db
    if (conversationError) {
      console.log(`[chat-completion]: failed to fetch conversation`);
      console.log(conversationError)
      return new Response(JSON.stringify({ 
        response: "Something wrong with conversation, please with a new one"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let threadId = conversation.thread_id;
    if(!threadId) {
      // Create a thread with retry
      const thread = await withRetry(() => createThread(), {
        maxRetries,
        initialDelay: 300 // Reduced initial delay for faster first attempt
      });
      threadId = thread.id
      console.log(`[chat-completion]: Thread created: ${threadId}`);
      
      // update thread id
      await supabase.from("conversations")
      .update({ thread_id: threadId })
      .eq("id", conversationId);
    }

    console.log(`[chat-completion]: going to use thread: ${threadId}`);
    // Add message to thread with retry
    await withRetry(() => addMessageToThread(threadId, content), {
      maxRetries,
      initialDelay: 300
    });
    console.log('[chat-completion]: Message added to thread');
    console.log('[chat-completion]: we are on the stream block, let see how far we go')
    const assistantStream = await runAssistantStream({
      threadId: threadId,
      assistantId: assistantId,
    });
    console.timeEnd('serverResponse')
    return new Response(assistantStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[chat-completion]: Error in chat-completion function:', error);
    
    let errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";
    let statusCode = 500;
    
    // More specific error messages based on error type
    if (error.message?.includes('timeout')) {
      errorMessage = "The request took too long to process. Please try a shorter or simpler question.";
    } else if (error.message?.includes('rate limit')) {
      errorMessage = "Our service is experiencing high demand. Please try again in a few moments.";
      statusCode = 429;
    }
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
        response: errorMessage
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
