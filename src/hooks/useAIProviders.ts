import { useState } from 'react';
import axios from 'axios';

type AIProvider = 'anthropic' | 'openai' | 'openrouter';
type AIModel = string;

interface AIConfig {
  provider: AIProvider;
  model: AIModel;
  apiKey: string;
}

interface AIResponse {
  text: string;
  tokens?: number;
  cost?: number;
}

export const useAIProviders = () => {
  const [config, setConfig] = useState<AIConfig | null>(null);

  const validateApiKey = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
    try {
      switch (provider) {
        case 'anthropic':
          const anthropicResponse = await axios.post(
            'https://api.anthropic.com/v1/messages',
            { model: 'claude-3-haiku-20240229', messages: [{ role: 'user', content: 'Test connection' }] },
            { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } }
          );
          return anthropicResponse.status === 200;

        case 'openai':
          const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'Test connection' }] },
            { headers: { 'Authorization': `Bearer ${apiKey}` } }
          );
          return openaiResponse.status === 200;

        case 'openrouter':
          const openrouterResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            { model: 'anthropic/claude-3-haiku-20240229', messages: [{ role: 'user', content: 'Test connection' }] },
            { headers: { 'Authorization': `Bearer ${apiKey}` } }
          );
          return openrouterResponse.status === 200;

        default:
          return false;
      }
    } catch (error) {
      console.error('API Key validation failed:', error);
      return false;
    }
  };

  const generateText = async (prompt: string): Promise<AIResponse> => {
    if (!config) throw new Error('AI configuration not set');

    try {
      switch (config.provider) {
        case 'anthropic':
          const anthropicResponse = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
              model: config.model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 1000
            },
            { 
              headers: { 
                'x-api-key': config.apiKey, 
                'anthropic-version': '2023-06-01' 
              } 
            }
          );
          return { 
            text: anthropicResponse.data.content[0].text,
            tokens: anthropicResponse.data.usage.input_tokens + anthropicResponse.data.usage.output_tokens
          };

        case 'openai':
          const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: config.model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 1000
            },
            { 
              headers: { 
                'Authorization': `Bearer ${config.apiKey}` 
              } 
            }
          );
          return { 
            text: openaiResponse.data.choices[0].message.content,
            tokens: openaiResponse.data.usage.total_tokens
          };

        case 'openrouter':
          const openrouterResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: config.model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 1000
            },
            { 
              headers: { 
                'Authorization': `Bearer ${config.apiKey}` 
              } 
            }
          );
          return { 
            text: openrouterResponse.data.choices[0].message.content,
            tokens: openrouterResponse.data.usage.total_tokens
          };

        default:
          throw new Error('Unsupported AI provider');
      }
    } catch (error) {
      console.error('AI text generation failed:', error);
      throw error;
    }
  };

  const analyzeText = async (text: string): Promise<AIResponse> => {
    if (!config) throw new Error('AI configuration not set');

    const analysisPrompt = `Analyze the following text for narrative structure, character development, and potential improvements:

Text to analyze:
${text}

Please provide a detailed analysis focusing on:
1. Narrative flow
2. Character depth
3. Potential plot enhancements
4. Writing style suggestions`;

    return generateText(analysisPrompt);
  };

  return {
    validateApiKey,
    generateText,
    analyzeText,
    setConfig
  };
};
