'use strict';

import meow from 'meow';
import inquirer from 'inquirer';
import Promise from 'bluebird';
import emoji from 'node-emoji';

/**
 * Command line controller, promps, help, meow, etc.
 */
export default class CLI {
  /**
   * Prompt on inital cli interaction.
   *
   * @return {Inquirer}
   *   The Inquirer prompt object.
   */
  prompt () {
    const prompts = this.prompts = [{
      type: 'list',
      name: 'action',
      message: 'Please choose an action:',
      choices: [
        { value: 'serve', name: `Start up a server on port ${global.port}` },
        { value: 'view_all', name: 'View all transactions' },
        { value: 'view_incoming', name: `View INCOMING transactions ${emoji.get('sunglasses')}` },
        { value: 'view_outgoing', name: `View OUTGOING transactions ${emoji.get('cold_sweat')}` },
        { value: 'cc', name: 'Rebuild the transaction cache' },
        { value: 'tax', name: `Do my taxes for me! ${emoji.get('wink')}` },
        { value: 'big_boys', name: `See the big boys ${emoji.get('muscle')}` }
      ]
    }];
    return inquirer.prompt(prompts);
  }
  /**
   * Constructor for the cli, which sets up input flags and help text.
   *
   * @return this
   */
  constructor () {
    const args = meow(`

      ££\\      ££\\                                            £££££££\\                  ££\\
      £££\\    £££ |                                           ££  __££\\                 ££ |
      ££££\\  ££££ | ££££££\\  £££££££\\   ££££££\\  ££\\   ££\\    ££ |  ££ | ££££££\\   £££££££ | ££££££\\   ££££££\\   ££££££
      ££\\££\\££ ££ |££  __££\\ ££  __££\\ ££  __££\\ ££ |  ££ |   £££££££\\ | \\____££\\ ££  __££ |££  __££\\ ££  __££\\ ££  __££\\
      ££ \\£££  ££ |££ /  ££ |££ |  ££ |££££££££ |££ |  ££ |   ££  __££\\  £££££££ |££ /  ££ |££ /  ££ |££££££££ |££ |  \\__|
      ££ |\\£  /££ |££ |  ££ |££ |  ££ |££   ____|££ |  ££ |   ££ |  ££ |££  __££ |££ |  ££ |££ |  ££ |££   ____|££ |
      ££ | \\_/ ££ |\\££££££  |££ |  ££ |\\£££££££\\ \\£££££££ |   £££££££  |\\£££££££ |\\£££££££ |\\£££££££ |\\£££££££\\ ££ |
      \\__|     \\__| \\______/ \\__|  \\__| \\_______| \\____££ |   \\_______/  \\_______| \\_______| \\____££ | \\_______|\\__|
                                                       ££ |                                 ££\\   ££ |
        "Because you're too stingy for an accountant"  ££ |                                 \\££££££  |
                                                       \\_/                                   \\______/

        Usage
          $ ./finance.js

        Options
          serve          Start the client server
          view all       View a list of all transactions
          view incoming  View a list of incoming transactions
          view outgoing  View a list of outgoing transactions
          tax            Do your taxes for you.
          cc             Rebuild the cache.

        Examples
          $ ./finance.js server
          $ ./finance.js view incoming

    `);
    this.flags = args.flags;
    this.input = args.input;
    this.selection = this.input.join('_').toLowerCase();
    return this;
  }
}
