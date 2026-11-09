import * as migration_20261028_145744_initial from './20261028_145744_initial';
import * as migration_20261109_211800_tekstit_footer_pages_reviews_kieli from './20261109_211800_tekstit_footer_pages_reviews_kieli';

export const migrations = [
  {
    up: migration_20261028_145744_initial.up,
    down: migration_20261028_145744_initial.down,
    name: '20261028_145744_initial',
  },
  {
    up: migration_20261109_211800_tekstit_footer_pages_reviews_kieli.up,
    down: migration_20261109_211800_tekstit_footer_pages_reviews_kieli.down,
    name: '20261109_211800_tekstit_footer_pages_reviews_kieli'
  },
];
