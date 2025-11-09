import type {Route} from './+types/api.get-messages';

// In-memory storage for chat messages (in production, use a database)
const chatStorage = new Map<string, Array<{id: string; role: string; content: string}>>();

export async function action({request}: Route.ActionArgs) {
  try {
    const body = await request.json();
    const {chatId} = body;

    if (!chatId) {
      return new Response(
        JSON.stringify({error: 'Chat ID is required'}),
        {
          status: 400,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    // Get messages from storage (in production, fetch from database)
    const messages = chatStorage.get(String(chatId)) || [];

    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('Error in get-messages API:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while fetching messages',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }
}

// Export storage for saving messages (in production, use a database)
export {chatStorage};

