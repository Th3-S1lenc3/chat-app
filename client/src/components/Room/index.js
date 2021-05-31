import React, { useContext, useEffect } from 'react';
import { Button, InputGroup } from 'react-bootstrap';
import classNames from 'classnames';

import { ConnectionContext } from '@context/Connection';

import './index.css';

export default function Room() {
  const { socket, currentRoom } = useContext(ConnectionContext);

  let roomNameSpan = null;

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
    const room = document.querySelector('#roomName').innerText;

    if (room && room !== '') {
      socket.emit('JOIN_ROOM', room)
    }

    roomNameSpan.innerHTML = '';
  }

  const leaveRoom = () => {
    if (currentRoom !== null) {
      socket.emit('LEAVE_ROOM', null);
    }
  }

  return (
    <div className="room">
      <InputGroup className="roomName">
        <InputGroup.Prepend>
          <InputGroup.Text className="text-white">{'>'}</InputGroup.Text>
        </InputGroup.Prepend>
        <span
          ref={el => {roomNameSpan = el}}
          placeholder={classNames({
            "Room Name": currentRoom === null,
            [`In Room - ${currentRoom}`]: currentRoom !== null,
          })}
          id="roomName"
          className="form-control text-white"
          contentEditable={true}
          onKeyPress={e => handleChange(e)}
        />
      </InputGroup>
      <Button
        className="ml-auto mr-1"
        variant="secondary"
        onClick={handleClick}
      >
        Join
      </Button>
      <Button
        className="mr-2"
        variant="secondary"
        onClick={leaveRoom}
        className={classNames({
          'hidden': currentRoom === null,
        })}
      >
        Leave
      </Button>
    </div>
  )
}
