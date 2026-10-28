import * as migration_20261028_145744_initial from './20261028_145744_initial';

export const migrations = [
  {
    up: migration_20261028_145744_initial.up,
    down: migration_20261028_145744_initial.down,
    name: '20261028_145744_initial'
  },
];
