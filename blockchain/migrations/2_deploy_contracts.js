const EscrowContract = artifacts.require('./Escrow.sol')

module.exports = (deployer, accounts) => {
  deployer.deploy(EscrowContract);
}
