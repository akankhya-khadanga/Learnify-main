import { create } from 'zustand';
import { ClusterType } from '@/types/navigation';

interface NavigationStore {
  activeCluster: ClusterType | null;
  isInCluster: boolean;
  previousRoute: string | null;
  
  setActiveCluster: (cluster: ClusterType | null) => void;
  setIsInCluster: (value: boolean) => void;
  setPreviousRoute: (route: string | null) => void;
  exitCluster: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeCluster: null,
  isInCluster: false,
  previousRoute: null,
  
  setActiveCluster: (cluster) => set({ activeCluster: cluster }),
  setIsInCluster: (value) => set({ isInCluster: value }),
  setPreviousRoute: (route) => set({ previousRoute: route }),
  exitCluster: () => set({ activeCluster: null, isInCluster: false }),
}));
