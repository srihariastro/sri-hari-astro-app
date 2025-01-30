import * as actionTypes from '../actionTypes/CustomerActionTypes';

const initialState = {
  customerData: null,
  firebaseId: null,
  wallet: 0,
  invoiceId: null,
  notificationData: null,
  notificationCounts: 0,
};

const customer = (state = initialState, action) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.SET_CUSTOMER_DATA:
      return {
        ...state,
        customerData: payload,
      };
    case actionTypes.SET_FIREBASE_ID:
      return {
        ...state,
        firebaseId: payload,
      };
    case actionTypes.SET_WALLET:
      return {
        ...state,
        wallet: payload,
      };
    case actionTypes.SET_CALL_INVOICE_ID:
      return {
        ...state,
        invoiceId: payload,
      };
    case actionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notificationData: payload,
      };
    case actionTypes.SET_NOTIFICATION_COUNTS:
      return {
        ...state,
        notificationCounts: payload,
      };
    default:
      return state;
  }
};

export default customer;
