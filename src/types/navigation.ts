// Navigation Cluster Architecture for OS-Style Navigation

export type ClusterType = 
  | 'learning-tools'
  | 'sign-language'
  | 'visualization-tools'
  | 'supportive-tools'
  | 'unified-os';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string; // lucide icon name
  href: string;
  description?: string;
  color?: string;
}

export interface ClusterConfig {
  id: ClusterType;
  label: string;
  icon: string;
  isPermanent: boolean; // true if not clustered (Sign Language, Unified OS)
  items: NavigationItem[];
  gradient: string;
  description: string;
}

export interface NavigationState {
  activeCluster: ClusterType | null;
  isInCluster: boolean;
  previousRoute: string | null;
}
