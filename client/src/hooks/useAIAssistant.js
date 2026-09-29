// hooks/useAIAssistant.js
import { useContext } from 'react';
import { AIAssistantContext } from '../context/AIAssistantContext.js';
export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) throw new Error('useAIAssistant must be used inside <AIAssistantProvider>');
  return context;
}