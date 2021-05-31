import React, { useContext, useEffect, useMemo } from 'react';
import { Accordion, Card } from 'react-bootstrap';

import { ConnectionContext } from '@context/Connection';

import './index.css';

export default function Keys() {
  const { socket, keys, publicKey, currentRoom } = useContext(ConnectionContext);

  const formatedKeys = useMemo(() => keys.map(
    ({ identifier, pem, color }, index) => {
      return (
        <Card
          key={index}
          className="key"
          style={color}
        >
          <Accordion.Toggle
            className="key-identifier"
            as={Card.Header}
            eventKey={index.toString()}
          >
            {identifier}
          </Accordion.Toggle>
          <Accordion.Collapse
            className="key-pem"
            eventKey={index.toString()}
          >
            <Card.Body>{pem}</Card.Body>
          </Accordion.Collapse>
        </Card>
      );
    }), [keys]);

  const formatedPublicKey = useMemo(() => {
    if (publicKey) {
      const { identifier, pem, color } = publicKey;

      return (
        <Card
          key={-1}
          className="key"
          style={color}
        >
          <Accordion.Toggle
            className="key-identifier"
            as={Card.Header}
            eventKey={'-1'}
          >
            {identifier}
          </Accordion.Toggle>
          <Accordion.Collapse
            className="key-pem"
            eventKey={'-1'}
          >
            <Card.Body>{pem}</Card.Body>
          </Accordion.Collapse>
        </Card>
      );
    }
    else if (currentRoom !== null){
      return (
        <Card
          key={-1}
          className="key"
        >
          <Card.Header>
            Generating Keys
          </Card.Header>
        </Card>
      );
    }
    else {
      return (
        <Card
          key={-1}
          className="key"
        >
          <Card.Header>
            Will Generate Keys When In A Room
          </Card.Header>
        </Card>
      );
    }
  }, [publicKey]);

  return (
    <div className="border border-secondary keys p-1">
      <h3><strong>KEYS</strong></h3>
      <Accordion>
        <h4><strong>Your Key</strong></h4>
        {formatedPublicKey}
        <h4><strong>Other Users Keys</strong></h4>
        {formatedKeys}
      </Accordion>
    </div>
  )
}
