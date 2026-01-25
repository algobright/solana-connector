import { useEffect, useRef, useState } from 'react'
import { isAddress } from '@solana/kit';
import styles from './WalletDropdown.module.css'
import { motion } from 'motion/react';
import Avatar from '@shared/Avatar';
import { Check, ChevronLeft, Copy, Globe, LogOut, RefreshCw } from 'lucide-react';
import Button from '@shared/Button';
import { ClusterElement, DisconnectElement, useConnector, useConnectorClient } from '@solana/connector';
import { clsx } from 'clsx';
import { getSolBalance, getTokenBalance } from 'src/utils/fetchBalance';

/**
 * Props for the WalletDropdown component.
 */
interface WalletDropdownProps {
    /** * Custom CSS class for the dropdown menu container. 
     * If not passed, the component uses default absolute positioning.
     */
    CN_DropdownMenu?: string;

    /** * Visual theme for the dropdown items. 
     * @default 'light'
     */
    theme?: 'light' | 'dark';

    /** * Enables the option to switch between Solana clusters. 
     * @default true
     */
    allowNetworkSwitch?: boolean;

    /** * Displays the user's SOL balance inside the dropdown header. 
     * @default true
     */
    showSolBalance?: boolean;

    /** * Configuration to display a specific SPL token balance. 
     * If not provided, this defaults to false (hidden).
     */
    showDefaultToken?: {
        address: string;
        symbol: string;
    } | undefined;
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

    const { CN_DropdownMenu,
        theme = 'light',
        allowNetworkSwitch = true,
        showSolBalance = true,
        showDefaultToken
    } = props

    const [view, setView] = useState<DropdownView>('wallet');
    const [copied, setCopied] = useState(false);

    const { account, connector } = useConnector();
    const fetchingSolBalance = useRef(false);
    const [isFetchingBalance, setIsFetchingBalance] = useState(false);

    const fetchingDefaultToken = useRef(false);
    const [isFetchingDefaultTokenBalance, setIsFetchingDefaultTokenBalance] = useState(false);

    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [defaultTokenBalance, setDefaultTokenBalance] = useState<number | null>(null);

    const selectedAccount = account || '';
    const walletName = connector?.name || 'Unknown Wallet';
    const walletIcon = connector?.icon || undefined;
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
        if (!client || fetchingSolBalance.current) return;
        setIsFetchingBalance(true);
        fetchingSolBalance.current = true;

        const solBalance = await getSolBalance(client, selectedAccount);
        setSolBalance(solBalance);

        setIsFetchingBalance(false);
        fetchingSolBalance.current = false;
    }

    async function fetchDefaultTokenBalance() {
        if (!showDefaultToken || !showDefaultToken.address || !client || fetchingDefaultToken.current) return;

        const isValidAddress = isAddress(showDefaultToken.address);
        if (!isValidAddress) {
            console.error('Invalid default token address:', showDefaultToken);
            return
        }

        setIsFetchingDefaultTokenBalance(true);
        fetchingDefaultToken.current = true;

        const tokenBalance = await getTokenBalance(client, selectedAccount, showDefaultToken.address);
        setDefaultTokenBalance(tokenBalance);

        setIsFetchingDefaultTokenBalance(false);
        fetchingDefaultToken.current = false;
    }

    useEffect(() => {
        if (showSolBalance && selectedAccount && client) {
            fetchSolBalance();
        }
        if (showDefaultToken && selectedAccount && client) {
            fetchDefaultTokenBalance();
        }
    }, [selectedAccount, client, showSolBalance, showDefaultToken]);

    if (view === 'wallet') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={clsx(styles.WalletDropdown, CN_DropdownMenu)}
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
                        <div className={styles.balanceValue} title={String(solBalance) || "0"}>
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

                {showDefaultToken && (
                    <div className={styles.balanceSection}>
                        <div
                            className={styles.balanceHeader}
                        >
                            <span className={styles.balanceLabel}>Balance</span>
                            <button
                                onClick={() => fetchDefaultTokenBalance()}
                                disabled={isFetchingDefaultTokenBalance}
                                title="Refresh balance"
                                className={styles.refreshButton}
                                data-loading={isFetchingDefaultTokenBalance}
                            >
                                <RefreshCw
                                    className={styles.refreshIcon}
                                />
                            </button>
                        </div>
                        <div className={styles.balanceValue} title={String(defaultTokenBalance) || "0"}>
                            {isFetchingDefaultTokenBalance ? (
                                <div className={styles.balanceLoading} />
                            ) : defaultTokenBalance !== null ? (
                                `${defaultTokenBalance.toFixed(4)} ${showDefaultToken?.symbol || ''}`
                            ) : (
                                `-- ${showDefaultToken?.symbol || ''}`
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
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={clsx(styles.WalletDropdown, CN_DropdownMenu)}
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
                                {clusters.map((network) => {
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