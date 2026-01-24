import hbs from 'hbs';
import { join } from 'path';
import * as fs from 'fs';

/**
 * Config handlebars
 * @param viewsDir views directory
 */
export function configureHbs(viewsDir: string) {

  hbs.registerPartials(join(viewsDir, '/partials'));

  hbs.registerPartials(join(viewsDir, '/subpage'))


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


hbs.registerHelper('containsAny', function (item, ...values) {
  return values.includes(item);
});

hbs.registerHelper('keys', function (obj) {
  return Object.keys(obj);
});

hbs.registerHelper('values', function (obj) {
  return Object.values(obj);
});

hbs.registerHelper('tojson', function (context) {
  return new hbs.handlebars.SafeString(
    JSON.stringify(context)
  );
});

hbs.registerHelper('lengthHigh', function (array, num) {
  return array.length >= num
})

hbs.registerHelper('isEmpty', function (array) {
  return !array || array.length === 0;
});

hbs.registerHelper('not', function (value, options) {
  if (!value) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

hbs.registerHelper('avatar', function (nickname) {
  if (!nickname) return 'S';
  return nickname.charAt(0).toUpperCase();
});

hbs.registerHelper('buildHref', function (key, auth) {
  const first = key?.split('/')[0];
  return first === auth ? `/${key}` : `/category/${key}`;
});