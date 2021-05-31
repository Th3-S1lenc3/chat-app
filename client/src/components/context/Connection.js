import React, { Component, createContext } from 'react';
import { io } from 'socket.io-client';
import moment from 'moment';
import { Container, Row, Col } from 'react-bootstrap';

import titleCase from '@utilties/titleCase';
import {
  exportKey,
  importKey,
  importAESKey,
  generateRSAKeyPair,
  getKeySnippet,
  rsaDecrypt,
  aesDecrypt,
} from '@utilties/security';

export const ConnectionContext = createContext();

export default class ConnectionContextProvider extends Component {
  state = {
    notifications: [],
    messages: [],
    keys: [],
    publicKey: null,
    currentRoom: null,
  }

  uniqueKey() {
    const array = new Uint8Array(10);

    window.crypto.getRandomValues(array);

    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomColor() {
    const letters = '123456789ABCDEF';
    let color = '#';
    for (let i = 1; i <= 6; i++) {
      color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
  }

  randomColor() {
    return {
      color: this.getRandomColor(),
    }
  }


  addNotification(notification) {
    const timestamp = moment().format('HH:mm:ss');

    this.setState((prevState) => ({
      notifications: [
        ...prevState.notifications,
        <Container key={this.uniqueKey()} className="notification">
          <Row>
            <Col className="notification-timestamp">
              {timestamp} <span>{'>'}</span>
            </Col>
            <Col className="notification-text">
              {titleCase(notification)}
            </Col>
          </Row>
        </Container>
      ]
    }))
  }

  async addMessage({ text, recipients, sender }) {
    const { keys, publicKey } = this.state;

    let textColor = { color: 'white' };

    if (sender == 'ChatBot') {
      this.setState((prevState) => ({
        messages: [
          ...prevState.messages,
          <div key={this.uniqueKey()} className="chat-message">
            <div className="chat-message-user">
              <span style={textColor} >{sender}</span> <span>{'>'}</span>
            </div>
            <div className="chat-message-message">
              {text}
            </div>
          </div>
        ]
      }));
      return;
    }

    let decryptedText;

    if (publicKey && sender == publicKey.identifier) {
      textColor = publicKey.color;
    }
    else {
      for (let key in keys) {
        if (keys[key] && sender == keys[key].identifier) {
          textColor = keys[key].color;
          break;
        }
      }
    }

    for (let recipient in recipients) {
      if (recipients[recipient] && recipients[recipient].identifier == publicKey.identifier) {
        const { sessionKey } = recipients[recipient];

        const privateKey = await importKey('private', this.privateKey);

        const decryptedAESObjRaw = await rsaDecrypt(privateKey, sessionKey);
        let { exportedAESKey, iv } = JSON.parse(decryptedAESObjRaw);

        exportedAESKey = JSON.parse(exportedAESKey);

        const aesKey = await importAESKey(exportedAESKey);

        decryptedText = await aesDecrypt(aesKey, text, iv);
        break;
      }
    }

    this.setState((prevState) => ({
      messages: [
        ...prevState.messages,
        <div key={this.uniqueKey()} className="chat-message">
          <div className="chat-message-user">
            <span style={textColor} >{sender}</span> <span>{'>'}</span>
          </div>
          <div className="chat-message-message">
            {decryptedText}
          </div>
        </div>
      ]
    }));
  }

  addKey(key) {
    const keySnippet = getKeySnippet(key);

    this.setState((prevState) => ({
      keys: [
        ...prevState.keys,
        {
          identifier: keySnippet,
          pem: key,
          color: this.randomColor(),
        }
      ]
    }));
  }

  sendPublicKey(to) {
    const publicKey = this.publicKey;

    if (publicKey && !to) {
      this.state.socket.emit('PUBLIC_KEY', publicKey);
    }
    else if (to) {
      this.state.socket.emit('PUBLIC_KEY', publicKey, to);
    }
  }

  clearKeys() {
    this.setState({
      keys: [],
    });
  }

  clearChat() {
    this.setState({
      messages: [],
    });
  }

  clearNotifications() {
    this.setState({
      notifications: [],
    });
  }

  removeClientKeys() {
    this.privateKey = null;
    this.publicKey = null;
    this.setState({
      publicKey: null,
    });
  }

  leaveRoom() {
    this.setState({
      currentRoom: null,
    });
    this.clearChat();
    this.clearKeys();
    this.removeClientKeys();
  }

  componentDidMount() {
    const socket = io();

    const clean = (arr) => {
      arr = arr.filter(el => el);
      return arr;
    }

    this.setState({
      socket
    });

    socket.on('connect', () => {
      this.clearNotifications();
      this.addNotification('connected to server');
      if (!this.state.room) {
        this.addNotification('please enter a room to join');
      }
    });

    socket.on('disconnect', () => {
      this.addNotification('lost connection to server');
      this.clearKeys();
      this.clearChat();
    });

    socket.on('ERROR', (err) => {
      this.addNotification(err);
    });

    socket.on('MESSAGE', (message) => {
      this.addMessage(message);
    });

    socket.on('NEW_CONNECTION', (socketID) => {
      this.addNotification('another user joined the room. awaiting key for identification.');
      this.sendPublicKey(socketID);
    });

    socket.on('ROOM_JOINED', (room) => {
      this.addNotification(`joined room - ${room}`);
      this.setState({
        currentRoom: room,
      });
      generateRSAKeyPair().then(({ publicKey, privateKey }) => {
        exportKey('public', publicKey).then((publicKeyPem) => {
          this.publicKey = publicKeyPem;
          this.setState({
            publicKey: {
              identifier: getKeySnippet(publicKeyPem),
              pem: publicKeyPem,
              color: this.randomColor(),
            }
          });
          setTimeout(() => {this.sendPublicKey()}, 1);
        });
        exportKey('private', privateKey).then((privateKeyPem) => {
          this.privateKey = privateKeyPem;
        })
      });
    });

    socket.on('ROOM_LEFT', () => {
      this.addNotification(`left room - ${this.state.currentRoom}`);
      this.leaveRoom();
    })

    socket.on('PUBLIC_KEY', (key) => {
      this.addNotification(`public key received - ${getKeySnippet(key)}`);
      this.addKey(key);
    });

    socket.on('USER_DISCONNECTED', (keySnippet) => {
      console.log(`User Disconnected - ${keySnippet}`);
      const keys = this.state.keys;

      const newKeys = clean(keys.map((key, index) => {
        console.log(key);
        if (getKeySnippet(key.pem) == keySnippet) {
          return undefined;
        }
        else {
          return key;
        }
      }));

      this.setState((prevState) => ({
        keys: newKeys,
      }));

      this.addNotification(`user disconnected - ${keySnippet}`)
    });
  }

  render() {
    return (
      <ConnectionContext.Provider value={this.state}>
        {this.props.children}
      </ConnectionContext.Provider>
    )
  }

}
