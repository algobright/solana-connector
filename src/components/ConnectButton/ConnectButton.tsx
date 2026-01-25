"use client";

import { useState } from 'react';
import styles from './ConnectButton.module.css';
import { useConnector } from '@solana/connector';
import Button from '@shared/Button';
import Spinner from '@shared/Spinner';
import WalletModal from '@WalletModal';
import clsx from 'clsx';
import { Menu, MenuPopup, MenuPortal, MenuPositioner, MenuTrigger } from '@shared/Menu';
import Avatar from '@shared/Avatar';
import { ChevronDown } from 'lucide-react';
import WalletDropdown from '@WalletDropdown';

interface ConnectButtonProps {
    /** * The visual theme for the button and modals. 
     * @default 'light'
     */
    theme?: 'light' | 'dark';

    /** * Custom Tailwind or CSS class for the main button element. 
     * If not passed, standard kit styling is applied.
     */
    CN_ConnectButton?: string;

    /** * Custom CSS class for the dropdown menu. 
     * If not passed, it defaults to the standard dropdown layout.
     */
    CN_DropdownMenu?: string;

    /** * Custom CSS class for the connection modal. 
     * This modal displays all wallet options and the QR code for mobile linking.
     */
    CN_Modal?: string;

    /** * Initial text shown when the wallet is disconnected. 
     * @default "Connect Wallet"
     */
    connectText?: string;

    /** * Text displayed while the wallet is in the 'connecting' state. 
     * @default "Connecting..."
     */
    connectingText?: string;

    /** * If true, fetches and displays the native SOL balance. 
     * @default false
     */
    showSolBalance?: boolean;

    /** * If provided, displays a specific SPL token balance (e.g., USDC). 
     * If null/undefined, only SOL or no balance is shown.
     */
    showDefaultToken?: {
        address: string;
        symbol: string;
    };
}
export function ConnectButton(props: ConnectButtonProps) {
    const {
        CN_DropdownMenu,
        theme = 'light',
        CN_ConnectButton,
        connectText = "Connect Wallet",
        connectingText = "Connecting...",
        showSolBalance = false,
        showDefaultToken
    } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isConnected, isConnecting, account, connector, walletConnectUri, clearWalletConnectUri } = useConnector();

    if (isConnected && account && connector) {
        const shortAddress = `${account.slice(0, 4)}...${account.slice(-4)}`;
        const walletIcon = connector.icon || undefined;

        return (
            <Menu >
                <MenuTrigger render={
                    <Button
                        variant="outline"
                        size="sm"
                        data-theme={theme}
                        className={clsx(styles.connectButton, CN_ConnectButton)}
                    >
                        <Avatar
                            height={20}
                            width={20}
                            src={walletIcon}
                            alt={connector.name}
                            theme={theme}
                        />
                        <span >{shortAddress}</span>
                        <ChevronDown size={16} />
                    </Button>
                } />
                <MenuPortal>
                    <MenuPositioner sideOffset={8} align="end">
                        <MenuPopup theme={theme}>
                            <WalletDropdown
                                CN_DropdownMenu={CN_DropdownMenu}
                                allowNetworkSwitch={true}
                                theme={theme}
                                showSolBalance={showSolBalance}
                                showDefaultToken={showDefaultToken}
                            />
                        </MenuPopup>
                    </MenuPositioner>
                </MenuPortal>
            </Menu>
        );
    }

    const onOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            clearWalletConnectUri();
        }
    };

    return (
        <div>
            <Button
                variant='outline'
                size='sm'
                data-theme={theme}
                onClick={() => setIsModalOpen(true)}
                className={clsx(styles.connectButton, CN_ConnectButton)}
            >
                {isConnecting ? (
                    <span><Spinner />{connectingText}</span>
                ) : (
                    <span>{connectText}</span>
                )}
            </Button>

            <WalletModal
                theme={theme}
                open={isModalOpen}
                onOpenChange={onOpenChange}
            />

        </div>
    )
}

export default ConnectButton