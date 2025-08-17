import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { buildApiUrl } from './api-config';
import { offlineStorage } from './offline-storage';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Check if we're in offline mode (mobile app without server)
const isOfflineMode = () => {
  return !!(window as any).Capacitor;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use offline storage in mobile app
  if (isOfflineMode()) {
    console.log(`OFFLINE ${method} ${url}`, data);
    return handleOfflineRequest(method, url, data);
  }

  const fullUrl = buildApiUrl(url);
  console.log(`${method} ${fullUrl}`, data);

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log("API Response:", res.status, res.statusText);
  await throwIfResNotOk(res);
  return res;
}

async function handleOfflineRequest(method: string, url: string, data?: unknown): Promise<Response> {
  try {
    let result: any;
    
    if (url === '/api/categories' && method === 'GET') {
      result = await offlineStorage.getCategories();
    } else if (url === '/api/categories' && method === 'POST') {
      result = await offlineStorage.createCategory(data as any);
    } else if (url === '/api/transactions' && method === 'GET') {
      result = await offlineStorage.getTransactions();
    } else if (url === '/api/transactions' && method === 'POST') {
      result = await offlineStorage.createTransaction(data as any);
    } else if (url.startsWith('/api/transactions/') && method === 'PUT') {
      const id = url.split('/').pop();
      result = await offlineStorage.updateTransaction(id!, data as any);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Transaction not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else if (url.startsWith('/api/transactions/') && method === 'DELETE') {
      const id = url.split('/').pop();
      const success = await offlineStorage.deleteTransaction(id!);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Transaction not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      result = { success: true };
    } else if (url === '/api/dashboard' && method === 'GET') {
      result = await offlineStorage.getDashboard();
    } else if (url === '/api/budgets' && method === 'GET') {
      // Parse query parameters for month and year
      const urlObj = new URL(url, 'http://localhost');
      const month = urlObj.searchParams.get('month');
      const year = urlObj.searchParams.get('year');
      result = await offlineStorage.getBudgets(
        month ? parseInt(month) : undefined,
        year ? parseInt(year) : undefined
      );
    } else if (url === '/api/budgets' && method === 'POST') {
      result = await offlineStorage.createBudget(data as any);
    } else if (url.startsWith('/api/budgets/') && method === 'DELETE') {
      const id = url.split('/').pop();
      const success = await offlineStorage.deleteBudget(id!);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Budget not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      result = { success: true };
    } else if (url.startsWith('/api/categories/') && method === 'DELETE') {
      const id = url.split('/').pop();
      const success = await offlineStorage.deleteCategory(id!);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Category not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      result = { success: true };
    } else if (url === '/api/goals' && method === 'GET') {
      result = await offlineStorage.getGoals();
    } else if (url === '/api/goals' && method === 'POST') {
      result = await offlineStorage.createGoal(data as any);
    } else if (url.startsWith('/api/goals/') && method === 'PATCH') {
      const id = url.split('/').pop();
      result = await offlineStorage.updateGoal(id!, data as any);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Goal not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else if (url.startsWith('/api/goals/') && method === 'DELETE') {
      const id = url.split('/').pop();
      const success = await offlineStorage.deleteGoal(id!);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Goal not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      result = { success: true };
    } else {
      throw new Error(`Offline mode: ${method} ${url} not supported`);
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Offline request error:', error);
    return new Response(JSON.stringify({ error: 'Offline request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = Array.isArray(queryKey) ? queryKey.join("/") : String(queryKey);
    
    // Use offline storage in mobile app
    if (isOfflineMode()) {
      console.log("OFFLINE Fetching:", path, "QueryKey:", queryKey);
      return await handleOfflineQuery(path, queryKey);
    }

    const url = buildApiUrl(path);
    console.log("Fetching:", url);
    
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Response status:", res.status);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log("Response data:", data);
    return data;
  };

async function handleOfflineQuery(path: string, queryKey?: any): Promise<any> {
  if (path === '/api/categories') {
    return await offlineStorage.getCategories();
  } else if (path === '/api/transactions') {
    return await offlineStorage.getTransactions();
  } else if (path === '/api/dashboard') {
    return await offlineStorage.getDashboard();
  } else if (path.startsWith('/api/budgets')) {
    // For budgets, use queryKey parameters if available
    let month: number | undefined;
    let year: number | undefined;
    
    if (Array.isArray(queryKey) && queryKey.length >= 3) {
      month = queryKey[1];
      year = queryKey[2];
    }
    
    console.log("Getting budgets with month:", month, "year:", year);
    return await offlineStorage.getBudgets(month, year);
  } else if (path === '/api/goals') {
    return await offlineStorage.getGoals();
  } else {
    throw new Error(`Offline mode: ${path} not supported`);
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
