import { NextRequest } from "next/server";
import { getUserFromToken } from "@/utils/auth";

interface Client {
  userId: string;
  controller: ReadableStreamDefaultController;
}

const clients = new Set<Client>();

export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);
  if (!user || typeof user === "object" && "status" in user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user._id.toString();
  const stream = new ReadableStream({
    start(controller) {
      // Add new client
      const client = { userId, controller };
      clients.add(client);

      // Send initial connection message
      const connectMessage = { type: 'connected', timestamp: new Date().toISOString() };
      try {
        controller.enqueue(`data: ${JSON.stringify(connectMessage)}\n\n`);
      } catch (error) {
        console.error('Error sending initial message:', error);
      }

      // Remove client when connection closes
      request.signal.addEventListener('abort', () => {
        clients.delete(client);
      });
    },
    cancel() {
      // Clean up on stream cancel
      clients.forEach(client => {
        if (client.userId === userId) {
          clients.delete(client);
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export function broadcast(data: any, targetUserId: string) {
  const activeClients = new Set<Client>();

  // First, validate all clients and build a set of active ones
  clients.forEach(client => {
    try {
      // Test if controller is still valid
      if (client.controller.desiredSize === null) {
        clients.delete(client);
        return;
      }
      activeClients.add(client);
    } catch (error) {
      console.error('Client validation error:', error);
      clients.delete(client);
    }
  });

  // Then, broadcast to active clients
  activeClients.forEach(client => {
    if (client.userId === targetUserId) {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        client.controller.enqueue(message);
      } catch (error) {
        console.error('Broadcast error:', error);
        clients.delete(client);
      }
    }
  });
}

// Optional: Periodic cleanup of stale connections
setInterval(() => {
  clients.forEach(client => {
    try {
      if (client.controller.desiredSize === null) {
        clients.delete(client);
      }
    } catch (error) {
      clients.delete(client);
    }
  });
}, 30000); // Run every 30 seconds
