/* global Promise, describe, it, __dirname, process*/
const ambiente = process.env.NODE_ENV;

const {expect, assert} = require('chai');

const ChangeEnv = require(`../`)(require);

const t = {r_support: './change-env.support.js',
           r_support2: './change-env.support2.js',
           some_mod_core: ['util', 'assert', 'fs']};
Object.freeze(t);


describe('Test ChangeEnv', () => {
  const new_env = 'nuovo_ambiente';
  const actual_env = 'ambiente atuale';
  const callback_chiamata={chiamata: false};
  beforeEach(()=>{
    ripristinaAmbiente(actual_env);
    callback_chiamata.chiamata = false;});
  afterEach(()=>{
    ripristinaAmbiente(actual_env);
  });
  
  it('callback non chiamata restituisce errore', () => {
    const callback_che_non_chiamo = ()=>{informaCallbackStataChiamata(callback_chiamata); expect(process.env.NODE_ENV).to.eql(new_env);};
    ChangeEnv(new_env, ()=>{});
    expect(()=>{assicuratiCheCallbackVieneChiamata(callback_chiamata);}).to.throw('la callback non è stata chiamata in ChangeEnv');
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
    const precedente_require = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(t.r_support, precedente_require);
    ChangeEnv(new_env, callback, t.r_support);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
  });
  it('require non viene ricalcolato dopo change-env perché ha ripristinato la path_resolve eliminato dalla cache', () => {
    const precedente_require = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(t.r_support, precedente_require);
    ChangeEnv(new_env, callback, t.r_support);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
    
    const require_dopo_change_env = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    expect(require_dopo_change_env).to.deep.equal(precedente_require);
    expect(require_dopo_change_env).to.equal(precedente_require);
  });
  it('nessun errore nella cancellazione e ripristino di un path_require di un modulo core', () => {
    for(let mod of t.some_mod_core){
      expect(()=>{ChangeEnv(new_env, ()=>{}, mod);}).to.not.throw();
    }
  });
  it('errore se inserito un path_require non esistente (cioè che require.resolve non trova)', () => {
    const path_modulo_inesistente = './sicuramente_non_esisto.js';
    expect(()=>{ChangeEnv(new_env, ()=>{}, path_modulo_inesistente)}).to.throw('Cannot find module');
  });
  it.skip('require viene ricalcolato quando viene eliminata tutta la cache', () => {
    const precedente_require = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const req_in_callback = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
      expect(req_in_callback).to.deep.equal(precedente_require);
      expect(req_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(t.r_support, precedente_require);
    ChangeEnv(new_env, callback, undefined);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
  });
  it.skip('require non viene ricalcolato dopo change-env perché ha ripristinato la cache (che era stata eliminata per intero)', () => {
    const precedente_require = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const require_chiamato_in_callback = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
      expect(require_chiamato_in_callback).to.deep.equal(precedente_require);
      expect(require_chiamato_in_callback).to.not.equal(precedente_require);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(t.r_support, precedente_require);
    ChangeEnv(new_env, callback, undefined);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
    
    const require_dopo_change_env = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    expect(require_dopo_change_env).to.deep.equal(precedente_require);
    expect(require_dopo_change_env).to.equal(precedente_require);
  });
  it('array di path_require da eliminare da cache e ripristinare', () => {
    const precedente_require1 = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    const precedente_require2 = require(t.r_support2).istanziaNuovoOggettoAdOgniRequire;
    const callback = ()=>{
      informaCallbackStataChiamata(callback_chiamata); 
      const require1_chiamato_in_callback = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
      const require2_chiamato_in_callback = require(t.r_support2).istanziaNuovoOggettoAdOgniRequire;
      expect(require1_chiamato_in_callback).to.deep.equal(precedente_require1);
      expect(require1_chiamato_in_callback).to.not.equal(precedente_require1);
      
      expect(require2_chiamato_in_callback).to.deep.equal(precedente_require2);
      expect(require2_chiamato_in_callback).to.not.equal(precedente_require2);
    };
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(t.r_support, precedente_require1);
    assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(t.r_support2, precedente_require2);
    ChangeEnv(new_env, callback, [t.r_support, t.r_support2]);
    assicuratiCheCallbackVieneChiamata(callback_chiamata);
    
    const require1_dopo_change_env = require(t.r_support).istanziaNuovoOggettoAdOgniRequire;
    expect(require1_dopo_change_env).to.deep.equal(precedente_require1);
    expect(require1_dopo_change_env).to.equal(precedente_require1);

    const require2_dopo_change_env = require(t.r_support2).istanziaNuovoOggettoAdOgniRequire;
    expect(require2_dopo_change_env).to.deep.equal(precedente_require2);
    expect(require2_dopo_change_env).to.equal(precedente_require2);
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

function assicuratiCheTestSiaValidoPerRequirePrimaDiChangeEnv(path_require_support, prec_require){
  const nuovo_require = require(path_require_support).istanziaNuovoOggettoAdOgniRequire;
  expect(prec_require, 'il test per essere valido ha bisogno di una implementazione corretta a supporto del test, cioè deve restituire sempre una nuova entità con new').to.equal(nuovo_require);
}