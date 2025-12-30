import hbs from 'hbs';
import { join } from 'path';
import * as fs from 'fs';

/**
 * Config handlebars
 * @param viewsDir views directory
 */
export function configureHbs(viewsDir: string) {

    hbs.registerPartials(join(viewsDir, '/partials'));

    hbs.registerPartials(join(viewsDir,'/subpage'))


  hbs.registerHelper('eq', (a: any, b: any) => {
    return a === b;
  });


  hbs.registerHelper('neq', (a: any, b: any) => {
    return a !== b;
  });
}

hbs.registerHelper('last', function (array) {
  return array[array.length - 1];
});


hbs.registerHelper('containsAny', function(item, ...values) {
  return values.includes(item);
});

hbs.registerHelper('keys', function(obj) {
  return Object.keys(obj);
});

hbs.registerHelper('values', function(obj) {
  return Object.values(obj);
});
