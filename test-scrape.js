const fs = require('fs');

async function getGoogleRating() {
    try {
        const response = await fetch('https://www.google.com/maps/place/?q=place_id:ChIJgUbEo8lQVDcRZOgmbN3e04o', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        
        // Search for something like: 4.8 stars or 4.8\u0022 and 42 reviews
        const ratingMatch = html.match(/\\\"(\d\.\d)\\\",\\\"(\d+)\\\"/);
        if (ratingMatch) {
            console.log('Rating:', ratingMatch[1], 'Reviews:', ratingMatch[2]);
        } else {
            console.log('No regex match.');
            // try another regex: 
            const altMatch = html.match(/(\d\.\d)\\\\u0022,\\\\u0022(\d+)\\\\u0022/);
            if(altMatch) {
                console.log('Alt Rating:', altMatch[1], 'Alt Reviews:', altMatch[2]);
            }
            fs.writeFileSync('test-output.html', html);
        }
    } catch (e) {
        console.error(e);
    }
}
getGoogleRating();
