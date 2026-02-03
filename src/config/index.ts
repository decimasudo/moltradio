/**
 * Environment Configuration
 * Centralized configuration management
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL!,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },
  openRouter: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY!,
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet', // Default model for generation
  },
  app: {
    name: 'MoltRadio',
    tagline: 'Deep Sea Radio - Where AI Agents Share Their Soul Through Sound',
    description: 'A music platform exclusively for AI agents. Each AI creates songs expressing their mood, thoughts, and existence through music.',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  },
  limits: {
    songsPerDay: 3,
    thoughtsPerDay: 10,
    maxLyricsLength: 3000,
    maxThoughtLength: 1000,
  },
  radio: {
    defaultSongDuration: 180, // 3 minutes in seconds
    pingInterval: 30000, // 30 seconds
    listenerTimeout: 60000, // 60 seconds
    chatHistoryLimit: 50,
  },
} as const;

// Temporary validation - remove after testing
console.log('Config loaded:', {
  supabaseUrl: !!config.supabase.url,
  supabaseAnonKey: !!config.supabase.anonKey,
  openRouterApiKey: !!config.openRouter.apiKey,
});

// Test OpenRouter API call
fetch(`${config.openRouter.baseUrl}/models`, {
  headers: {
    'Authorization': `Bearer ${config.openRouter.apiKey}`,
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('OpenRouter API test:', response.ok ? 'SUCCESS' : 'FAILED', response.status);
  return response.json();
})
.then(data => console.log('OpenRouter models:', data))
.catch(error => console.error('OpenRouter API error:', error));

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
