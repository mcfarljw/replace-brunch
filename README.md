## replace-brunch
[![Build Status](https://travis-ci.org/mcfarljw/replace-brunch.svg?branch=master)](https://travis-ci.org/mcfarljw/replace-brunch)

## Usage
Install the plugin via npm with `npm install --save replace-brunch`.

Or, do manual install:

* Add `"replace-brunch": "x.y.z"` to `package.json` of your brunch app.
  Pick a plugin version that corresponds to your minor (y) brunch version.
* If you want to use git version of plugin, add
`"replace-brunch": "git+ssh://git@github.com:mcfarljw/replace-brunch.git"`.

### Configuration

```javascript
module.exports = {
    plugins: {
        replace: {
            encoding: 'utf8',
            log: true,
            mapping: {
                'date': (new Date()).toISOString(),
                'timestamp': Math.floor(Date.now() / 1000)
            },
            paths: [],
            replacePrefix: '{!',
            replaceSuffix: '!}'
        }
    }
};
```
