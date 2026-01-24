import { useConnector, WalletConnectorId, WalletConnectorMetadata } from "@solana/connector";
import { Check, ChevronLeft, Copy, ExternalLink, Wallet, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import styles from './WalletModal.module.css';
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@shared/Dialog";
import Button from "@shared/Button";
import CustomQRCode from "@shared//CustomQRCode";
import Spinner from "@shared/Spinner";
import { SiWalletconnect } from "react-icons/si";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shared/Collapsible";
import Avatar from "@shared/Avatar";
import { clsx } from "clsx";

type WalletModalProps = {
    CN_Modal?: string;
    theme?: 'light' | 'dark';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    walletConnectUri: string | null;
    onClearWalletConnectUri: () => void;
}

export function WalletModal(props: WalletModalProps) {
    const {
        CN_Modal,
        theme = 'light',
        open,
        onOpenChange,
        walletConnectUri,
        onClearWalletConnectUri
    } = props;

    const { walletStatus: { status }, isConnecting, connectorId, connectors, connectWallet, disconnectWallet } = useConnector();

    const [connectingConnectorId, setConnectingConnectorId] = useState<WalletConnectorId | null>(null);
    const [isOtherWalletsOpen, setIsOtherWalletsOpen] = useState(false);
    const [errorConnectorId, setErrorConnectorId] = useState<WalletConnectorId | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const isClient = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false,
    );

    const recentlyConnectedConnectorId = useSyncExternalStore(
        () => () => { },
        () => localStorage.getItem('recentlyConnectedConnectorId') as WalletConnectorId | null,
        () => null
    );

    useEffect(() => {
        if (status === 'connected' && connectorId) {
            localStorage.setItem('recentlyConnectedConnectorId', connectorId);
        }
    }, [status, connectorId]);

    const walletConnectConnector = connectors.find(c => c.name === 'WalletConnect') ?? null;
    const isWalletConnectFlow =
        (!!walletConnectConnector &&
            (connectingConnectorId === walletConnectConnector.id ||
                (status === 'connecting' && connectorId === walletConnectConnector.id))) ||
        !!walletConnectUri;

    function cancelConnection() {
        onClearWalletConnectUri?.();
        setConnectingConnectorId(null);
        disconnectWallet().catch(() => { });
    }

    // Clear error state when modal closes or user tries another wallet
    const clearError = () => {
        setErrorConnectorId(null);
        setErrorMessage(null);
    };

    const handleSelectWallet = async (connector: WalletConnectorMetadata) => {
        clearError();
        setConnectingConnectorId(connector.id);
        try {
            if (connector.name === 'WalletConnect') {
                onClearWalletConnectUri?.();
            }
            await connectWallet(connector.id);
            localStorage.setItem('recentlyConnectedConnectorId', connector.id);
            // Don't close modal for WalletConnect - wait for connection
            if (connector.name !== 'WalletConnect') {
                onOpenChange(false);
            }
        } catch (error) {
            // Extract user-friendly error message
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            if (message.includes('Connection cancelled')) return;

            // Set error state for UI feedback
            setErrorConnectorId(connector.id);
            setErrorMessage(message);

            // Log for telemetry/debugging (includes full error details)
            console.error('Failed to connect wallet:', {
                wallet: connector.name,
                connectorId: connector.id,
                error,
                message,
                timestamp: new Date().toISOString(),
            });
        } finally {
            setConnectingConnectorId(null);
        }
    };

    const handleCopyUri = async () => {
        if (!walletConnectUri) return;
        try {
            await navigator.clipboard.writeText(walletConnectUri);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URI:', err);
        }
    };

    const handleBackFromWalletConnect = () => {
        cancelConnection();
    };

    const readyConnectors = connectors.filter(c => c.ready);
    const notReadyConnectors = connectors.filter(c => !c.ready);

    const sortedReadyConnectors = [...readyConnectors].sort((a, b) => {
        const aIsRecent = recentlyConnectedConnectorId === a.id;
        const bIsRecent = recentlyConnectedConnectorId === b.id;
        if (aIsRecent && !bIsRecent) return -1;
        if (!aIsRecent && bIsRecent) return 1;
        return 0;
    });

    const primaryWallets = sortedReadyConnectors.slice(0, 3);
    const otherWallets = sortedReadyConnectors.slice(3);

    const primayOuterHr = otherWallets.length > 0 && primaryWallets.length > 0;

    const getInstallUrl = (walletName: string, walletUrl?: string): string | undefined => {
        if (walletUrl) return walletUrl;

        const name = walletName.toLowerCase();
        if (name.includes('phantom')) return 'https://phantom.app';
        if (name.includes('solflare')) return 'https://solflare.com';
        if (name.includes('backpack')) return 'https://backpack.app';
        if (name.includes('glow')) return 'https://glow.app';
        if (name.includes('coinbase')) return 'https://www.coinbase.com/wallet';
        if (name.includes('ledger')) return 'https://www.ledger.com';
        if (name.includes('trust')) return 'https://trustwallet.com';
        if (name.includes('exodus')) return 'https://www.exodus.com';
        return undefined;
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            clearError();
            if (isConnecting || connectingConnectorId || walletConnectUri) {
                cancelConnection();
            }
        }
        onOpenChange(isOpen);
    };

    const walletLinkOpen = (walletName: string) => {
        const installUrl = getInstallUrl(walletName);
        if (installUrl) {
            window.open(installUrl, '_blank');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} >
            <DialogContent
                showCloseButton={false}
                className={clsx(styles.dialogContent, CN_Modal)}
                theme={theme}
            >
                {/* Header */}
                <div className={styles.dialogHeader}>
                    {isWalletConnectFlow ? (
                        <button
                            onClick={handleBackFromWalletConnect}
                            className={styles.iconButton}
                        >
                            <ChevronLeft />
                        </button>
                    ) : null}
                    <DialogTitle className={styles.dialogTitle}>
                        {isWalletConnectFlow ? 'WalletConnect' : 'Connect your wallet'}
                    </DialogTitle>
                    <DialogClose className={styles.iconButton}>
                        <X />
                    </DialogClose>
                </div>

                {/* WalletConnect QR Code Display */}
                {isWalletConnectFlow && (
                    <div className={styles.walletsContainer}>
                        <div className={styles.tooltipBubble}>
                            <span>Use a WalletConnect</span>
                            <div className={styles.tooltipIconWrapper}>
                                <SiWalletconnect className={styles.tooltipIcon} />
                                <div className={styles.tooltipCaret} />
                            </div>
                            <span>supported wallet to scan</span>
                        </div>

                        {/* QR Code */}
                        <div className={styles.qrWrapper}>
                            <CustomQRCode
                                value={walletConnectUri ?? ''}
                                size={280}
                                ecl="M"
                                loading={!walletConnectUri}
                                scanning={!!walletConnectUri}
                            />
                        </div>

                        {/* Copy URI button */}
                        <Button
                            variant="outline"
                            onClick={handleCopyUri}
                            disabled={!walletConnectUri}
                            className={styles.copyButton}
                            data-theme={theme}
                        >
                            {copied ? (
                                <>
                                    <Check className={`${styles.icon} ${styles.successIcon}`} />
                                    Copy to Clipboard
                                </>
                            ) : (
                                <>
                                    <Copy className={styles.icon} />
                                    Copy to Clipboard
                                </>
                            )}
                        </Button>

                    </div>
                )}

                {!isWalletConnectFlow && (
                    <div className={styles.walletsContainer}>
                        {/* 1. Loading State (Detecting Wallets) */}
                        {!isClient && (
                            <div className={styles.detectingWallets}>
                                <Spinner />
                                <p >Detecting wallets...</p>
                            </div>
                        )}

                        {/* 2. Empty State (No Wallets Detected) */}
                        {connectors.length === 0 && (
                            <div className={styles.emptyStateContainer}>
                                <Wallet className={styles.emptyStateIcon} />

                                <h3 className={styles.emptyStateTitle}>No Wallets Detected</h3>

                                <p className={styles.emptyStateDesc}>
                                    Install a Solana wallet extension to get started
                                </p>

                                <div className={styles.emptyStateActions}>
                                    <Button
                                        variant="outline"
                                        data-theme={theme}
                                        onClick={() => walletLinkOpen('Phantom')}
                                    >
                                        Get Phantom
                                    </Button>
                                    <Button
                                        data-theme={theme}
                                        variant="outline"
                                        onClick={() => walletLinkOpen('Backpack')}
                                    >
                                        Get Backpack
                                    </Button>
                                </div>


                            </div>
                        )}

                        <div className={styles.allWallets}>
                            {primaryWallets.map((connector) => (
                                <WalletButton
                                    key={connector.id}
                                    theme={theme}
                                    connector={connector}
                                    isThisConnecting={isConnecting && connectingConnectorId === connector.id}
                                    hasError={errorConnectorId === connector.id}
                                    isRecent={recentlyConnectedConnectorId === connector.id}

                                    onSelect={() => handleSelectWallet(connector)}
                                    getInstallUrl={getInstallUrl}
                                />
                            ))}
                        </div>

                        {otherWallets.length > 0 && (
                            <>
                                {primayOuterHr && <div className={styles.seprator} />}
                                <Collapsible
                                    open={isOtherWalletsOpen}
                                    onOpenChange={setIsOtherWalletsOpen}
                                    className={styles.Collapsible}
                                >
                                    <CollapsibleTrigger className={styles.hiddenExpand}>
                                        <span className={styles.textContainer}>Other Wallets</span>
                                        <HiddenWalletIcons wallets={otherWallets} className="shrink-0" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className={styles.allWallets}>
                                        {otherWallets.map((connector) => (
                                            <WalletButton
                                                key={connector.id}
                                                theme={theme}
                                                connector={connector}
                                                isThisConnecting={isConnecting && connectingConnectorId === connector.id}
                                                hasError={errorConnectorId === connector.id}
                                                isRecent={recentlyConnectedConnectorId === connector.id}
                                                onSelect={() => handleSelectWallet(connector)}
                                                getInstallUrl={getInstallUrl}
                                            />
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            </>
                        )}

                        {notReadyConnectors.length > 0 && (
                            <>
                                {(primaryWallets.length > 0 || otherWallets.length > 0) && (
                                    <div className={styles.seprator} />
                                )}

                                <div className="space-y-2">
                                    <h3 className={styles.sectionHeader}>
                                        {readyConnectors.length > 0 ? 'Unavailable Wallets' : 'Wallets'}
                                    </h3>

                                    <div className={styles.grid}>
                                        {notReadyConnectors.slice(0, 3).map((connector) => {
                                            const installUrl = getInstallUrl(connector.name);

                                            return (
                                                <div key={connector.id} className={styles.unavailableRow}>
                                                    {/* Left: Icon & Text */}
                                                    <div className={styles.walletInfo}>
                                                        <Avatar
                                                            width={40}
                                                            height={40}
                                                            src={connector.icon}
                                                            alt={connector.name}
                                                            theme={theme}
                                                        />
                                                        <div className="text-left">
                                                            <div className={styles.walletName}>
                                                                {connector.name}
                                                            </div>
                                                            <div className={styles.unavailableLabel}>
                                                                Not available
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Install Button */}
                                                    {installUrl && (
                                                        <Button
                                                            data-theme={theme}
                                                            variant="ghost"
                                                            size="sm"
                                                            className={styles.installButton}
                                                            onClick={() => window.open(installUrl, '_blank')}
                                                        >
                                                            <ExternalLink />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}


                    </div>
                )}

            </DialogContent>
        </Dialog >
    )

}

export default WalletModal


interface WalletItemProps {
    connector: WalletConnectorMetadata;
    isThisConnecting: boolean;

    hasError?: boolean;
    isRecent?: boolean;
    theme?: 'light' | 'dark';
    onSelect: () => void;
    getInstallUrl: (walletName: string, walletUrl?: string) => string | undefined;
}
function WalletButton(props: WalletItemProps) {
    const { connector, isThisConnecting, hasError, isRecent, theme, onSelect, getInstallUrl } = props;

    const handleSelectWallet = () => {
        onSelect();
    }
    return (
        <Button
            key={connector.id}
            variant="outline"
            data-error={hasError}
            data-theme={theme}
            className={styles.walletButton}
            onClick={handleSelectWallet}
            disabled={isThisConnecting}

        >
            {/* Left Side: Text Info */}
            <div className={styles.textContainer}>
                <div className={styles.nameRow}>
                    <span>{connector.name}</span>
                    {isRecent && <span className={styles.recentBadge}>Recent</span>}
                </div>

                {/* Status Text */}
                {isThisConnecting && (
                    <div className={styles.statusText}>Connecting...</div>
                )}
                {hasError && !isThisConnecting && (
                    <div className={styles.statusText} data-type="error">
                        Click to retry
                    </div>
                )}
            </div>

            <div className={styles.iconContainer}>
                {isThisConnecting && <Spinner />}
                <Avatar
                    width={40}
                    height={40}
                    src={connector.icon}
                    alt={connector.name}
                    theme={theme}
                />
            </div>

        </Button>
    )
}

interface WalletIconSource {
    id: string;
    name: string;
    icon?: string | null;
}
interface HiddenWalletIconsProps {
    wallets: WalletIconSource[];
    maxIcons?: number;
    className?: string;
}
export function HiddenWalletIcons({ wallets, maxIcons = 4, className }: HiddenWalletIconsProps) {
    const previewWallets = wallets.slice(0, maxIcons);
    const placeholderCount = Math.max(0, maxIcons - previewWallets.length);

    return (
        <div
            className={`${styles.hiddenWalletGrid} ${className || ''}`}
            aria-hidden="true"
        >
            {/* Render Actual Wallets */}
            {previewWallets.map(wallet => (
                <div
                    key={wallet.id}
                    className={styles.hiddenWalletIconWrapper}
                >
                    {wallet.icon && (
                        <img
                            height={10}
                            width={10}
                            src={wallet.icon}
                            alt={wallet.name}
                            draggable={false}
                            onError={(e: any) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                </div>
            ))}

            {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                    key={`placeholder-${index}`}
                    className={styles.hiddenWalletIconWrapper}
                />
            ))}
        </div>
    );
}