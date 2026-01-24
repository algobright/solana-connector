import { useEffect, useRef, useState } from 'react'
import styles from './WalletDropdown.module.css'
import { motion } from 'motion/react';
import Avatar from '@shared/Avatar';
import { Check, ChevronLeft, Copy, Globe, LogOut, RefreshCw } from 'lucide-react';
import Button from '@shared/Button';
import { address, BalanceElement, ClusterElement, DisconnectElement, lamportsToSol, useCluster, useConnectorClient } from '@solana/connector';
import { createSolanaRpc } from '@solana/kit';
import { clsx } from 'clsx';

interface WalletDropdownProps {
    CN_ConnectButton?: string;
    selectedAccount: string;
    walletIcon?: string;
    walletName: string;
    theme?: 'light' | 'dark';

    allowNetworkSwitch?: boolean;
    showSolBalance?: boolean;
}

type DropdownView = 'wallet' | 'network';

const networkColor: Record<string, string> = {
    'solana:mainnet': '#00c950',
    'solana:devnet': '#2b7fff',
    'solana:testnet': '#f0b100',
    'solana:localnet': '#ff3b3b',
};

export function WalletDropdown(props: WalletDropdownProps) {
    const client = useConnectorClient();

    const { CN_ConnectButton, selectedAccount, walletIcon, walletName, theme, allowNetworkSwitch, showSolBalance } = props

    const [view, setView] = useState<DropdownView>('wallet');
    const [copied, setCopied] = useState(false);

    const fetching = useRef(false);
    const [isFetchingBalance, setIsFetchingBalance] = useState(false);
    const [solBalance, setSolBalance] = useState<number | null>(null);

    const shortAddress = `${selectedAccount.slice(0, 4)}...${selectedAccount.slice(-4)}`;

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(selectedAccount);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            setCopied(false);
            console.error('Failed to copy to clipboard:', error);
        }
    }

    async function fetchSolBalance() {
        if (!client || fetching.current) return;
        setIsFetchingBalance(true);
        fetching.current = true;
        try {
            const rpcUrl = client.getRpcUrl();
            const pubkey = address(selectedAccount);
            if (!rpcUrl) throw new Error('No RPC endpoint configured');
            const rpc = createSolanaRpc(rpcUrl);
            const solLamports = (await rpc.getBalance(pubkey).send()).value || 0;
            const sol = lamportsToSol(solLamports);
            setSolBalance(sol);

        } catch (error) {
            setSolBalance(0);
        } finally {
            setIsFetchingBalance(false);
            fetching.current = false;
        }
    }

    useEffect(() => {
        if (showSolBalance && selectedAccount && client) {
            fetchSolBalance();
        }
    }, [selectedAccount, client, showSolBalance]);

    if (view === 'wallet') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={clsx(styles.WalletDropdown, CN_ConnectButton)}
                data-theme={theme}
            >
                {/* Header with Avatar and Address */}
                <div className={styles.Header}>
                    <div className={styles.addressAndAvatar}>
                        <Avatar
                            width={48}
                            height={48}
                            src={walletIcon}
                            alt={walletName}
                        />
                        <div className={styles.address}>
                            <span className={styles.shortAddress}>{shortAddress}</span>
                            <span className={styles.walletName}>{walletName}</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            type="button"
                            onClick={handleCopy}
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            title={copied ? 'Copied!' : 'Copy address'}
                        >
                            {copied ?
                                <Check className={styles.checkIcon} /> :
                                <Copy />
                            }
                        </Button>

                        {/* Network Selector Globe Button */}
                        {allowNetworkSwitch && (
                            <ClusterElement
                                render={({ cluster }) => (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setView('network')}
                                        title={`Network: ${cluster?.label || 'Unknown'}`}
                                    >
                                        <Globe />
                                        <span
                                            className={styles.networkIndicator}
                                            style={{ background: networkColor[cluster?.id || 'solana:mainnet'] }}
                                        />
                                    </Button>
                                )}
                            />
                        )}
                    </div>
                </div>

                {showSolBalance && (
                    <div className={styles.balanceSection}>
                        <div
                            className={styles.balanceHeader}
                        >
                            <span className={styles.balanceLabel}>Balance</span>
                            <button
                                onClick={() => fetchSolBalance()}
                                disabled={isFetchingBalance}
                                title="Refresh balance"
                                className={styles.refreshButton}
                                data-loading={isFetchingBalance}
                            >
                                <RefreshCw
                                    className={styles.refreshIcon}
                                />
                            </button>
                        </div>
                        <div className={styles.balanceValue}>
                            {isFetchingBalance ? (
                                <div className={styles.balanceLoading} />
                            ) : solBalance !== null ? (
                                `${solBalance.toFixed(4)} SOL`
                            ) : (
                                '-- SOL'
                            )}
                        </div>
                    </div>
                )}

                <DisconnectElement
                    render={({ disconnect, disconnecting }) => (
                        <Button
                            variant="default"
                            className={styles.disconnectButton}
                            onClick={disconnect}
                            disabled={disconnecting}
                        >
                            <LogOut className={styles.disconnectIcon} />
                            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                    )}
                />
            </motion.div>
        )
    }

    //network switch view
    if (view === 'network') {
        console.count('Network view rendered');
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={clsx(styles.WalletDropdown, CN_ConnectButton)}
                data-theme={theme}
            >
                {/* Header */}
                <div className={styles.NetworkHeader}>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setView('wallet')}
                        title={`Network: Back to Wallet`}
                        className={styles.backButton}
                    >
                        <ChevronLeft />
                    </Button>
                    <span>Network Settings</span>
                </div>

                {/* Network Options */}
                <ClusterElement
                    render={({ cluster, clusters, setCluster }) => {
                        const currentClusterId = (cluster as { id?: string })?.id || 'solana:mainnet';
                        return (
                            <div className={styles.networkOptions}>
                                {clusters.map((network, index) => {
                                    const isSelected = currentClusterId === network.id;
                                    return (
                                        <div
                                            key={network.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setCluster(network.id)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setCluster(network.id);
                                                }
                                            }}
                                            className={styles.networkButton}
                                        >
                                            <div className={styles.networkName}>
                                                <span
                                                    className={styles.networkColor}
                                                    style={{ background: networkColor[network.id] }}
                                                />
                                                <span className={styles.networkLabel}>{network.label}</span>
                                            </div>
                                            <div className={styles.checkMark} data-selected={isSelected}>
                                                {isSelected && <Check />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }}
                />
            </motion.div>
        )
    }
}

export default WalletDropdown