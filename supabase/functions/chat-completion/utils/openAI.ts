const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');

if (!openAIApiKey || !assistantId) {
  throw new Error('Required OpenAI environment variables are not set');
}

export async function createThread() {
  console.log('Creating thread...');
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Thread creation failed:', errorData);
    throw new Error(`Failed to create thread: ${errorData}`);
  }

  return await response.json();
}

export async function addMessageToThread(threadId: string, content: string) {
  console.log('Adding message to thread...');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      role: 'user',
      content: content
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Message creation failed:', errorData);
    throw new Error('Failed to add message to thread');
  }

  return await response.json();
}

export async function runAssistant(threadId: string) {
  console.log('Running assistant...');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      instructions: `You are a union contract expert. When answering questions, you must:
      1. Only answer questions directly related to union contract terms, policies, or provisions
      2. Include specific references from the contract in this exact format:
         [REF]Section X.X, Page Y: Exact quote from contract[/REF]
      3. If no specific reference exists, clearly state this
      4. If the question is not related to the contract, politely redirect the user to focus on contract-related topics
      5. Keep responses focused and accurate
      6. Format all contract references consistently using the [REF] tags`
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Run creation failed:', errorData);
    throw new Error('Failed to run assistant');
  }

  return await response.json();
}

export async function getRunStatus(threadId: string, runId: string) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
    {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    }
  );
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Status check failed:', errorData);
    throw new Error('Failed to check run status');
  }
  
  return await response.json();
}

export async function getMessages(threadId: string) {
  console.log('Retrieving messages...');
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/messages`,
    {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Messages retrieval failed:', errorData);
    throw new Error('Failed to retrieve messages');
  }

  return await response.json();
}