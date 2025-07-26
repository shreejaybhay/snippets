import { NextRequest } from 'next/server';
import { getUserFromToken } from '@/utils/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get token from request
    const token = req.cookies.get('authToken')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No token found' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      token 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Token retrieval error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}