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

const assert = require('assert');

function ChangeEnv(require_del_chiamante, new_env, callback, path_require=undefined){
  checkArgs(require_del_chiamante, new_env, callback, path_require);
  const previous_env = {env: undefined, modules: {}};
  saveAndModifyEnvironmentVar(previous_env, new_env);
  saveAndDeleteModuleFromCache(previous_env, path_require, require_del_chiamante);

  let returned_value_of_callback = eseguiCallback(callback);
  
  restoreEnvironmentVar(previous_env);
  restoreCache(previous_env, require_del_chiamante);
  
  return returned_value_of_callback;
}
function checkArgs(require_del_chiamante, new_env, callback, path_require){
  assert(typeof require_del_chiamante === 'function', `primo argomento deve essere un la require function`);
  assert(typeof new_env === 'string', 'secondo argomento deve essere una stringa');
  assert(typeof callback === 'function', 'terzo argomento deve essere una funzione');
  assert(path_require === undefined || typeof path_require === 'string' || Array.isArray(path_require), 'ultimo argomento deve essere stringa o array di stringhe');
}
function saveAndModifyEnvironmentVar(previous_env, new_env){
  const previous_env_var = process.env.NODE_ENV;
  process.env.NODE_ENV = new_env;
  previous_env.env = previous_env_var;
}
function saveAndDeleteModuleFromCache(previous_env, paths_require, require_del_chiamante){
  if(!Array.isArray(paths_require)) paths_require = [paths_require];
  let cache_saved = {};
  for(let path_require of paths_require){
    if(typeof path_require === 'string'){
      let path_resolved = require_del_chiamante.resolve(path_require);
      let module_in_cache = require_del_chiamante.cache[path_resolved];
      delete require_del_chiamante.cache[path_resolved];
 
      cache_saved[path_resolved] = module_in_cache;
    }
    
    
    if(path_require === undefined){
     ////throw new Error('da sviluppare'); //// al momento non fa nulla
      ////cache = estraiAndRitornaKeysCacheTranneMain(require_del_chiamante); 
    }

  }
  return previous_env.modules = cache_saved;
}
function eseguiCallback(callback){
  assert(typeof callback === 'function');
  return callback();
}
function restoreEnvironmentVar(previous_env){
  assert(typeof previous_env.env === 'string');
  process.env.NODE_ENV = previous_env.env;
}
function restoreCache(previous_env, require_del_chiamante){
  assert(typeof previous_env === 'object');
  assert('modules' in previous_env);
  assert(typeof previous_env.modules === 'object');
  
  for(let path_mod in previous_env.modules)
    require_del_chiamante.cache[path_mod] = previous_env.modules[path_mod];
  
}

/// da usare quando risolvo problema cancellazione cache che non forza il ricalcolo del require
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

module.exports = injectRequireForChangeEnv;

function injectRequireForChangeEnv(oggetto_require){
  return function(...args){
    return ChangeEnv(oggetto_require, ...args);
  };
}

