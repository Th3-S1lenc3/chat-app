import React, { useState, useContext, useEffect } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

import { ConnectionContext } from '@context/Connection';
import {
  exportKey,
  exportAESKey,
  importKey,
  generateAESKey,
  getKeySnippet,
  rsaEncrypt,
  aesEncrypt,
} from '@utilties/security';

import './index.css';

export default function Message() {
  const { socket, publicKey, keys } = useContext(ConnectionContext);

  let messageContentSpan = null;

  const handleChange = (e) => {
    if (e.defaultPrevented) {
      return;
    }

    const key = e.key || e.code;

    if (key === 'Enter') {
      handleClick();
      e.preventDefault();
    }

    if (e.target.innerText.length >= 250) {
      e.preventDefault();
    }
  }

  const handleClick = () => {
    const message = document.querySelector('#messageContent').innerText;

    if (message && message !== '' && publicKey) {
      sendMessage(message);
      messageContentSpan.innerHTML = '';
    }
  }

  const sendMessage = async (message) => {
    const { identifier } = publicKey;

    const aesKey = await generateAESKey();
    const exportedAESKey = await exportAESKey(aesKey);

    const { encrypted: encryptedMessage, iv } = await aesEncrypt(aesKey, message);

    const aesKeyObj = {
      exportedAESKey,
      iv
    };

    const recipients = await Promise.all(keys?.map(async (key, index) => {
      const publicKey = await importKey('public', key.pem);

      const encryptedAESKeyObj = await rsaEncrypt(publicKey, JSON.stringify(aesKeyObj));

      return {
        identifier: getKeySnippet(key.pem),
        sessionKey: encryptedAESKeyObj,
      }
    }));

    const key = await importKey('public', publicKey.pem);

    const encryptedAESKeyObj = await rsaEncrypt(key, JSON.stringify(aesKeyObj));

    const selfRecipient = {
      identifier: getKeySnippet(publicKey.pem),
      sessionKey: encryptedAESKeyObj,
    }

    socket.emit('MESSAGE', {
      sender: identifier,
      recipients: [
        selfRecipient,
        ...recipients,
      ],
      text: encryptedMessage
    });
  }

  return (
    <div className="message">
      <InputGroup className="messageContent">
        <InputGroup.Prepend>
          <InputGroup.Text className="text-white">{'>'}</InputGroup.Text>
        </InputGroup.Prepend>
        <span
          ref={el => { messageContentSpan = el }}
          placeholder="Message"
          id="messageContent"
          className="form-control text-white"
          contentEditable={true}
          onKeyPress={e => handleChange(e)}
        />
      </InputGroup>
      <Button
        className="ml-auto mr-2"
        variant="secondary"
        onClick={handleClick}
      >
        Send
      </Button>
    </div>
  )
}
