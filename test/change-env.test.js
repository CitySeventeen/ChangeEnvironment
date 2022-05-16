/* global Promise, describe, it, __dirname, process*/
const ambiente = process.env.NODE_ENV;

const {expect, assert} = require('chai');

const ChangeEnv = require(`../change-env.js`).ChangeEnv(require);

const t = {};
Object.freeze(t);


describe('Test ChangeEnv', () => {
  const new_env = 'nuovo_abiente';
  const actual_env = 'ambiente atuale';
  let callback_chiamata={chiamata: false};
  beforeEach(()=>{callback_chiamata={chiamata: false};});
  afterEach(()=>{ripristinaAmbiente(actual_env)});
  it('callback non chiamata restituisce errore', () => {
    const callback_che_non_chiamo = ()=>{informaCallbackStataChiamata(callback_chiamata); expect(process.env.NODE_ENV).to.eql(new_env);};
    ChangeEnv(new_env, ()=>{});
    expect(()=>{assicuratiCheCallbackVieneChiamata(callback_chiamata)}).to.throw('la callback non è stata chiamata in ChangeEnv');
  });
  it('ChangeEnv cambia ambiente', () => {
    const callback = ()=>{informaCallbackStataChiamata(callback_chiamata); expect(process.env.NODE_ENV).to.eql(new_env);};
    ChangeEnv(new_env, callback);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
  });
  it('ChangeEnv ripristina ambiente dopo callback', () => {
    const callback = ()=>{informaCallbackStataChiamata(callback_chiamata); expect(process.env.NODE_ENV).to.eql(new_env);};
    ChangeEnv(new_env, callback);
    expect(process.env.NODE_ENV).to.eql(actual_env);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
  });
  it('require viene ricalcolato dopo cancellazione path_resolve da cache', () => {
    const precedente_require = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(precedente_require);
    ChangeEnv('nuovo_ambiente', callback, './change-env.support.js');
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
  });
  it('require non viene ricalcolato dopo change-env perché ha ripristinato la path_resolve eliminato dalla cache', () => {
    const precedente_require = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(precedente_require);
    ChangeEnv('nuovo_ambiente', callback, './change-env.support.js');
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
    
    const require_dopo_change_env = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
    expect(require_dopo_change_env).to.deep.equal(precedente_require);
    expect(require_dopo_change_env).to.equal(precedente_require);
  });
  it.skip('require viene ricalcolato quando viene eliminata tutta la cache', () => {
    const precedente_require = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(precedente_require);
    ChangeEnv('nuovo_ambiente', callback, undefined);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
  });
  it.skip('require non viene ricalcolato dopo change-env perché ha ripristinato la cache (che era stata eliminata per intero)', () => {
    const precedente_require = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(precedente_require);
    ChangeEnv('nuovo_ambiente', callback, undefined);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
    
    const require_dopo_change_env = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
    expect(require_dopo_change_env).to.deep.equal(precedente_require);
    expect(require_dopo_change_env).to.equal(precedente_require);
  });
  
  
});
function assicuratiCheCallbackVieneChiamata(callback_chiamata){
  expect(callback_chiamata.chiamata, 'la callback non è stata chiamata in ChangeEnv').to.be.true;
}
function informaCallbackStataChiamata(callback_chiamata){
  callback_chiamata.chiamata = true;
}

function ripristinaAmbiente(ambiente){
  process.env.NODE_ENV = ambiente;
}

function assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(prec_require){
  const nuovo_require = require('./change-env.support.js').istanziaNuovoOggettoAdOgniRequire;
  expect(prec_require, 'il test per essere valido ha bisogno di una implementazione corretta a supporto del test, cioè deve restituire sempre una nuova entità con new').to.equal(nuovo_require);
}