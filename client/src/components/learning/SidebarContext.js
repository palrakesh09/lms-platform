import { createContext, useContext } from 'react';

// Shared by the sidebar's nested components so state is not threaded through four levels of props.
export const SidebarContext = createContext(null);

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used inside <CourseSidebar>');
  }
  return context;
}