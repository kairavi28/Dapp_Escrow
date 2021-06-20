//import ContractHelper from '../_ContractHelper';
import React from 'react';
import {Container} from 'react-bootstrap';
import ContractHelper from './_ContractHelper';

const escrow = ({ escrow }) => {
    const bg_sm = { backgroundColor: "lightgrey", opacity: '0.8' };
return(
    <>
    <Container style={bg_sm}>
        <p>Escrow contract - escrow.js</p>
    </Container>
    </>
)
}

export default escrow;