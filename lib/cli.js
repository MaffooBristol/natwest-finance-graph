'use strict';

import meow     from 'meow';
import inquirer from 'inquirer';
import Promise  from 'bluebird';
import emoji    from 'node-emoji';

export default class CLI {

  prompt () {
    let prompts = this.prompts = [{
      type: 'list',
      name: 'action',
      message: 'Please choose an action:',
      choices: [
        {value: 'server', name: `Start up a server on port ${global.port}`},
        {value: 'view_all', name: 'View all transactions'},
        {value: 'view_incoming', name: `View INCOMING transactions ${emoji.get('sunglasses')}`},
        {value: 'view_outgoing', name: `View OUTGOING transactions ${emoji.get('cold_sweat')}`},
        {value: 'rebuild_cache', name: 'Rebuild the transaction cache'}
      ]
    }];
    return inquirer.prompt(prompts);
  }

  constructor () {
    this.flags = meow(`
        Usage
          $ ./finance.js

        Options
          -s, --action server         Start the client server
          -a, --action view-all       View a list of all transactions
          -i, --action view-incoming  View a list of incoming transactions
          -o, --action view-outgoing  View a list of outgoing transactions
          -c, --action rebuild-cache  Rebuild the cache.
          -O, --use-old               Use the old version of the app (Backbone)

        Examples
          $ ./finance.js -s
          $ ./finance.js --view-outgoing

    `, {
      alias: {
        s: 'server',
        a: 'view_all',
        i: 'view_incoming',
        o: 'view_outgoing',
        O: 'use_old',
        c: 'rebuild_cache'
      }
    }).flags;
    return this;
  }
}
