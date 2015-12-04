---
title: Install
position: 2
---

# Installation

This is a quick reference to get DemocracyOS up and running.

* [Requirements](#requirements)
  * [Notes](#notes)
* [Install](#install)
* [Running](#running)
  * [Running in a production environment](#running-in-production-environment)
  * [OS specifics](#os-specifics)
* [Loading sample data](#loading-sample-data)

## Requirements

To get started with DemocracyOS, you will need to have installed:

* [MongoDB](http://www.mongodb.org/downloads) open-source document database.
* [NodeJS & NPM](http://nodejs.org/) platform.
* [Git](http://git-scm.com/downloads) distributed version control system. If you're on github and don't have `git`, [you're doing it wrong](http://knowyourmeme.com/memes/youre-doing-it-wrong).
* [Make](http://www.gnu.org/software/make/) build automation utility.
* [OpenSSL](https://www.openssl.org/related/binaries.html) in case you want to generate SSL certificates.

### Notes

Running on **Windows** environment is not currently supported. If you happen to be familiar with [Docker](https://www.docker.io/) or [Vagrant](http://www.vagrantup.com/), please lend us a hand and submit a [PR](http://help.github.com/articles/using-pull-requests) so we can collaborate on a solution for this.

## Install

### Unix and OS/X

- [Fork](http://help.github.com/articles/fork-a-repo) or download this repository.
- `cd` to the project's location
- Create the default configuration file running `node ./bin/dos-install --config`, or head to the [Configuration](configuration.md) guide for further customizations.
- Make sure MongoDB is running and reachable as configured in `config/development.json`. (Default values should work)
- Set the environment variable `NODE_PATH` with value: `.`.
- From the root path of the project, run `make` to download all the necessary dependencies and run the local server.
- For users behind corporate proxy, its recommended to clone the project using `https:` instead of `git:` url.

## Running

Once DemocracyOS components and dependencies are installed, you can start the application like this:

```bash
make run
```

Take a look at the [Makefile](https://github.com/DemocracyOS/app/blob/master/Makefile) for more information about the possible tasks you can run.

You can check the current DemocracyOS version going to `http://localhost:3000/api`

### Using SSL

In case you want to use SSL in your dev environment (it's disabled by default), you'll need to have proper certificate files.
We ship a script that generates the needed files. Just run the following command in the project root:

```bash
NODE_PATH=. node bin/dos-ssl
```

Then modify your configuration file by changing the `protocol` property to `https` and run it normally. Configuration options for SSL are listed [here](configuration.md#ssl).

### A note on using port 443

The default configuration file make the app listens to port 443 to handle SSL connections. In some OSs, a normal user cannot perform this operation, and you are likely to get this error:

```javascript
events.js:72
       throw er; // Unhandled 'error' event
             ^
Error: bind EACCES
   at errnoException (net.js:904:11)
   at net.js:1072:30
   at Object.37:1 (cluster.js:594:5)
[...]
```

To solve it without being root (that is always a bad idea), you can change the `ssl.port` value in your configuration file to another port, say `4443`.

### Running in production environment

1. Configure your [environment variables](https://github.com/DemocracyOS/app/wiki/Environment-variables) for production; specifically, set `NODE_ENV` to `production`
2. Set your MongoDB instance to run as a service.
3. Make sure to correctly configure the [Notifier](notifier) for production environments.
4. From the project's root path, you need to run `make` or:
  1. `npm install` to install node dependencies.
  2. `npm run build && npm run start` to build assets and run the app. _Don't run as `sudo`._

If something goes wrong you can always go back to a clean slate running `make clean`.

### OS specifics

* Check [this very detailed guide](https://github.com/okfn-brasil/democracyos/wiki/Install) if you're on Ubuntu 10 LTS.
* On Ubuntu 14/13/lower, install the package `node-legacy` for NodeJS.
* Check [this guide](https://github.com/DemocracyOS/app/wiki/Running-as-a-service) on how to run DemocracyOS as a service.

## Loading sample data

In order for you to see a fully working deployment, you *will* need some sample data. This can be achieved by either of these approaches:
* Manually [load sample fixtures](https://github.com/DemocracyOS/app/wiki/Load-fixtures) bundled with DemocracyOS.
* Setup and access the [administration module](https://github.com/DemocracyOS/app/wiki/Admin-module).
