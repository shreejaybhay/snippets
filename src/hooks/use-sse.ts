import { useEffect, useState } from 'react';

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      // Create EventSource with credentials
      eventSource = new EventSource(url, { 
        withCredentials: true 
      });

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          if (parsedData.type === 'connected') {
            console.log('SSE connected successfully');
            return;
          }
          setData(parsedData);
          setError(null);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = () => {
        setError(new Error('Connection lost'));
        
        if (eventSource) {
          eventSource.close();
        }

        if (retryCount < maxRetries) {
          retryCount++;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`Retrying connection in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
          retryTimeout = setTimeout(connect, retryDelay);
        } else {
          console.log('Max retry attempts reached');
        }
      };

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        retryCount = 0;
        setError(null);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [url]);

  return { data, error };
}
