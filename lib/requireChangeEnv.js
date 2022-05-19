//// da sviluppare.
// funzionamento del tipo ChageEnv.to(env).require(path) -> cambia env. calcolare il require. riprisina env precedente. restituisce risultato require

function requireChangeEnv(environment){
  const actual_env = process.env.NODE_ENV;
  return require;
}


module.exports.requireCE = requireChangeEnv;