import meow from 'meow';

export default class CLI {
  constructor () {
    return meow(`
        Usage
          $ ./finance.js

        Options
          -s, --action server         Start the client server
          -a, --action view-all       View a list of all transactions
          -i, --action view-incoming  View a list of incoming transactions
          -o, --action view-outgoing  View a list of outgoing transactions
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
        O: 'use_old'
      }
    });
  }
}
