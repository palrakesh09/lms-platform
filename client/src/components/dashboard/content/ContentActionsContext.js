import { createContext, useContext } from 'react';

// { expanded: Set<id>, toggle(id), requestCreate(entity, parent), requestEdit(entity, node), requestDelete(entity, node) }
export const ContentActionsContext = createContext(null);

export function useContentActions() {
  const context = useContext(ContentActionsContext);

  if (!context) {
    throw new Error('useContentActions must be used inside <ContentTree>');
  }
  return context;
}