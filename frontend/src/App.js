import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from "history";
import Nav from './components/Navigation';
import ContractHelper from './components/_ContractHelper';
import Escrow from './components/escrow';
import { useEffect, useState } from 'react';

const appHistory = createBrowserHistory();

let escrow = undefined;

function App() {

  const [loading, setLoading] = useState(true);
  useEffect(() => {

    const initContracts = async () => {
      const contracts = await ContractHelper.init();
      escrow = await contracts.Escrow.deployed();
      const accounts = await ContractHelper.getAccounts();

      try {
        //do not init if theres something available
        console.log(accounts);
        console.log("hey");

        // for (let i = 0; i < length; i++) {
        //   const info = await escrow.projectInfo(i);
        //   if (mockDataProject[i]) {
        //     mockDataProject[i].totalSupply = window.web3.utils.BN(info.totalSupply).toNumber();
        //   }
        //   else {
        //     mockDataProject.push(
        //       {
        //         pid: i + 1,
        //         pName: info.projectName,
        //         totalSupply: window.web3.utils.BN(info.totalSupply).toNumber(),
        //         avail: true,
        //         pImg: houseThree
        //       })
        //   }
        // }
      }
      catch (e) {
        // fillMockData(accounts);
      }

      setLoading(false);
    }

    if (!(escrow && escrow.address)) {
      initContracts();
    }
    else setLoading(false);
  })

  return (
    <>
    <Nav/>
      {loading ? 'Loading....' :
        <BrowserRouter history={appHistory}>
            {/* <Route exact path='/' component={} /> */}
            <Route exact path='/escrow' component={() => <Escrow escrow={escrow} />} />
        </BrowserRouter>
      }
    </>
  );
}


export default App;
