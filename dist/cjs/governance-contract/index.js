"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveGovernanceService = exports.parseProposal = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("ethers/lib/utils");
const BaseService_1 = (0, tslib_1.__importDefault)(require("../commons/BaseService"));
const ipfs_1 = require("../commons/ipfs");
const types_1 = require("../commons/types");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IAaveGovernanceV2__factory_1 = require("./typechain/IAaveGovernanceV2__factory");
const IGovernanceStrategy__factory_1 = require("./typechain/IGovernanceStrategy__factory");
const IGovernanceV2Helper__factory_1 = require("./typechain/IGovernanceV2Helper__factory");
const types_2 = require("./types");
const parseProposal = async (rawProposal) => {
    const { id, creator, executor, targets, values, signatures, calldatas, withDelegatecalls, startBlock, endBlock, executionTime, forVotes, againstVotes, executed, canceled, strategy, ipfsHash: ipfsHex, totalVotingSupply, minimumQuorum, minimumDiff, executionTimeWithGracePeriod, proposalCreated, proposalState, } = rawProposal;
    const proposalMetadata = await (0, ipfs_1.getProposalMetadata)(ipfsHex);
    const proposal = Object.assign({ id: Number(id.toString()), creator,
        executor,
        targets,
        values,
        signatures,
        calldatas,
        withDelegatecalls, startBlock: Number(startBlock.toString()), endBlock: Number(endBlock.toString()), executionTime: executionTime.toString(), forVotes: forVotes.toString(), againstVotes: againstVotes.toString(), executed,
        canceled,
        strategy, state: Object.values(types_2.ProposalState)[proposalState], minimumQuorum: minimumQuorum.toString(), minimumDiff: minimumDiff.toString(), executionTimeWithGracePeriod: executionTimeWithGracePeriod.toString(), proposalCreated: Number(proposalCreated.toString()), totalVotingSupply: totalVotingSupply.toString() }, proposalMetadata);
    return proposal;
};
exports.parseProposal = parseProposal;
class AaveGovernanceService extends BaseService_1.default {
    constructor(provider, config) {
        var _a;
        super(provider, IAaveGovernanceV2__factory_1.IAaveGovernanceV2__factory);
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
            txType: types_1.eEthereumTxType.GOVERNANCE_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async getProposals({ skip, limit, }) {
        const helper = IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        const result = await helper.getProposals(skip.toString(), limit.toString(), this.aaveGovernanceV2Address);
        const proposals = Promise.all(result.map(async (rawProposal) => (0, exports.parseProposal)(rawProposal)));
        return proposals;
    }
    async getVotingPowerAt({ user, block, strategy }) {
        const proposalStrategy = IGovernanceStrategy__factory_1.IGovernanceStrategy__factory.connect(strategy, this.provider);
        const power = await proposalStrategy.getVotingPowerAt(user, block.toString());
        return (0, utils_1.formatEther)(power);
    }
    async getTokensPower({ user, tokens }) {
        const helper = IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        return helper.getTokensPower(user, tokens);
    }
    async getVoteOnProposal({ proposalId, user }) {
        const govContract = this.getContractInstance(this.aaveGovernanceV2Address);
        return govContract.getVoteOnProposal(proposalId, user);
    }
}
(0, tslib_1.__decorate)([
    methodValidators_1.GovValidator,
    (0, tslib_1.__param)(0, (0, paramValidators_1.isEthAddress)('user')),
    (0, tslib_1.__param)(0, (0, paramValidators_1.is0OrPositiveAmount)('proposalId')),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Array)
], AaveGovernanceService.prototype, "submitVote", null);
(0, tslib_1.__decorate)([
    methodValidators_1.GovHelperValidator,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], AaveGovernanceService.prototype, "getProposals", null);
(0, tslib_1.__decorate)([
    methodValidators_1.GovValidator,
    (0, tslib_1.__param)(0, (0, paramValidators_1.isEthAddress)('user')),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], AaveGovernanceService.prototype, "getVotingPowerAt", null);
(0, tslib_1.__decorate)([
    methodValidators_1.GovHelperValidator,
    (0, tslib_1.__param)(0, (0, paramValidators_1.isEthAddress)('user')),
    (0, tslib_1.__param)(0, (0, paramValidators_1.isEthAddressArray)('tokens')),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], AaveGovernanceService.prototype, "getTokensPower", null);
(0, tslib_1.__decorate)([
    methodValidators_1.GovValidator,
    (0, tslib_1.__param)(0, (0, paramValidators_1.isEthAddress)('user')),
    (0, tslib_1.__param)(0, (0, paramValidators_1.is0OrPositiveAmount)('proposalId')),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], AaveGovernanceService.prototype, "getVoteOnProposal", null);
exports.AaveGovernanceService = AaveGovernanceService;
//# sourceMappingURL=index.js.map