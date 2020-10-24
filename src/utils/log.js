const [_log, _debug, _error] =
  process.env.REACT_APP_ENVIRONMENT === "DEVELOPMENT"
    ? [console.log, console.debug, console.error]
    : [() => {}, () => {}, () => {}];

export { _log, _debug, _error };
