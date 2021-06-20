import React, { useEffect, useState } from 'react';
import { Container, ListGroup, Row, Col, Card, Image, Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import houseOne from "../assets/house-1.jpeg"
import houseTwo from "../assets/house-2.jpeg"
import houseThree from "../assets/house-3.jpeg"
import houseFour from "../assets/house-4.jpeg"
import ContractHelper from './_ContractHelper';

function Marketplace({ mockData, marketplace }) {
    //styles
    const bg_sm = { backgroundColor: "lightgrey", opacity: '0.8' };
    const my_image = { objectFit: "cover", marginTop: "10px", height: "300px", width: "310px" }

    const [items, setItems] = useState(mockData);
    const [show, setShow] = useState(false);
    const [alert, setAlert] = useState({});
    const [selectedProject, setSelectedProject] = useState({});
    const [newProject, setNewProject] = useState({ name: '', totalSupply: 0 });
    const [buyingShares, setBuyingShares] = useState(undefined);

    const handleClose = () => setShow(false);

    const updateProjectName = e => {
        const val = e.target.value;
        setNewProject({ name: val, totalSupply: newProject.totalSupply });
    }

    const updateProjectTotalSupply = e => {
        const val = e.target.value;
        setNewProject({ name: newProject.name, totalSupply: parseInt(val) });
    }

    const createNewProject = async () => {
        const maxId = mockData[mockData.length - 1].pid;
        const newItem = {
            pid: maxId + 1,
            pName: newProject.name,
            totalSupply: newProject.totalSupply,
            avail: true,
            pImg: houseOne
        };

        const accounts = await ContractHelper.getAccounts();
        try {
            await marketplace.createNewPorject(
                newItem.pName,
                newItem.totalSupply
                , {
                    from: accounts[0]
                })

            mockData.push(newItem);
            setItems([...mockData]);

            showCustomAlert("success", "Project Saved!");

        } catch (e) {
            console.log(e)
        }
    }

    const showModal = () => {
        setBuyingShares(undefined);
        setShow(true);
    }

    const openBuyPage = async (item) => {

        try {

            const idx = mockData.findIndex(a => a.pid == item.pid);

            const info = await marketplace.projectInfo(idx);

            setSelectedProject({
                projectId: idx,
                projectName: info.projectName,
                unitPrice: window.web3.utils.BN(info.unitPrice).toNumber(),
                availShares: window.web3.utils.BN(info.totalSupply).toNumber(),
            });

            showModal();
        } catch (e) {
            console.log(e);
        }
    }

    const handleBuyShares = async () => {
        //update list (mockdata)

        try {

            if (buyingShares > selectedProject.availShares) {
                showCustomAlert("danger", "Not enought supply!");
                return;
            }

            const accounts = await ContractHelper.getAccounts();

            await marketplace.buySomeShares(selectedProject.projectId, buyingShares,
                {
                    from: accounts[0],
                    value: selectedProject.unitPrice * buyingShares
                });

            const item = mockData[selectedProject.projectId];
            item.totalSupply -= buyingShares;
            setItems([...mockData]);
            handleClose();

            showCustomAlert("success", "Transaction Was Successful!");

        } catch (e) {
            showCustomAlert("danger", "Not enough money!");
        }
    }

    const buySharesChanged = e => {
        const val = e.target.value;
        setBuyingShares(parseInt(val));
    }

    const showCustomAlert = (type, msg) => {
        setAlert({
            type: type,
            msg: msg
        });
        setTimeout(() => {
            setAlert({});
        }, 3000);
    }

    const CustomAlert = () => {
        return (
            alert.type ?
                <Alert variant={alert.type} >
                    {alert.msg}
                </Alert> : null
        );
    }

    return (
        <>
            <CustomAlert />
            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Buy Shares</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Project Name</Form.Label>
                            <br />
                            <b><Form.Label>{selectedProject.projectName}</Form.Label></b>
                            <br />
                            <Form.Label>Price</Form.Label>
                            <br />
                            <b><Form.Label>{selectedProject.unitPrice} Wei</Form.Label></b>
                            <br />
                            <Form.Label>Token Supply</Form.Label>
                            <br />
                            <b><Form.Label>{selectedProject.availShares}</Form.Label></b>
                            <br />
                            <Form.Control type="text" onChange={e => buySharesChanged(e)} placeholder="Number of buying shares" required />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary"
                        disabled={(!buyingShares) && "disabled"}
                        onClick={handleBuyShares}>
                        Buy Shares
                    </Button>
                </Modal.Footer>
            </Modal>
            <Container fluid style={bg_sm}>
                <Row>
                    <Col md={7}>
                        <Card>
                            <Card.Header>
                                <h5>Available Bidding Properties</h5>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup as="ul">
                                    {items.map((item, i) => (
                                        <ListGroup.Item key={i} as="li">
                                            <Row>
                                                <Col md={5}>
                                                    <Image thumbnail className="align-self-center" src={item.pImg} alt="house-1" />
                                                </Col>
                                                <Col md={7}>
                                                    <Table bordered condensed>
                                                        <tbody>
                                                            <tr>
                                                                <td>Property Name:</td>
                                                                <td>{item.pName}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Available shares:</td>
                                                                <td>{item.totalSupply}</td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>

                                                    <Row>
                                                        <Col>
                                                            <Button variant="primary" onClick={() => openBuyPage(item)}>Buy Shares</Button>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={5}>
                        <Card style={{ width: '32rem' }}>
                            <Card.Header>
                                <h5>Create New Project</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicText">
                                        <Form.Label>Projecte Name</Form.Label>
                                        <Form.Control type="text" onChange={e => updateProjectName(e)} placeholder="Projecte Name" required />
                                        <Form.Text className="text-muted">
                                            Enter a brand new project name.
                                        </Form.Text>
                                        <Form.Label>Total Supply</Form.Label>
                                        <Form.Control type="text" onChange={e => updateProjectTotalSupply(e)} placeholder="Total Supply" required />
                                        <Form.Text className="text-muted">
                                            Enter total supply for this project.
                                        </Form.Text>
                                        <Button variant="primary"
                                            disabled={(!newProject.name || !newProject.totalSupply) && "disabled"}
                                            onClick={createNewProject} type="button"> Create New </Button>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default Marketplace;