import { base58 } from 'ethers/lib/utils';
import fetch from 'isomorphic-unfetch';
const ipfsEndpoint = 'https://cloudflare-ipfs.com/ipfs';
export function getLink(hash) {
    return `${ipfsEndpoint}/${hash}`;
}
const MEMORIZE = {};
export async function getProposalMetadata(hash) {
    const ipfsHash = base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
    if (MEMORIZE[ipfsHash])
        return MEMORIZE[ipfsHash];
    try {
        const ipfsResponse = await fetch(getLink(ipfsHash), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!ipfsResponse.ok) {
            throw Error('Fetch not working');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await ipfsResponse.json();
        if (!data.title) {
            throw Error('Missing title field at proposal metadata.');
        }
        if (!data.description) {
            throw Error('Missing description field at proposal metadata.');
        }
        if (!data.shortDescription) {
            throw Error('Missing shortDescription field at proposal metadata.');
        }
        MEMORIZE[ipfsHash] = Object.assign(Object.assign({}, data), { ipfsHash });
        return MEMORIZE[ipfsHash];
    }
    catch (e) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`@aave/contract-helpers: IPFS fetch Error: ${e}`);
        return {
            ipfsHash,
            title: `Proposal - ${ipfsHash}`,
            description: `Proposal with invalid metadata format or IPFS gateway is down`,
            shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
            aip: 0,
            author: `Proposal with invalid metadata format or IPFS gateway is down`,
            discussions: `Proposal with invalid metadata format or IPFS gateway is down`,
        };
    }
}
//# sourceMappingURL=ipfs.js.map