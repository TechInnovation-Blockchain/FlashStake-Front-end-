export const txnsReducer = (
  state = {
    queue: {},
  },
  { type, payload }
) => {
  switch (type) {
    case "ADD_TXN_QUEUE":
      return {
        ...state,
        queue: { ...state.queue, [payload.hash]: payload },
      };
    case "UPDATE_TXN_STATUS":
      return {
        ...state,
        queue: {
          ...state.queue,
          [payload.hash]: { ...state.queue[payload.hash], ...payload.updates },
        },
      };
    default:
      return state;
  }
};
