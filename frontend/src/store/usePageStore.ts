import { create } from 'zustand';
import api from '@/services/api';

export interface Page {
    _id: string;
    title: string;
    icon?: string;
    parent?: string | null;
    owner: string;
    createdAt: string;
    updatedAt: string;
    // We might need an expanded property for the tree view in UI state, 
    // but the raw page object shouldn't have it strictly. 
    // Let's keep it clean.
}

interface PageState {
    pages: Page[];
    isLoading: boolean;
    fetchPages: () => Promise<void>;
    createPage: (parent?: string | null) => Promise<Page | void>;
    deletePage: (pageId: string) => Promise<void>;
    renamePage: (pageId: string, title: string) => Promise<void>;
}

export const usePageStore = create<PageState>((set, get) => ({
    pages: [],
    isLoading: false,

    fetchPages: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/pages');
            set({ pages: data });
        } catch (error) {
            console.error('Failed to fetch pages', error);
        } finally {
            set({ isLoading: false });
        }
    },

    createPage: async (parent = null) => {
        try {
            const { data } = await api.post('/pages', { parent });
            set((state) => ({ pages: [data, ...state.pages] }));
            return data;
        } catch (error) {
            console.error('Failed to create page', error);
        }
    },

    deletePage: async (pageId) => {
        // Optimistic update
        const prevPages = get().pages;
        set((state) => ({ pages: state.pages.filter(p => p._id !== pageId) }));

        try {
            await api.delete(`/pages/${pageId}`);
        } catch (error) {
            console.error('Failed to delete page', error);
            set({ pages: prevPages }); // Rollback
        }
    },

    renamePage: async (pageId, title) => {
        // Optimistic update
        set((state) => ({
            pages: state.pages.map(p => p._id === pageId ? { ...p, title } : p)
        }));

        try {
            await api.put(`/pages/${pageId}`, { title });
        } catch (error) {
            console.error('Failed to rename page', error);
            // Verify if we need rollback or just re-fetch
        }
    }
}));
