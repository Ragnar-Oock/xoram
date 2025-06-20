# xoram

A minimalist plugin framework for modular applications.

Follow the advancement on
the [project page](https://github.com/users/Ragnar-Oock/projects/1)

## The repo

The packages of this repo are split as follows :

- [`packages`](./packages) contains the libraries you will be able to use
	- [`@xoram/core`](./packages/core)
	  the core of the framework
- [`plugins`](./plugins) contains first party plugins, documentation for each
  one available at on [xoram.dev](https://xoram.dev/plugins)
	- `@xoram/plugin-panoramique` a Vue 3 and Pinia integration
- [`apps`](./apps)
	- `docs` the sources of [xoram.dev](https://xoram.dev)
- [`config`](./config) contains the configurations for the tools used across
  multiple packages
	- `oxlint`
	- `typescript`
	- `vite`

## The goal

Imagine you have a web application that is both a small standalone thing and a
cog in one or more much bigger applications, or maybe you want to allow your
clients / users to embed your application in their website.

In all of those situations you might be tempted to simply provide a one size
fits all distributable where you enable or disable certain features with flags
in a config object. But what if you could make it so the end users don't need to
load the code of the features you want disabled ? Or what if you wanted to split
your application into smaller chunks loaded as needed to avoid a long initial
load ?

xoram makes all of that trivial and provides you with an intuitive and flexible
way of splitting up your application. And thanks to its plugin based approach
you get separation og concern for free.

## The Roadmap

1. get a first version of `@xoram/core` working
2. create an interactive and easy to follow documentation
3. finalize `@xoram/plugin-panoramique` to integrate with Vue

Once that is done the plan is to make it easy to work with in a monorepo setup :

- Nx and Turbo templates
- Eslint plugin to catch incorrect usage (it's likely to be very small as there
  isn't much you can do wrong with the present APIs) and an OXlint plugin might
  come at a later date
- Svelte integration
- React integration (unlikely)
- More helper plugins might drop to fill in the gaps

## What xoram isn't

xoram is not a Nuxt or Nest replacement. While there is nothing preventing a
xoram based application from running server side there is no plans for a "full
stack" suite of tools like those Meta-Framework are providing. This doesn't mean
that there will never be any client-server facilitators just that they aren't on
the current roadmap.

## Contribution

This project is too early in its development to accept outside contribution but
that will come in the not so distant future. In the meantime feel free to open
an issue if you have any suggestions.

### Running tests

All tests are using Vitest for both unit and e2e test, you can run either or
both with the following commands.

#### All tests

```shell
yarn test
```

This will run tests of all packages under [`packages`](./packages) and
[`plugins`](./plugins) across all environment (node and browser) using the
standard runner and the playwright runner.

#### Filtering tests

When working on a package you might want to run its tests as you write the code,
you can so by calling vitest directly :

```shell
yarn exec vitest dev [package/folder]
```

If you want to run unit tests only from that package you can use `--project 
unit`.
