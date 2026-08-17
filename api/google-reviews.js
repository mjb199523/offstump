export default async function handler(req, res) {
    // Return early if no API key is set
    if (!process.env.GOOGLE_PLACES_API_KEY) {
        return res.status(200).json({ 
            rating: "5.0", 
            reviews: "46+", 
            fallback: true 
        });
    }

    // You need to replace this with the actual Place ID for OFFSTUMP
    // Or set it in Vercel as GOOGLE_PLACE_ID
    // To find it: https://developers.google.com/maps/documentation/places/web-service/place-id
    // Wait, the place ID for OFFSTUMP Guwahati can be found using the Maps API or by the user.
    const PLACE_ID = process.env.GOOGLE_PLACE_ID || "PLACEHOLDER_PLACE_ID";

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.result) {
            // Cache the response at the edge for 12 hours (43200 seconds) to save API quota
            res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400');
            
            return res.status(200).json({
                rating: data.result.rating.toFixed(1),
                reviews: data.result.user_ratings_total + "+",
                fallback: false
            });
        } else {
            console.warn(`Google API returned status: ${data.status}`);
            return res.status(200).json({ 
                rating: "5.0", 
                reviews: "46+", 
                fallback: true 
            });
        }
    } catch (error) {
        console.error("Error fetching Google Reviews:", error);
        // Fallback to static data if API fails
        return res.status(200).json({ 
            rating: "5.0", 
            reviews: "46+", 
            fallback: true 
        });
    }
}
