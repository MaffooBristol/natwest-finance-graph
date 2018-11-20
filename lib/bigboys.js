import _ from 'lodash';

import Base from './base';
import { Transactions } from './Data';

export default class BigBoys {
  display() {
    Transactions.getTransactions()
      .then((data) => {
        return _.filter(data, (row) => {
          return true;
          // return row.Date.indexOf('2016') > 0;
        });
      })
      .then((data) => {
        const cleansed = _.map(data, (row) => {
          if (row.Type === 'CHQ') {
            row.Description = 'CHEQUE';
          }
          return row;
        });
        const grouped = _.groupBy(cleansed, (row) => {
          const desc = row.Description
            .replace(/(\d{4} .+?, |, \S+ GB| *?\d{2}\S{3}|\b\#?\d+\b|1YNUK|\*)/gi, '')
            .replace('CALL REF.NO. ', '')
            .replace(/,.+/gi, '')
            .trim();
          return desc;
        });
        const mapped = _.map(grouped, (group, groupName) => {
          const priceTotal = _.reduce(group, (val, row) => parseInt(row.Value) + val, 0);
          const lengthTotal = group.length;
          return { groupName, priceTotal, lengthTotal };
        });
        const ordered = _.sortBy(mapped, 'priceTotal');
        console.table(ordered.splice(0, 50));
        const lengthOrdered = _.sortBy(mapped, 'lengthTotal').reverse();
        console.table(lengthOrdered.splice(0, 50));
      });
  }
}

