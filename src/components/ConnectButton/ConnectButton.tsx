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
    theme?: 'light' | 'dark';

    CN_ConnectButton?: string;
    CN_DropdownMenu?: string;
    CN_Modal?: string;

    connectText?: string;
    connectingText?: string;
    showSolBalance?: boolean;
}

export function ConnectButton(props: ConnectButtonProps) {
    const {
        CN_DropdownMenu,
        theme = 'light',
        CN_ConnectButton,
        connectText = "Connect Wallet",
        connectingText = "Connecting...",
        showSolBalance = false
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
                                CN_ConnectButton={CN_DropdownMenu}
                                selectedAccount={account}
                                walletIcon={walletIcon}
                                walletName={connector.name}
                                allowNetworkSwitch={true}
                                theme={theme}
                                showSolBalance={showSolBalance}
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
                walletConnectUri={walletConnectUri}
                onClearWalletConnectUri={clearWalletConnectUri}
            />

        </div>
    )
}

export default ConnectButton