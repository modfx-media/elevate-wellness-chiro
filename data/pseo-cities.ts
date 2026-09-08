export type PseoCity = {
  slug: string;
  name: string;
  county: string;
  driveTimeFromBountiful: string;
  driveTimeFromClinton: string;
  landmarks: string[];
  neighborhoods: string[];
};

const city = (
  slug: string,
  name: string,
  county: string,
  driveTimeFromBountiful: string,
  driveTimeFromClinton: string,
  landmarks: string[],
  neighborhoods: string[],
): PseoCity => ({
  slug,
  name,
  county,
  driveTimeFromBountiful,
  driveTimeFromClinton,
  landmarks,
  neighborhoods,
});

export const pseoCities: PseoCity[] = [
  city(
    "bountiful-ut", "Bountiful", "Davis", "4 minutes", "30 minutes",
    ["Bountiful Utah Temple", "Bountiful Tabernacle", "Mueller Park Trailhead"],
    ["Val Verda", "Mueller Park", "Maple Hills"],
  ),
  city(
    "clinton-ut", "Clinton", "Davis", "28 minutes", "4 minutes",
    ["Clinton City Park", "Clinton Veterans Memorial", "Cranefield Golf Course"],
    ["Cranefield Estates", "Town Point", "The Meadows"],
  ),
  city(
    "woods-cross-ut", "Woods Cross", "Davis", "6 minutes", "28 minutes",
    ["Hogan Park", "Mills Park", "Woods Cross High School"],
    ["Valentine Estates", "Clover Dell", "Farm Meadows"],
  ),
  city(
    "west-bountiful-ut", "West Bountiful", "Davis", "5 minutes", "27 minutes",
    ["West Bountiful City Park", "Lakeside Golf Course", "Legacy Parkway Trail"],
    ["High Gate Estates", "Stone Creek"],
  ),
  city(
    "north-salt-lake-ut", "North Salt Lake", "Davis", "9 minutes", "30 minutes",
    ["Eaglewood Golf Course", "Tunnel Springs Park", "Wild Rose Trailhead Park"],
    ["Foxboro", "Eaglewood"],
  ),
  city(
    "farmington-ut", "Farmington", "Davis", "10 minutes", "24 minutes",
    ["Lagoon Amusement Park", "Station Park", "S&S Shortline Railroad Park and Museum"],
    ["Clark Lane Historic District", "Farmington Ranches", "Oakridge"],
  ),
  city(
    "centerville-ut", "Centerville", "Davis", "6 minutes", "26 minutes",
    ["Island View Park", "Community Park", "Deuel Creek Trailhead"],
    ["Chase Lane Estates", "Parrish Lane District"],
  ),
  city(
    "layton-ut", "Layton", "Davis", "18 minutes", "18 minutes",
    ["Layton Commons Park", "Edward A. Kenley Centennial Amphitheater", "Layton Utah Temple"],
    ["East Layton", "Layton Hills", "Adamswood"],
  ),
  city(
    "kaysville-ut", "Kaysville", "Davis", "16 minutes", "19 minutes",
    ["Utah State University Botanical Center", "Kaysville Tabernacle", "Barnes Park"],
    ["Adron", "Angel's Way", "Barnes Country Estates"],
  ),
  city(
    "fruit-heights-ut", "Fruit Heights", "Davis", "13 minutes", "24 minutes",
    ["Nicholls Park", "Davis Park Golf Course", "Baer Creek Trailhead"],
    ["The Heights", "Hidden Hollow", "Whispering Oaks"],
  ),
  city(
    "clearfield-ut", "Clearfield", "Davis", "22 minutes", "10 minutes",
    ["Clearfield Aquatic and Fitness Center", "Bernard Fisher Park", "Freeport Center"],
    ["South Clearfield", "Legend Hills", "Falcon Hill"],
  ),
  city(
    "syracuse-ut", "Syracuse", "Davis", "22 minutes", "10 minutes",
    ["Jensen Nature Park", "Syracuse Regional Museum", "Founders Park"],
    ["Hansen Meadows", "Still Water", "Falcon Landing"],
  ),
  city(
    "west-point-ut", "West Point", "Davis", "25 minutes", "7 minutes",
    ["Loy Blake Park", "Bingham Park", "East Park"],
    ["Craythorne Homestead", "Bluff View", "Lakeside"],
  ),
  city(
    "sunset-ut", "Sunset", "Davis", "23 minutes", "6 minutes",
    ["Sunset Central Park", "John G. White Memorial Park", "Sunset City Hall"],
    ["Sunset Subdivision", "Enchanted Homes", "Maybrook Subdivision"],
  ),
  city(
    "roy-ut", "Roy", "Weber", "25 minutes", "12 minutes",
    ["Roy Aquatic Center", "George E. Wahlen Park", "Roy West Park"],
    ["Sandridge", "The Basin", "Lakeview"],
  ),
  city(
    "hooper-ut", "Hooper", "Weber", "33 minutes", "12 minutes",
    ["Hooper City Park", "Hooper Historical Museum", "Hooper Cemetery"],
    ["Muskrat Springs", "Hooperville", "Freedom Landing"],
  ),
  city(
    "west-haven-ut", "West Haven", "Weber", "32 minutes", "11 minutes",
    ["West Haven City Park", "Prevedel Park", "Weber River Parkway Trail"],
    ["Kanesville", "Wilson"],
  ),
  city(
    "ogden-ut", "Ogden", "Weber", "29 minutes", "18 minutes",
    ["Ogden Union Station", "Peery's Egyptian Theater", "George S. Eccles Dinosaur Park"],
    ["East Bench", "Shadow Valley", "Historic 25th Street"],
  ),
  city(
    "south-ogden-ut", "South Ogden", "Weber", "26 minutes", "22 minutes",
    ["Friendship Park", "Nature Park", "Burch Creek Park"],
    ["Burch Creek", "Pleasant Valley Estates", "Fox Chase"],
  ),
  city(
    "riverdale-ut", "Riverdale", "Weber", "27 minutes", "15 minutes",
    ["Riverdale Park", "Riverdale Bike Park", "Weber River Parkway Trail"],
    ["Stringtown", "Pinebrook", "River Glen Townhomes"],
  ),
  city(
    "washington-terrace-ut", "Washington Terrace", "Weber", "26 minutes", "18 minutes",
    ["Rohmer Park", "Bonneville High School", "T.H. Bell Junior High School"],
    ["Washington Terrace P", "Ridgeline Subdivision", "MJR Subdivision"],
  ),
  city(
    "south-weber-ut", "South Weber", "Davis", "22 minutes", "19 minutes",
    ["South Weber Family Activity Center", "Canyon Meadows Park", "Morrisite War historic site"],
    ["Riverwood", "Windsor Hill Estates", "Cedar Cove"],
  ),
  city(
    "uintah-ut", "Uintah", "Weber", "20 minutes", "20 minutes",
    ["Uintah City Park", "Weber River", "Weber Canyon"],
    ["Cottonwood Estates", "Nelmoy", "Aspyn Acres"],
  ),
  city(
    "morgan-ut", "Morgan", "Morgan", "34 minutes", "33 minutes",
    ["Morgan Union Pacific Depot", "Morgan High School Mechanical Arts Building", "Commercial Street"],
    ["Morgan Historic District", "North Morgan", "South Morgan"],
  ),
  city(
    "salt-lake-city-ut", "Salt Lake City", "Salt Lake", "20 minutes", "40 minutes",
    ["Temple Square", "Liberty Park", "This Is the Place Heritage Park"],
    ["The Avenues", "Sugar House", "Yalecrest"],
  ),
];
