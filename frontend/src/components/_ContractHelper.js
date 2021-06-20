import axios from 'axios';
import Web3 from 'web3';
import TruffleContract from 'truffle-contract';

const InitWeb3 = async () => {
    let MainProvider = {};

    if (window.ethereum) {
        MainProvider.web3Provider = window.ethereum;
        try {
            await window.ethereum.enable();
        } catch (error) {
            console.error("User denied account access")
        }
    }
    else if (window.web3) {
        MainProvider.web3Provider = window.web3.currentProvider;
    }
    else {
        //using Ganache
        MainProvider.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
	
    window.web3 = new Web3(MainProvider.web3Provider);

    return MainProvider;
};

const GetContract = async (MainProvider, name) => {

    let artifact = await axios.get(`http://localhost:3300/${name}`);

    let contract = TruffleContract(artifact.data);
    contract.setProvider(MainProvider.web3Provider)

    return contract
}

const ContractHelper = {
    init: async () => {

        let MainProvider = await InitWeb3();

        return {
            Escrow: await GetContract(MainProvider, 'escrow')
        }
    },
    getAccounts: async () => {
        return await window.web3.eth.getAccounts();
    }
}


export default ContractHelper;