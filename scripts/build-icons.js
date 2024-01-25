/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const coins = [
  'btc',
  'bch',
  'ltc',
  'xrp',
  'xlm',
  'dash',
  'zec',
  'btg',
  'eth',
  'trx',
  'bsv',
  'eos',
  'avax',
  'near',
  'dot',
  'sol',
  'polygon',
  'xec',
  'doge',
  'ada',
  'atom',
  'osmo',
  'tia',
  'injective',
  'bld',
  'hash',
  'sei',
  'zeta',
  'coreum',
  'arbeth',
  'opeth',
  'hbar',
];

const paths = fs
  .readdirSync(
    path.dirname(require.resolve('cryptocurrency-icons/svg/color/matic.svg'))
  )
  .filter(file => coins.includes(path.basename(file, '.svg')))
  .map(file => require.resolve(`cryptocurrency-icons/svg/color/${file}`));

function camelCase(str) {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

const renamedAttributes = [
  'fill-rule',
  'xlink:href',
  'xml:space',
  'stop-color',
  'stop-opacity',
  'fill-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-width',
  'color-interpolation-filters',
];

const safeAttributeSelector = attributeName => {
  return `[${attributeName.replace(/:/g, '\\:')}]`;
};

function transformStyle(style) {
  const rules = style.trim().split(';');
  const transformedRules = rules
    .filter(Boolean)
    .map(rule => {
      const [key, value] = rule.trim().split(':');
      if (key === 'enable-background') {
        return;
      }
      return `${camelCase(key)}: '${value}'`;
    })
    .filter(Boolean);
  return `{${transformedRules.join(',\n   ')}}`;
}

function itemTemplate(filePath) {
  const $ = cheerio.load(fs.readFileSync(filePath, 'utf8'), {
    xml: {
      xmlMode: true,
      decodeEntities: false,
    },
  });
  const $svg = $('svg');
  const xmlnsXlink = $svg.attr('xmlns:xlink');

  $('style').each((index, element) => {
    const $element = $(element);
    $element.text(`{\`${$element.text()}\`}`);
  });

  renamedAttributes.forEach(attributeName => {
    $(safeAttributeSelector(attributeName)).each((index, element) => {
      const $element = $(element);
      $element.attr(
        camelCase(attributeName.replace(':', '_')),
        $element.attr(attributeName)
      );
      $element.removeAttr(attributeName);
    });
  });

  $('[class]').each((index, element) => {
    const $element = $(element);
    $element.attr('className', $element.attr('class'));
    $element.removeAttr('class');
  });

  $('[style]').each((index, element) => {
    const $element = $(element);
    $element.prop('style', transformStyle($element.attr('style')));
  });

  if (xmlnsXlink) {
    $svg.removeAttr('xmlns:xlink');
    $svg.attr('xmlnsXlink', xmlnsXlink);
  }

  $svg.prop('className', '');

  $svg.removeAttr('width');
  $svg.removeAttr('height');
  $svg.attr('hostProps', '');

  return `case '${path.basename(filePath, '.svg')}':\n    return ${$('svg')
    .toString()
    .replaceAll(/style="{(.*)}"/g, (match, p1) => {
      return `style={{${p1}}}`;
    })
    .replace(
      /className=""/gm,
      `className={clsx('tw-inline-flex tw-fill-current', {
        'tw-w-4 tw-h-4': Size === 'small',
        'tw-w-6 tw-h-6': Size === 'medium',
        'tw-w-8 tw-h-8': Size === 'large',
      })}`
    )
    .replace('hostProps=""', '{...hostProps}')};`;
}

function template(paths) {
  return `import clsx from 'clsx';\nexport interface CryptocurrencyIconProps {
    Name: ${paths
      .map(filePath => `'${path.basename(filePath, '.svg')}'`)
      .join(' | ')};
    Size: 'small' | 'medium' | 'large';
  }

  export function CryptocurrencyIcon({Name, Size, ...hostProps}: CryptocurrencyIconProps & JSX.IntrinsicElements['svg']) {
    switch (Name) {
      ${paths.map(itemTemplate).join('\n')}
      default:
        return null;
    }
  }`;
}

fs.writeFileSync(
  path.resolve(
    __dirname,
    '../src/components/CryptocurrencyIcon/CryptocurrencyIcon.tsx'
  ),
  template(paths)
);
