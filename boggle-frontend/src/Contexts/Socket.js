//Purpose of this component: holds the actual socket component that will be passed around to all the relevant components

import { io } from 'socket.io-client';
const nodeserverURL = 'http://localhost:5000'; //TODO move this to the env var

export const socket = io(nodeserverURL, {
  autoConnect: false,
  extraHeaders: {
    authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
