import React, { useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import ConnectionContextProvider from '@components/context/Connection';

import Room from '@components/Room';
import Chat from '@components/Chat';
import Notification from '@components/Notification';
import Keys from '@components/Keys';
import Message from '@components/Message';

import './index.css';

export default function App() {
  return (
    <ConnectionContextProvider>
      <Container fluid className="App">
        <Row>
          <Room />
        </Row>
        <Row>
          <Col md={7} className="col">
            <Chat />
          </Col>
          <Col md={5} className="col">
            <Row>
              <Notification />
            </Row>
            <Row>
              <Keys />
            </Row>
          </Col>
        </Row>
        <Row>
          <Message />
        </Row>
      </Container>
    </ConnectionContextProvider>
  );
}
