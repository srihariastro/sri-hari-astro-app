import { io } from 'socket.io-client';
import { base_url } from '../config/Constants';
import { resetToScreen } from '../navigations/NavigationServices';
import { showToastMessage } from './services';
import * as ChatActions from '../redux/actions/ChatActions'
// const SOCKET_URL = 'http://localhost:4000/';
// const SOCKET_URL = base_url;
const SOCKET_URL = "ws://145.223.22.200:5000";

class WSService {

  initializeSocket = async (dispatch) => {
    try {
      console.log('Initializing Socket Connection...');  // <-- ADD THIS

      this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
      });

      this.socket.on('connect', () => {
          console.log('✅ Socket Connected!');
      });

      this.socket.on('disconnect', (reason) => {
          console.log('❌ Socket Disconnected:', reason);
      });

      this.socket.on('error', (error) => {
          console.log('⚠️ Socket Error:', error);
      });

      this.socket.on('reconnect_attempt', () => {
        console.log('Attempting to reconnect...');
      });

      this.socket.on('reconnect_error', (error) => {
        console.log('Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.log('Reconnection failed');
        // this.handleReconnectionFailed(dispatch);
      });

      this.socket.on('new_customer_login', data => {
        // dispatch(UserActions.checkCustomerLoginSession(data))
      })

      this.socket.on('new_astrologer_login', data => {
        // dispatch(AstroActions.check_astrologer_login_session(data))
      })

      this.socket.on('onChatReject', data => {
        // dispatch(ChatActions.setCountDownValue(data));
        resetToScreen('providerHome')
        showToastMessage({ message: 'Chat not connected' })
      });


      this.socket.on('updateChatTimer', data => {
        console.log("datatimer12>", data);
        
        dispatch(ChatActions.setChatTimerCountdown(data));
      });


      this.socket.on('timerStopped', data => {
        dispatch(ChatActions.onCloseChat());
      });

      this.socket.on('chatEnded', data => {
        dispatch(ChatActions.onCloseChat());
      });

      this.socket.on('walletAlert', data => {
        // dispatch(ChatActions.setChatWalletAlert(data))
      })

      this.socket.on('error', data => {
        console.log('Socket Error', data);
      });
    } catch (e) {
      console.log('socket is not initilized', e);
    }
  };

  emit(event, data = {}) {
    console.log(data);
    this.socket.emit(event, data);
  }

  removeListener(listenerName) {
    this.socket.removeAllListeners(listenerName);
  }
}

const socketServices = new WSService();

export default socketServices;
