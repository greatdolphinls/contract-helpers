export declare function getLink(hash: string): string;
export declare type ProposalMetadata = {
    title: string;
    description: string;
    shortDescription: string;
    ipfsHash: string;
    aip: number;
    discussions: string;
    author: string;
};
export declare function getProposalMetadata(hash: string): Promise<ProposalMetadata>;
//# sourceMappingURL=ipfs.d.ts.map