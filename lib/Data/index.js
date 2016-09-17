'use strict';

// I think this is a really bad idea.

import Statements from './statements';
const _Statements = new Statements();
export {_Statements as Statements};

import Transactions from './transactions';
const _Transactions = new Transactions();
export {_Transactions as Transactions};

import Cache from './cache';
const _Cache = new Cache();
export {_Cache as Cache};
