'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode
} from 'react';
import { Network, RpcMap } from '../types';


const DEFAULT_RPCS: RpcMap = {
    mainnet: ['https://api.mainnet.solana.com'],
    devnet: ['https://api.devnet.solana.com'],
    testnet: ['https://api.testnet.solana.com'],
    localnet: ['http://localhost:8899'],
};

interface RpcContextType {
    rpcUrl: string;
    setRpcUrl: (url: string) => void;

    persistClusterSelection: boolean;
    clusterStorageKey: string;
    maxRPCRetries: number;

    allRpcUrls: RpcMap;
    addRpcUrl: (network: Network, url: string) => void;
    removeRpcUrl: (network: Network, url: string) => void;
}
const RpcContext = createContext<RpcContextType | null>(null);


type RpcProviderProps = {
    children: ReactNode;

    defaultRpcList?: RpcMap;
    defaultRpcUrl?: string;

    LS_KEY_RPC_LIST?: string;
    LS_KEY_RPC_DEFAULT?: string;
    LS_KEY_CLUSTER?: string;
    persistClusterSelection?: boolean;
    MAX_RPC_RETRIES?: number;
};
export function RpcProvider(props: RpcProviderProps) {
    const {
        children,
        defaultRpcList = DEFAULT_RPCS,
        defaultRpcUrl = DEFAULT_RPCS.mainnet[0],
        LS_KEY_RPC_LIST = 'all-rpc-urls',
        LS_KEY_RPC_DEFAULT = 'curr-rpc',
        LS_KEY_CLUSTER = 'solana-cluster',
        persistClusterSelection = true,
        MAX_RPC_RETRIES = 3,
    } = props;

    const [allRpcUrls, setAllRpcUrls] = useState<RpcMap>(defaultRpcList);
    const [rpcUrl, setRpcUrlState] = useState<string>(defaultRpcUrl);

    useEffect(() => {
        const savedHistory = localStorage.getItem(LS_KEY_RPC_LIST);
        const savedRpc = localStorage.getItem(LS_KEY_RPC_DEFAULT);

        if (savedRpc && savedRpc !== rpcUrl) {
            setRpcUrlState(savedRpc);
        }

        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory) as RpcMap;
                setAllRpcUrls({
                    mainnet: Array.from(new Set([...DEFAULT_RPCS.mainnet, ...(parsed.mainnet || [])])),
                    devnet: Array.from(new Set([...DEFAULT_RPCS.devnet, ...(parsed.devnet || [])])),
                    testnet: Array.from(new Set([...DEFAULT_RPCS.testnet, ...(parsed.testnet || [])])),
                    localnet: Array.from(new Set([...DEFAULT_RPCS.localnet, ...(parsed.localnet || [])])),
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const setRpcUrl = useCallback((url: string) => {
        setRpcUrlState(url);
        localStorage.setItem(LS_KEY_RPC_DEFAULT, url);
    }, []);

    const addRpcUrl = useCallback((network: Network, url: string) => {
        if (!url) return;

        setAllRpcUrls((prev) => {
            const newList = Array.from(new Set([...prev[network], url]));
            const newState = { ...prev, [network]: newList };
            localStorage.setItem(LS_KEY_RPC_LIST, JSON.stringify(newState));
            return newState;
        });

        setRpcUrl(url);
    }, [setRpcUrl]);

    const removeRpcUrl = useCallback((network: Network, url: string) => {
        setAllRpcUrls((prev) => {
            let newList = prev[network].filter((rpc) => rpc !== url);

            if (newList.length === 0) {
                newList = [...DEFAULT_RPCS[network]];
            }

            const newState = { ...prev, [network]: newList };
            localStorage.setItem(LS_KEY_RPC_LIST, JSON.stringify(newState));
            return newState;
        });
    }, [LS_KEY_RPC_LIST]);

    const value = useMemo<RpcContextType>(() => ({
        persistClusterSelection: persistClusterSelection,
        clusterStorageKey: LS_KEY_CLUSTER,
        maxRPCRetries: MAX_RPC_RETRIES,
        rpcUrl,
        setRpcUrl,
        allRpcUrls,
        addRpcUrl,
        removeRpcUrl
    }), [rpcUrl, allRpcUrls, setRpcUrl, addRpcUrl, removeRpcUrl]);


    return (
        <RpcContext.Provider value={value}>
            {children}
        </RpcContext.Provider>
    );
}

export const useRpcProvider = () => {
    const context = useContext(RpcContext);
    if (!context) {
        throw new Error('useRpcProvider must be used within RpcProvider');
    }
    return context;
};