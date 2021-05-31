import React, { Fragment, useContext, useEffect } from 'react';

import { ConnectionContext } from '@context/Connection';

import './index.css';

export default function Notification() {
  const { socket, notifications } = useContext(ConnectionContext);

  return (
    <div className="border border-secondary notification-list p-1">
      <h3><strong>NOTIFICATION LOG</strong></h3>
      {notifications}
    </div>
  )
}
