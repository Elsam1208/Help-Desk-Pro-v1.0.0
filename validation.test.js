import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validTicket} from '../src/validation.js';
const ticket={title:'Rede',description:'Sem conexão',customer:'Cliente',priority:'normal',status:'open',assigned_to:null};
test('aceita chamado válido',()=>assert.equal(validTicket(ticket),true));
test('rejeita título vazio',()=>assert.equal(validTicket({...ticket,title:' '}),false));
test('rejeita prioridade inválida',()=>assert.equal(validTicket({...ticket,priority:'x'}),false));
test('rejeita técnico inválido',()=>assert.equal(validTicket({...ticket,assigned_to:-1}),false));
