import { __decorate, __metadata, __param } from "tslib";
import { formatEther } from 'ethers/lib/utils';
import BaseService from '../commons/BaseService';
import { getProposalMetadata } from '../commons/ipfs';
import { eEthereumTxType, } from '../commons/types';
import { GovHelperValidator, GovValidator, } from '../commons/validators/methodValidators';
import { is0OrPositiveAmount, isEthAddress, isEthAddressArray, } from '../commons/validators/paramValidators';
import { IAaveGovernanceV2__factory } from './typechain/IAaveGovernanceV2__factory';
import { IGovernanceStrategy__factory } from './typechain/IGovernanceStrategy__factory';
import { IGovernanceV2Helper__factory } from './typechain/IGovernanceV2Helper__factory';
import { ProposalState, } from './types';
export const parseProposal = async (rawProposal) => {
    const { id, creator, executor, targets, values, signatures, calldatas, withDelegatecalls, startBlock, endBlock, executionTime, forVotes, againstVotes, executed, canceled, strategy, ipfsHash: ipfsHex, totalVotingSupply, minimumQuorum, minimumDiff, executionTimeWithGracePeriod, proposalCreated, proposalState, } = rawProposal;
    const proposalMetadata = await getProposalMetadata(ipfsHex);
    const proposal = Object.assign({ id: Number(id.toString()), creator,
        executor,
        targets,
        values,
        signatures,
        calldatas,
        withDelegatecalls, startBlock: Number(startBlock.toString()), endBlock: Number(endBlock.toString()), executionTime: executionTime.toString(), forVotes: forVotes.toString(), againstVotes: againstVotes.toString(), executed,
        canceled,
        strategy, state: Object.values(ProposalState)[proposalState], minimumQuorum: minimumQuorum.toString(), minimumDiff: minimumDiff.toString(), executionTimeWithGracePeriod: executionTimeWithGracePeriod.toString(), proposalCreated: Number(proposalCreated.toString()), totalVotingSupply: totalVotingSupply.toString() }, proposalMetadata);
    return proposal;
};
export class AaveGovernanceService extends BaseService {
    constructor(provider, config) {
        var _a;
        super(provider, IAaveGovernanceV2__factory);
        this.aaveGovernanceV2Address = config.GOVERNANCE_ADDRESS;
        this.aaveGovernanceV2HelperAddress = (_a = config.GOVERNANCE_HELPER_ADDRESS) !== null && _a !== void 0 ? _a : '';
    }
    submitVote({ user, proposalId, support }) {
        const txs = [];
        const govContract = this.getContractInstance(this.aaveGovernanceV2Address);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => govContract.populateTransaction.submitVote(proposalId, support),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: eEthereumTxType.GOVERNANCE_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async getProposals({ skip, limit, }) {
        const helper = IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        const result = await helper.getProposals(skip.toString(), limit.toString(), this.aaveGovernanceV2Address);
        const proposals = Promise.all(result.map(async (rawProposal) => parseProposal(rawProposal)));
        return proposals;
    }
    async getVotingPowerAt({ user, block, strategy }) {
        const proposalStrategy = IGovernanceStrategy__factory.connect(strategy, this.provider);
        const power = await proposalStrategy.getVotingPowerAt(user, block.toString());
        return formatEther(power);
    }
    async getTokensPower({ user, tokens }) {
        const helper = IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        return helper.getTokensPower(user, tokens);
    }
    async getVoteOnProposal({ proposalId, user }) {
        const govContract = this.getContractInstance(this.aaveGovernanceV2Address);
        return govContract.getVoteOnProposal(proposalId, user);
    }
}
__decorate([
    GovValidator,
    __param(0, isEthAddress('user')),
    __param(0, is0OrPositiveAmount('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], AaveGovernanceService.prototype, "submitVote", null);
__decorate([
    GovHelperValidator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getProposals", null);
__decorate([
    GovValidator,
    __param(0, isEthAddress('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getVotingPowerAt", null);
__decorate([
    GovHelperValidator,
    __param(0, isEthAddress('user')),
    __param(0, isEthAddressArray('tokens')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getTokensPower", null);
__decorate([
    GovValidator,
    __param(0, isEthAddress('user')),
    __param(0, is0OrPositiveAmount('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getVoteOnProposal", null);
//# sourceMappingURL=index.js.map