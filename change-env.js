/*
 * Permette di cambiare ambiente momentaneamente, ed eseguire una callback con le nuove impostazioni.
 * Utile per esempio nei test, che sono eseguiti in ambiente dev,
 * ma ci si vuole accertare che in ambiente test/staging o prod si abbia un risultato diverso,
 * come ad esempio module.exports di solo una parte delle funzionalità
 */

/* global process */

/// implementare cambio di funzione asseconda della lista arg passati. es possono no passare env, o passare env e anche path require da fare delete. ecc
// implementare path_require anche come array, per permettere di eliminare cache di più require
// analizzare il possibile utilizzo con moduli ecma

function importaRequireDalModuloChiamante(oggetto_require){
  return function(...args){
    return ChangeEnv(oggetto_require, ...args);
  };
}

function ChangeEnv(require_del_chiamante, new_env, callback, path_require){
  const env_to_return = process.env.NODE_ENV;
  let path_resolved;
  let cache;
  process.env.NODE_ENV = new_env;

  if(typeof path_require === 'string'){
    path_resolved = require_del_chiamante.resolve(path_require);
    cache = require_del_chiamante.cache[path_resolved];
    delete require_del_chiamante.cache[path_resolved];
  }
  if(path_require === undefined){
    ////cache = estraiAndRitornaKeysCacheTranneMain(require_del_chiamante); 
  }

  callback();
  
  process.env.NODE_ENV = env_to_return;
  if(typeof path_require === 'string'){
    require_del_chiamante.cache[path_resolved] = cache;
  }
  if(path_require === undefined){
    ////ripopolaCache(require_del_chiamante, cache); ///per adesso sembra non funzionare.
  }
}

function estraiAndRitornaKeysCacheTranneMain(require_obj){
  const da_rimanere = require_obj.main.filename;
  const eliminati = {};
  for(let id in require_obj.cache){
    if(id !== da_rimanere){
      eliminati[id] = require_obj.cache[id];
      delete require_obj.cache[id];
    }
  }
  return eliminati;
}
function ripopolaCache(require_obj, cache){
  for(let id in cache){
    require_obj[id] = cache[id];
  }
}

module.exports.ChangeEnv = importaRequireDalModuloChiamante;

