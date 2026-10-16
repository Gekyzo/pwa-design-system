import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appPart } from '../scripts/split.mjs';

const SHARED = `@layer tokens, base, components;

@layer tokens {
  :root {
    --bg: #fff; /* page */
    --space-1: 4px;
  }
}

@layer base {
  [hidden] {
    display: none !important;
  }
}

@layer components {
  /* @component pill
     @summary A label.
     @example <span class="pill">A</span> */
  .pill {
    padding: 4px;
  }

  .pill.on {
    color: red;
  }
}
`;

const wrap = (layer, body) => `@layer tokens, base, components;\n\n@layer ${layer} {\n${body}}\n`;

test('appPart removes a rule identical to a shared rule', () => {
  const out = appPart(wrap('base', '  [hidden] {\n    display: none !important;\n  }\n\n  a {\n    color: red;\n  }\n'), SHARED);
  assert.doesNotMatch(out, /\[hidden\]/);
  assert.match(out, /a \{\s+color: red;/);
});

test('appPart keeps a rule with one declaration more', () => {
  const rule = '  [hidden] {\n    display: none !important;\n    color: red;\n  }\n';
  assert.match(appPart(wrap('base', rule), SHARED), /\[hidden\]/);
});

test('appPart removes an identical token and keeps an app token', () => {
  const out = appPart(wrap('tokens', '  :root {\n    --bg: #fff; /* page */\n    --space-1: 4px;\n    --mine: 1px;\n  }\n'), SHARED);
  assert.doesNotMatch(out, /--bg|--space-1/);
  assert.match(out, /--mine: 1px/);
});

test('appPart keeps a token with the name of a shared one and another value', () => {
  assert.match(appPart(wrap('tokens', '  :root {\n    --bg: #000;\n  }\n'), SHARED), /--bg: #000/);
});

test('appPart drops a rule, a media block and a layer block that become empty', () => {
  const out = appPart(wrap('tokens', '  @media (min-width: 600px) {\n    :root {\n      --bg: #fff;\n    }\n  }\n'), SHARED.replace('  :root {', '  @media (min-width: 600px) {\n    :root {\n      --bg: #fff;\n    }\n  }\n\n  :root {'));
  assert.doesNotMatch(out, /@media|@layer tokens \{/);
  assert.match(out, /^@layer tokens, base, components;/);
});

test('appPart removes the block and the rules of an identical shared component', () => {
  const component = `  /* @component pill
     @summary A label.
     @example <span class="pill">A</span> */
  .pill {
    padding: 4px;
  }

  .pill.on {
    color: red;
  }
`;
  const out = appPart(wrap('components', component), SHARED);
  assert.doesNotMatch(out, /@component|\.pill/);
  assert.doesNotMatch(out, /@layer components \{/);
});

test('appPart keeps an overriding version under an Overrides comment', () => {
  const component = `  /* @component pill
     @summary Another label.
     @example <span class="pill">A</span> */
  .pill {
    padding: 8px;
  }

  .pill.on {
    color: red;
  }
`;
  const out = appPart(wrap('components', component), SHARED);
  assert.doesNotMatch(out, /@component|@summary/);
  assert.match(out, /  \/\* Overrides pill of the design system\. \*\/\n  \.pill \{\n    padding: 8px;/);
  assert.match(out, /\.pill\.on/);
});

test('appPart keeps an app rule that follows a removed shared component, and an app-only component', () => {
  const css = `  /* @component pill
     @summary A label.
     @example <span class="pill">A</span> */
  .pill {
    padding: 4px;
  }

  .pill.on {
    color: red;
  }

  /* @component tag
     @summary Mine.
     @example <i class="tag"></i> */
  .tag {
    color: blue;
  }
`;
  const out = appPart(wrap('components', css), SHARED);
  assert.doesNotMatch(out, /\.pill/);
  assert.match(out, /@component tag[\s\S]*\.tag \{/);
});

test('appPart keeps the order, the comments and the other statements of the app', () => {
  const css = `@layer tokens, base, components;\n\n/* Header of the app. */\n@layer base {\n  a {\n    color: red;\n  }\n\n  [hidden] {\n    display: none !important;\n  }\n\n  /* Note on b. */\n  b {\n    color: blue;\n  }\n}\n`;
  const out = appPart(css, SHARED);
  assert.equal(out, `@layer tokens, base, components;\n\n/* Header of the app. */\n@layer base {\n  a {\n    color: red;\n  }\n\n  /* Note on b. */\n  b {\n    color: blue;\n  }\n}\n`);
});

test('appPart removes the standalone comment that leads a removed rule', () => {
  const out = appPart(wrap('base', '  /* Hidden stays hidden. */\n  [hidden] {\n    display: none !important;\n  }\n\n  a {\n    color: red;\n  }\n'), SHARED);
  assert.doesNotMatch(out, /Hidden stays/);
});

test('appPart of an app with nothing of its own is the layer statement', () => {
  assert.equal(appPart(SHARED, SHARED).trim(), '@layer tokens, base, components;');
});

test('appPart treats a shared component with one rule more as an override', () => {
  const component = `  /* @component pill
     @summary A label.
     @example <span class="pill">A</span> */
  .pill {
    padding: 4px;
  }

  .pill.on {
    color: red;
  }

  .pill.off {
    color: grey;
  }
`;
  const out = appPart(wrap('components', component), SHARED);
  assert.match(out, /Overrides pill of the design system/);
  assert.match(out, /\.pill\.off/);
});

import { leaksOf } from '../scripts/split.mjs';

const MEDIA = `@layer tokens, base, components;

@layer components {
  .pill {
    padding: 4px;
    color: red;
  }

  @media (min-width: 600px) {
    .pill {
      margin: 0;
    }
  }
}
`;

test('leaksOf lists a shared rule that the app lacks, with its media context', () => {
  const app = '@layer components {\n  .pill {\n    padding: 4px;\n    color: red;\n  }\n}\n';
  assert.deepEqual(leaksOf(app, MEDIA), ['components @media (min-width: 600px) .pill']);
});

test('leaksOf lists a shared declaration that the rule of the app does not set', () => {
  const app = '@layer components {\n  .pill {\n    padding: 8px;\n  }\n  @media (min-width: 600px) {\n    .pill {\n      margin: 1px;\n    }\n  }\n}\n';
  assert.deepEqual(leaksOf(app, MEDIA), ['components .pill: color']);
});

test('leaksOf lists nothing for an app that has every rule', () => {
  assert.deepEqual(leaksOf(MEDIA, MEDIA), []);
});

test('leaksOf reads a rule split in several rules of the app', () => {
  const app = '@layer components {\n  .pill {\n    padding: 4px;\n  }\n  .pill {\n    color: red;\n  }\n  @media (min-width: 600px) {\n    .pill {\n      margin: 0;\n    }\n  }\n}\n';
  assert.deepEqual(leaksOf(app, MEDIA), []);
});
