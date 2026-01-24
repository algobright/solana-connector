"use client";

import { RpcMap } from "../types";
import { RpcProvider } from "./RpcProvider";
import { SolanaWalletProvider } from "./SolanaWalletProvider";

type SolanaWrapperProps = {
    children: React.ReactNode;

    /** * Name of your app (displayed in wallet connection modals) 
     * @default "Solana Kit"
     */
    appName?: string;

    /** * URL of your app (used for deep linking) 
     */
    appUrl?: string;

    /** * Automatically connect to the last used wallet on load.
     * @default true
     */
    autoConnect?: boolean;

    /** * Enable mobile wallets (e.g. Phantom on iOS/Android) 
     * @default true
     */
    enableMobile?: boolean;

    /** * Enable WalletConnect support 
     * @default true
     */
    walletConnect?: boolean;

    /** * List of default RPC endpoints mapped by network 
     * @default DEFAULT_RPCS
     */
    defaultRpcList?: RpcMap;

    /** * The default RPC endpoint to use if none is selected 
     * @default DEFAULT_RPCS.mainnet[0]
     */
    defaultRpcUrl?: string;

    /** * LocalStorage key for saving custom RPC list 
     * @default 'all-rpc-urls'
     */
    LS_KEY_RPC_LIST?: string;

    /** * LocalStorage key for saving default RPC endpoint 
     * @default 'curr-rpc'
     */
    LS_KEY_RPC_DEFAULT?: string;

    /** * LocalStorage key for saving selected cluster 
     * @default 'solana-cluster'
     */
    LS_KEY_CLUSTER?: string;

    /** * Persist cluster selection in LocalStorage 
     * @default true
     */
    persistClusterSelection?: boolean;

    /** * Maximum number of retries for RPC requests 
     * @default 3
     */
    MAX_RPC_RETRIES?: number;
}

export function SolanaWrapper(props: SolanaWrapperProps) {
    const {
        children,

        appName,
        appUrl,

        autoConnect,
        enableMobile,
        walletConnect,

        defaultRpcList,
        defaultRpcUrl,
        LS_KEY_RPC_LIST,
        LS_KEY_RPC_DEFAULT,
        LS_KEY_CLUSTER,
        persistClusterSelection,
        MAX_RPC_RETRIES,

    } = props


    const RPC_PROVIDER_PROPS = {
        defaultRpcList,
        defaultRpcUrl,
        LS_KEY_RPC_LIST,
        LS_KEY_RPC_DEFAULT,
        LS_KEY_CLUSTER,
        persistClusterSelection,
        MAX_RPC_RETRIES,

    }

    const solanaWalletProviderProps = {
        appName,
        appUrl,

        autoConnect,
        enableMobile,

        walletConnect,
        additionalWallets: [],
        coingecko: undefined,
        walletsDisplayConfig: undefined
    }

    return (
        <RpcProvider {...RPC_PROVIDER_PROPS}>
            <SolanaWalletProvider {...solanaWalletProviderProps}>
                {children}
            </SolanaWalletProvider>
        </RpcProvider>
    )
}