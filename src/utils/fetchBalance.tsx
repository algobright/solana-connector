import { address, ConnectorClient, lamportsToSol } from "@solana/connector";
import { createSolanaRpc, getAddressEncoder, getProgramDerivedAddress } from "@solana/kit";

export async function getSolBalance(
    client: ConnectorClient,
    pubkey: string
): Promise<number> {
    let balance = 0;
    try {
        const rpcUrl = client.getRpcUrl();
        if (!rpcUrl) {
            console.error("RPC URL is not available from the ConnectorClient.");
            return 0;
        }
        const pubkeyAddress = address(pubkey);
        const rpc = createSolanaRpc(rpcUrl);
        const balanceResponse = await rpc.getBalance(pubkeyAddress).send();
        balance = lamportsToSol(balanceResponse.value);
    } catch (error) {
        console.error("Error fetching SOL balance:", error);
    } finally {
        return balance;
    }
}


export const SPL_ASSOCIATED_TOKEN_PROGRAM_ADDRESS = address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

export async function getTokenBalance(
    client: ConnectorClient,
    pubkey: string,
    mintAddress: string
): Promise<number> {
    let balance = 0;
    try {
        const rpcUrl = client.getRpcUrl();
        if (!rpcUrl) {
            console.error("RPC URL is not available from the ConnectorClient.");
            return 0;
        }
        const pubkeyAddress = address(pubkey);
        const mintPubkey = address(mintAddress);
        const rpc = createSolanaRpc(rpcUrl);

        const mintInfo = await rpc.getAccountInfo(
            mintPubkey,
            { encoding: "base64" }
        ).send();

        const ownerProgram = mintInfo.value?.owner;
        if (!ownerProgram) {
            throw new Error('Failed to fetch mint account info');
        }
        const tokenProgram = address(ownerProgram)
        const [tokenPDA] = await getProgramDerivedAddress({
            programAddress: SPL_ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
            seeds: [
                getAddressEncoder().encode(pubkeyAddress),
                getAddressEncoder().encode(tokenProgram),
                getAddressEncoder().encode(mintPubkey)
            ]
        })

        const tokenBalance = await rpc.getTokenAccountBalance(tokenPDA).send();
        if (tokenBalance.value) {
            balance = parseFloat(tokenBalance.value.uiAmountString);
        }
    } catch (error) {
        console.error("Error fetching token balance:", error);
    } finally {
        return balance;
    }
}