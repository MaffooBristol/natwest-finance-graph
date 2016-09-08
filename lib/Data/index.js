'use strict';

// I think this is a really bad idea.

import Statements   from './statements';
import Transactions from './transactions';
import Cache        from './cache';

const _Statements   = new Statements();
const _Transactions = new Transactions();
const _Cache        = new Cache();

export {_Statements   as Statements};
export {_Transactions as Transactions};
export {_Cache        as Cache};
