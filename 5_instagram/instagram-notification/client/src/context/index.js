import { createContext, useReducer } from 'react';
import { AUTH_INFO } from './action';

export const Context = createContext({});

const initialState = {
  userName: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_INFO:
      return {
        ...state,
        userName: action.payload,
      };
    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Context.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};
