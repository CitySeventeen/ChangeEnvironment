const ChangeEnv = require('./lib/change-env.js');
///const requireChangeEnv = require('./lib/requireChangeEnv.js'); da sviluppare


function injectRequireForChangeEnv(oggetto_require){
  return function(...args){
    return ChangeEnv(oggetto_require, ...args);
  };
}


module.exports = injectRequireForChangeEnv;
///module.exports.to = requireChangeEnv; da sviluppare
