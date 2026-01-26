'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { AppProvider, getDefaultConfig, getDefaultMobileConfig, MobileWalletAdapterConfig, SimplifiedWalletConnectConfig, Wallet, WalletDisplayConfig } from '@solana/connector/react';
import { Network } from '../types';
import { CoinGeckoConfig, SolanaCluster } from '@solana/connector';
import { useRpcProvider } from './RpcProvider';

type SolanaWalletProviderProps = {
    children: ReactNode;

    appName?: string;
    appUrl?: string;

    autoConnect?: boolean;
    enableMobile?: boolean;

    walletConnect?: boolean | SimplifiedWalletConnectConfig;
    additionalWallets?: Wallet[];
    coingecko?: CoinGeckoConfig;
    walletsDisplayConfig?: WalletDisplayConfig;
};

export function SolanaWalletProvider(props: SolanaWalletProviderProps) {
    const {
        children,
        appName = "Solana Kit",
        appUrl,
        autoConnect = true,
        enableMobile = true,
        walletConnect = false,
        additionalWallets = [],
        coingecko,
        walletsDisplayConfig
    } = props;

    const {
        persistClusterSelection,
        clusterStorageKey,
        maxRPCRetries,
        rpcUrl, allRpcUrls
    } = useRpcProvider();

    const appOrigin = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    const activeNetwork: Network = useMemo(() => {
        if (allRpcUrls.devnet.includes(rpcUrl)) return 'devnet';
        else if (allRpcUrls.testnet.includes(rpcUrl)) return 'testnet';
        else if (allRpcUrls.localnet.includes(rpcUrl)) return 'localnet';
        return 'mainnet';
    }, [rpcUrl, allRpcUrls]);

    const connectorConfig = useMemo(() => {

        const clusters: SolanaCluster[] = [
            {
                id: 'solana:mainnet',
                label: 'Mainnet',
                url: activeNetwork === 'mainnet' ? rpcUrl : allRpcUrls.mainnet[0],
            },
            {
                id: 'solana:localnet',
                label: 'Localnet',
                url: activeNetwork === 'localnet' ? rpcUrl : allRpcUrls.localnet[0],
            },
            {
                id: 'solana:devnet',
                label: 'Devnet',
                url: activeNetwork === 'devnet' ? rpcUrl : allRpcUrls.devnet[0],
            },
            {
                id: 'solana:testnet',
                label: 'Testnet',
                url: activeNetwork === 'testnet' ? rpcUrl : allRpcUrls.testnet[0],
            },
        ];

        return getDefaultConfig({
            appName: appName,
            appUrl: appOrigin,
            autoConnect: autoConnect,

            network: activeNetwork,
            enableMobile: enableMobile,

            // from RPC settings
            clusters,
            persistClusterSelection: persistClusterSelection,
            clusterStorageKey: clusterStorageKey,
            maxRetries: maxRPCRetries,

            walletConnect: walletConnect,
            additionalWallets: additionalWallets,
            coingecko: coingecko,
            wallets: walletsDisplayConfig

        });
    }, [appName, appOrigin, autoConnect, enableMobile, walletConnect, coingecko]);

    // const mobile = useMemo(
    //     () =>
    //         getDefaultMobileConfig({
    //             appName: appName,
    //             appUrl: appOrigin,
    //             network: activeNetwork === 'localnet' ? 'devnet' : activeNetwork,
    //         }),
    //     [appName, appOrigin, activeNetwork],
    // );

    // console.error(mobile.appIdentity)

    const mobile: MobileWalletAdapterConfig = {
        appIdentity: {
            name: appName,
            uri: appOrigin,
            icon: appUrl ? `${appOrigin}/favicon.ico` : undefined,
        }
    }


    return (
        <AppProvider connectorConfig={connectorConfig} mobile={mobile} >
            {children}
        </AppProvider >
    );
}