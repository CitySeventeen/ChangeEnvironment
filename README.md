# ChangeEnvironment
 Permette di eseguire una callback, ad esempio una test suite, con una variabile di ambiente diversa, che ha effetto anche sui require di CommonJS. L'ambiente viene ripristinato dopo aver eseguito la callback come se non fosse mai stato modificato.
 
 ## Problema che vuole risolvere
 Questa libreria è stata pensata per l'utilizzo durante i test, ma è aperta a possibili altri utilizzi creativi.
 Durante i test, si vogliono testare dei moduli in ambiente di dev, o di test, o di produzione. Piuttosto che avere ad esempio un file di test per NODE_ENV = dev ed un altro per NODE_ENV = test, si potrebbe eseguire il test modificando la variabile ambientale. Un approccio manuale consiste nel cambiare proces.env.NODE_ENV, ripristinarla alla fine del test, e assicurarsi anche che il `require` non utilizzi la sua cache.

ChangeEnvironment nasce per fornire una interfaccia semplice per il cambio di ambiente, e si occupa di cambiare il process.env.NODE_ENV, eliminare il modulo nella cache di require, e ripristinare il tutto alla fine del test.
 
### Esempio di utilizzo
```js
const ChangeEnv = require('change-env).ChangeEnv(require)
const modulo_sotto_test = require('./modulo_sotto_test.js')
ChangeEnv('test' /* o anche prod */, ()=>{
  it('In ambiente non di sviluppo il modulo sotto test fornisce solo due exports', ()=>{
    expect(modulo_sotto_test).to.have.all.keys('exports1', 'exports2')
  })
}, './modulo_sotto_test.js')

// con modulo_sotto_test.js del tipo
module.exports.exports1 = function (){/* corpo */}
module.exports.exports2 = function (){/* corpo */}
if(process.env.NODE_ENV === 'dev')
  module.exports.exports3 = function (){/* funzione esportata es ai fini di test in sviluppo */}
```
 
