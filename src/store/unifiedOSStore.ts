/**
 * Unified OS - Zustand Store
 * 
 * Global state management for the educational operating system.
 * Handles active space, helpers, UI state, and workspace persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Space,
  Helper,
  WorkspaceState,
  ChatMessage,
  Note,
} from '@/types/unifiedOS';

interface UnifiedOSStore extends WorkspaceState {
  // Space Management
  spaces: Space[];
  setSpaces: (spaces: Space[]) => void;
  setActiveSpace: (space: Space | undefined) => void;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
  
  // Helper Management
  setActiveHelpers: (helpers: Helper[]) => void;
  addHelper: (helper: Helper) => void;
  removeHelper: (helperId: string) => void;
  updateHelper: (helperId: string, updates: Partial<Helper>) => void;
  setActiveHelper: (helperId: string | undefined) => void;
  reorderHelpers: (helperIds: string[]) => void;
  
  // UI State
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setFocusMode: (enabled: boolean) => void;
  toggleFocusMode: () => void;
  setLayout: (layout: WorkspaceState['layout']) => void;
  
  // Chat Management
  chatMessages: Record<string, ChatMessage[]>;
  addChatMessage: (spaceId: string, message: ChatMessage) => void;
  clearChatHistory: (spaceId: string) => void;
  
  // Notes Management
  notes: Record<string, Note[]>;
  addNote: (spaceId: string, note: Note) => void;
  removeNote: (spaceId: string, noteId: string) => void;
  updateNote: (spaceId: string, noteId: string, updates: Partial<Note>) => void;
  
  // Workspace Actions
  initializeWorkspace: (spaceId: string) => Promise<void>;
  closeWorkspace: () => void;
  resetStore: () => void;
}

const initialState: WorkspaceState = {
  active_space: undefined,
  active_helpers: [],
  sidebar_collapsed: false,
  focus_mode: false,
  active_helper_id: undefined,
  layout: 'default',
};

export const useUnifiedOSStore = create<UnifiedOSStore>()(
  persist(
    (set, get) => ({
      // Initial State
      ...initialState,
      spaces: [],
      chatMessages: {},
      notes: {},

      // Space Management
      setSpaces: (spaces) => set({ spaces }),

      setActiveSpace: (space) => {
        set({ active_space: space });
        
        // Update last_accessed_at
        if (space) {
          get().updateSpace(space.id, {
            last_accessed_at: new Date().toISOString(),
          });
        }
      },

      updateSpace: (spaceId, updates) =>
        set((state) => ({
          spaces: state.spaces.map((space) =>
            space.id === spaceId
              ? { ...space, ...updates, updated_at: new Date().toISOString() }
              : space
          ),
          active_space:
            state.active_space?.id === spaceId
              ? { ...state.active_space, ...updates }
              : state.active_space,
        })),

      // Helper Management
      setActiveHelpers: (helpers) => set({ active_helpers: helpers }),

      addHelper: (helper) =>
        set((state) => ({
          active_helpers: [...state.active_helpers, helper],
        })),

      removeHelper: (helperId) =>
        set((state) => ({
          active_helpers: state.active_helpers.filter((h) => h.id !== helperId),
          active_helper_id:
            state.active_helper_id === helperId
              ? undefined
              : state.active_helper_id,
        })),

      updateHelper: (helperId, updates) =>
        set((state) => ({
          active_helpers: state.active_helpers.map((helper) =>
            helper.id === helperId
              ? { ...helper, ...updates, updated_at: new Date().toISOString() }
              : helper
          ),
        })),

      setActiveHelper: (helperId) => set({ active_helper_id: helperId }),

      reorderHelpers: (helperIds) =>
        set((state) => {
          const helperMap = new Map(
            state.active_helpers.map((h) => [h.id, h])
          );
          return {
            active_helpers: helperIds
              .map((id, index) => {
                const helper = helperMap.get(id);
                return helper ? { ...helper, order: index } : null;
              })
              .filter((h): h is Helper => h !== null),
          };
        }),

      // UI State
      setSidebarCollapsed: (collapsed) => set({ sidebar_collapsed: collapsed }),

      toggleSidebar: () =>
        set((state) => ({ sidebar_collapsed: !state.sidebar_collapsed })),

      setFocusMode: (enabled) =>
        set({
          focus_mode: enabled,
          sidebar_collapsed: enabled ? true : undefined,
        }),

      toggleFocusMode: () =>
        set((state) => ({
          focus_mode: !state.focus_mode,
          sidebar_collapsed: !state.focus_mode ? true : state.sidebar_collapsed,
        })),

      setLayout: (layout) => set({ layout }),

      // Chat Management
      addChatMessage: (spaceId, message) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [spaceId]: [...(state.chatMessages[spaceId] || []), message],
          },
        })),

      clearChatHistory: (spaceId) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [spaceId]: [],
          },
        })),

      // Notes Management
      addNote: (spaceId, note) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [spaceId]: [...(state.notes[spaceId] || []), note],
          },
        })),

      removeNote: (spaceId, noteId) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [spaceId]: (state.notes[spaceId] || []).filter(
              (n) => n.id !== noteId
            ),
          },
        })),

      updateNote: (spaceId, noteId, updates) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [spaceId]: (state.notes[spaceId] || []).map((note) =>
              note.id === noteId
                ? { ...note, ...updates, updated_at: new Date().toISOString() }
                : note
            ),
          },
        })),

      // Workspace Actions
      initializeWorkspace: async (spaceId) => {
        const state = get();
        const space = state.spaces.find((s) => s.id === spaceId);
        
        if (space) {
          set({
            active_space: space,
            active_helpers: [],
            active_helper_id: undefined,
            focus_mode: false,
            sidebar_collapsed: false,
          });

          // TODO: Load helpers from Supabase
          // TODO: Load chat history
          // TODO: Load notes
        }
      },

      closeWorkspace: () =>
        set({
          active_space: undefined,
          active_helpers: [],
          active_helper_id: undefined,
          focus_mode: false,
        }),

      resetStore: () =>
        set({
          ...initialState,
          spaces: [],
          chatMessages: {},
          notes: {},
        }),
    }),
    {
      name: 'unified-os-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist only essential UI preferences
        sidebar_collapsed: state.sidebar_collapsed,
        layout: state.layout,
        // Don't persist active workspace - load fresh on mount
      }),
    }
  )
);

// Selectors for optimized re-renders
export const selectActiveSpace = (state: UnifiedOSStore) => state.active_space;
export const selectActiveHelpers = (state: UnifiedOSStore) => state.active_helpers;
export const selectFocusMode = (state: UnifiedOSStore) => state.focus_mode;
export const selectSidebarCollapsed = (state: UnifiedOSStore) => state.sidebar_collapsed;
