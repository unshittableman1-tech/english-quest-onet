const disabledError = (reason) => ({ message: reason, code: 'backend_disabled' });

function disabledQuery(reason) {
  const result = { data: null, error: disabledError(reason) };
  const query = new Proxy({}, {
    get(_target, property) {
      if (property === 'then') return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      if (property === 'catch') return (reject) => Promise.resolve(result).catch(reject);
      if (property === 'finally') return (handler) => Promise.resolve(result).finally(handler);
      return () => query;
    },
  });
  return query;
}

export function createDisabledSupabase(reason = 'Backend access is disabled') {
  const authResult = () => Promise.resolve({ data: { user: null, session: null }, error: disabledError(reason) });
  const channel = {
    on() { return channel; },
    subscribe() { return channel; },
    send() { return Promise.resolve({ status: 'error' }); },
  };

  return Object.freeze({
    __disabled: true,
    __disabledReason: reason,
    auth: {
      getUser: authResult,
      getSession: authResult,
      signInWithPassword: authResult,
      signOut: authResult,
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
    },
    from() { return disabledQuery(reason); },
    rpc() { return Promise.resolve({ data: null, error: disabledError(reason) }); },
    channel() { return channel; },
    removeChannel() { return Promise.resolve('ok'); },
  });
}
