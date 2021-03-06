// In case we want to try server-side rendering
const template = () => {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <title>Transcriptions</title>
        <base href="/">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="assets/favicon.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
        <script src="https://js.stripe.com/v3/"></script>
      </head>
      <body>
        <div id="app">
        </div>

        <script
          type="text/javascript"
          src="bundle.js"
          charset="utf-8">
        </script>
      </body>
    </html>
  `;
};

export default template;
