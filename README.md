# Members.js

[![CI Status](https://github.com/TryGhost/members.js/workflows/Test/badge.svg?branch=master)](https://github.com/TryGhost/Ghost-CLI/actions)
[![npm version](https://badge.fury.io/js/%40tryghost%2Fmembers-js.svg)](https://badge.fury.io/js/%40tryghost%2Fmembers-js)

Drop-in script to make the bulk of members work on any theme.

## Usage

To load members.js in any Ghost theme, add below code in theme's `default.hbs` before the end of body tag.

```html
<script type="text/javascript" src="https://unpkg.com/@tryghost/members-js@0.1.1"></script>
<script>
    // Initializes members.js
    // adminUrl: Your API domain, must not end in a trailing slash(Ref: https://ghost.org/docs/api/v3/javascript/admin/#authentication)
    window.GhostMembers.init({
      adminUrl: 'https://youradminurl.com'
    });
</script>
```

## Basic Setup

1. Clone this repository:

```shell
git@github.com:TryGhost/members.js.git
```

2. Change into the new directory and install the dependencies:

```shell
cd members.js
yarn
```

## Configure for local development

Only useful for active UI development without publishing a version on unpkg. Always use the unpkg link for testing latest released members.js.

#### In this repo(Members.js):

- Run `yarn build` to create the minified bundle with your changes at `umd/members.min.js`

#### In your theme(Ex. Lyra):

- Copy `members.min.js` from above and paste it in your theme at `assets/built/members.min.js`
- Add below code in your theme's `default.hbs` just above `{{{block "scripts"}}}` to add and initialize members script
```html
<script src="{{asset "built/members.min.js"}}"></script>
<script>
    // Initialize members.js
    window.GhostMembers.init({
        adminUrl: 'youradminurl.com'
    });
</script>
```

## Available Scripts

In the project directory, you can also run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

Note: You'll need to configure the local Admin API url for script initialization.
- Copy `.env.development.local.example` to `.env.development.local`
- Update the values to match your local dev version of Ghost

### `yarn build`

Creates the production single minified bundle for external use in `umd/members.min.js`.  <br />

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


## Publish

Before shipping, please ensure the intended version is updated in `package.json`.

- Run `npm publish --access public` to ship the new version to npm and unpkg.
    - Builds the script with latest code using `yarn build` (prePublish)
    - Publishes package on npm as `@tryghost/members-js` and creates an unpkg link for script at https://unpkg.com/@tryghost/members-js@VERSION

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

# Copyright & License

Copyright (c) 2020 Ghost Foundation - Released under the [MIT license](LICENSE).