const express = require('express')
const cors = require('cors')
const Parser = require('rss-parser');
const NodeCache = require( "node-cache" );
const app = express()
const parser = new Parser();
/* 12 hours cache */
const myCache = new NodeCache({ stdTTL: 43200, checkperiod: 0 });

const whitelist = ['http://localhost:1313', 'https://avergnaud.github.io']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.options('/products/:id', cors(corsOptions)) // enable pre-flight request for DELETE request

app.get('/rss/:id', cors(corsOptions), function (req, res, next) {

    let rssUrl = null;
    switch(req.params.id) {
        case 'martinfowler.com':
            rssUrl = 'https://martinfowler.com/bliki/bliki.atom'
            break;
        default:
            console.log(`ERROR url not handled: ${req.params.id}`);
    }
    
    let cachedValue = myCache.get(rssUrl);
    if (cachedValue == undefined){
        /* value not in cache */
        parser.parseURL(rssUrl)
            .then(feed => {
                myCache.set(rssUrl, feed);
                res.json(feed)
            });
    } else {
        /* value still in cache */
        res.json(cachedValue)
    }
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port 3000')
})