import React, { useState } from 'react';
import { Container, Row, Card, Col, ListGroup, Table, Form, Image, Button, Alert, Modal } from 'react-bootstrap';
import houseOne from "../assets/house-1.jpeg"
import houseTwo from "../assets/house-2.jpeg"
import houseThree from "../assets/house-3.jpeg"
import houseFour from "../assets/house-4.jpeg"
import ContractHelper from './_ContractHelper';

const images = [houseOne, houseTwo, houseThree, houseFour];

// { pid: 1, pName: 'Beach House Bidding Option', maxBid: 3400, pImg: houseOne },
// { pid: 2, pName: 'Royal Villa Bidding Option', maxBid: 2800, pImg: houseTwo },
// { pid: 3, pName: 'Residency Bidding Option', maxBid: 5200, pImg: houseThree },
// { pid: 4, pName: 'Luxurious Bunglow Bidding Option', maxBid: 2000, pImg: houseFour }

const Bidding = ({ mockData, marketplace }) => {
    const bg_sm = { backgroundColor: "lightgrey", opacity: '0.8' };

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState(mockData);
    const [alert, setAlert] = useState({});
    const [show, setShow] = useState(false);
    const [selectedBid, setSelectedBid] = useState({});
    const [numBids, setNumBids] = useState(0);
    const [newBidding, setNewBidding] = useState(undefined);

    const initData = async () => {
        try {
            const total = await marketplace.totalBiddings();
            const length = window.web3.utils.BN(total).toNumber();
            const itemList = [];

            for (let i = 0; i < length; i++) {
                const item = await marketplace.biddings(i);
                const exists = await marketplace.biddingExists(i);
                const winner = await marketplace.winner(i);

                itemList.push({
                    name: item,
                    exists: exists,
                    winner: winner,
                    pImg: images[i % images.length]
                });
            }

            setItems([...itemList]);

        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    initData();


    const updateNewBidding = e => {
        const val = e.target.value;
        setNewBidding(val);
    }

    const submitNewBidding = () => {
        try {

            if (!newBidding) return;
            setLoading(true);

            (async () => {

                const accounts = await ContractHelper.getAccounts();
                await marketplace.createBidding(newBidding, { from: accounts[0] });

            })().then(() => {
                setNewBidding('');

                const newList = [...items];
                newList.push({
                    name: newBidding,
                    exists: true,
                    winner: undefined,
                    pImg: images[(items.length - 1) % images.length]
                });

                setItems(newList);

                showCustomAlert("success", "New Bidding Added!");
            });


        } catch (error) {
            console.log(error)
        }
    }

    const openBidding = (item, i) => {

        setSelectedBid({
            name: item.name,
            id: i
        });

        setShow(true);
    }

    const closeBidding = (item, i) => {

        (async () => {
            try {
                const accounts = await ContractHelper.getAccounts();
                await marketplace.closeBidding(i, { from: accounts[0] });

                item = items[i];
                item.exists = false;
                item.winner = await marketplace.winner(i);

                setItems([...items]);

                showCustomAlert("success", "Bidding Closed Successfully!");
            } catch (error) {
                showCustomAlert("danger", "Only Owner can close Bidding");
            }
        })();
    }

    const biddingTokenChanged = e => {
        const val = e.target.value;
        setNumBids(parseInt(val));
    }

    const handleSetBid = () => {

        if (!numBids) return;


        (async () => {

            try {
                const accounts = await ContractHelper.getAccounts();
                await marketplace.bid(selectedBid.id, numBids, { from: accounts[0] });

                handleClose();
                showCustomAlert("success", "Your Bidding Is Saved!");

            } catch (error) {

                if ((error && error.message || '').indexOf('!enough') > -1)
                    showCustomAlert("danger", "Not enough tokens to bid more!");
                else showCustomAlert("danger", "You are not property owner!");
            }

        })();
    }

    const handleClose = () => setShow(false);

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
                    <Modal.Title>Bidding Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Item Name</Form.Label>
                            <br />
                            <b><Form.Label>{selectedBid.name}</Form.Label></b>
                            <br />
                            <Form.Label>Bidding Tokens:</Form.Label>
                            <Form.Control type="text" onChange={e => biddingTokenChanged(e)} placeholder="Number of bidding tokens" required />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary"
                        disabled={(!numBids) && "disabled"}
                        onClick={handleSetBid}>
                        Set Bid
                    </Button>
                </Modal.Footer>
            </Modal>
            <Container fluid style={bg_sm}>
                <Row>
                    <Col md={7}>
                        {loading ? 'Loading...' :
                            <Card>
                                <Card.Header>
                                    <h5>Available Bidding Properties</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup as="ul">
                                        {items.map((item, i) => (
                                            <ListGroup.Item key={i} as="li" className="m-2">
                                                <Row>
                                                    <Col md={5}>
                                                        <Image thumbnail className="align-self-center" src={item.pImg} alt="house-1" />
                                                    </Col>
                                                    <Col md={7}>
                                                        <Table bordered condensed>
                                                            <tbody>
                                                                <tr>
                                                                    <td>Title:</td>
                                                                    <td>{item.name}</td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                        {item.exists ?
                                                            <Row>
                                                                <Col md={3}>
                                                                    <Button variant="primary" onClick={() => openBidding(item, i)}>Send Request</Button>
                                                                </Col>
                                                                <Col md={{ offset: 3, span: 3 }}>
                                                                    <Button variant="warning" onClick={() => closeBidding(item, i)}>Close Bidding</Button>
                                                                </Col>
                                                            </Row> :
                                                            <Row>
                                                                <Col md={12}>
                                                                    <Form.Text>
                                                                        Winner:
                                                                        <b>
                                                                            {item.winner}
                                                                        </b>
                                                                    </Form.Text>
                                                                </Col>
                                                            </Row>
                                                        }
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        }
                    </Col>
                    <Col md={5}>
                        <Card style={{ width: '32rem' }}>
                            <Card.Header>
                                <h5>New Bidding</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicText">
                                        <Form.Label>Bidding Title:</Form.Label>
                                        <Form.Control type="text" onChange={e => updateNewBidding(e)} placeholder="Enter Title" required />
                                        <Form.Text className="text-muted">
                                            Enter a title for new bidding
                                        </Form.Text>
                                        <Button variant="primary" onClick={submitNewBidding} type="button"> Submit </Button>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Bidding;