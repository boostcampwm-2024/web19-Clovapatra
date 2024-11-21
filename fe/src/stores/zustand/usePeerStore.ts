import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PeerStore {
  userMappings: Record<string, string>;
}

interface PeerActions {
  setUserMappings: (mappings: Record<string, string>) => void;
}

const initialState: PeerStore = {
  userMappings: {},
};

const usePeerStore = create<PeerStore & PeerActions>()(
  devtools((set) => ({
    ...initialState,

    setUserMappings: (mappings) =>
      set(() => ({
        userMappings: { ...mappings },
      })),
  }))
);

export default usePeerStore;
