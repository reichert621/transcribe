# Preview

Upload audio files and have them instantly transcribed and searchable:

<img width="1368" alt="Screen Shot 2020-02-22 at 7 53 52 PM" src="https://user-images.githubusercontent.com/5264279/75101616-24017580-55ad-11ea-9643-ca019d7ad293.png">

# Getting started

### Install dependencies

- Install **Node v8.x** and **npm v5.x** if you haven't already ([nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) are create tools for this)
- Next, install the dependencies from `package.json` with
  ```
  npm install
  ```
- To keep things easy, install a few global dependencies:
  ```
  npm install -g webpack knex
  ```

### Set up a local Postgres database

- Install Postgres if you haven't already (see [Installing Postgres via Brew](https://gist.github.com/sgnl/609557ebacd3378f3b72))
- Optional: Install a Postgres client (see [Postico](https://eggerapps.at/postico/) or [PSequel](http://www.psequel.com/))
- Create a database (this will be your `$TRANSCRIBE_DB_NAME` environment variable)
  - Or in SQL, with `psql -c CREATE DATABASE [insert_dev_db_name_here];`
  - This can either be done with `createdb [insert_dev_db_name_here]`
- Optional: Test your database credentials by connecting to the newly created database in your Postgres client
- Using these credentials, add your database environment variables to your `~/.bash_profile`, or wherever you store them. This is required for the [`knexfile.js`](https://github.com/reichert621/kam/blob/master/server/db/knexfile.js)
- Set your `$NODE_ENV` environment variable to `dev`, so that the `knexfile` knows which configuration to use

For reference, my local environment variables look like this in my `~/.bash_profile` file:

```
  # Node environment
  export NODE_ENV='dev'

  # DB credentials
  export TRANSCRIBE_DB_PORT=5432
  export TRANSCRIBE_DB_HOST='localhost'
  export TRANSCRIBE_DB_NAME='transcribe_db' # this should match the db you created above
  export TRANSCRIBE_DB_USER=''
  export TRANSCRIBE_DB_PW=''
  export AWS_ACCESS_KEY_ID=''
  export AWS_SECRET_ACCESS_KEY=''
  export STRIPE_SECRET_KEY=''
```

### Run the app

Migrate the database, build the client, and run the server:

```
npm run db:migrate
npm run build
npm run ts:build
npm start
```

Go to `localhost:8000` (or whatever `$PORT` you set) to check that the app is running.

### Development

To simply start the server, run:

```
npm run ts:dev
```

This will serve the contents of the `client/build` directory, which are built with Webpack.

To run Webpack in `--watch` mode, run:

```
npm run watch
```

And that should be it! Happy hacking 🤓
