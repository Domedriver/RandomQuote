FCC Random Quote Generator
==========================

I created FCC Random Quote Generator to help FCC Campers complete the Random Quote Machine challenge found in
the Front End Libraries Projects. To complete that challenge, I used an api but later when I went back to
look at the project, I discovered the api link no longer worked. So I decided to try to build my own api.

The idea for the project came from Jason Luboff and his Simpsons Quote api: `https://thesimpsonsquoteapi.glitch.me/`

In addition, I wanted to allow campers to submit their own favorite quotes and help grow the quote database.
Need a quote, take a quote. Have a quote, give a quote.

All `GET` requests return a single quote:

```javascript
{
    "quote": "Baseball is 90% mental and the other half is physical.",
    "author": "Yogi Berra",
    "category": "realperson",
    "fccCamper": "",
    "camper_link": ""
}
```

Users can specify a specific category:
- `https://coordinated-face.glitch.me/api/quote/movie`
- `https://coordinated-face.glitch.me/api/quote/book`
- `https://coordinated-face.glitch.me/api/quote/realperson`

Or use `https://coordinated-face.glitch.me/api/quote/all` to get a random quote from the entire database.
