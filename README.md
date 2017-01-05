## replace-brunch
[![Build Status](https://travis-ci.org/mcfarljw/replace-brunch.svg?branch=master)](https://travis-ci.org/mcfarljw/replace-brunch)

## Usage
Install the plugin via npm with `npm install --save-dev replace-brunch`.

### Configuration

```javascript
module.exports = {
    plugins: {
        replace: {
            encoding: 'utf8',
            log: true,
            mappings: {
                'date': (new Date()).toISOString(),
                'timestamp': Math.floor(Date.now() / 1000)
            },
            paths: [
                'public/index.html',
                'public/js/app.js'
            ],
            replacePrefix: '{!',
            replaceSuffix: '!}'
        }
    }
};
```
