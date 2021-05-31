import React, { Fragment, useState, useContext, useEffect } from 'react';

import { ConnectionContext } from '@context/Connection';

import './index.css';

export default function Chat() {
  const { socket, messages } = useContext(ConnectionContext);

  return (
    <div className="border border-secondary chat p-1">
      {messages}
    </div>
  )
}
