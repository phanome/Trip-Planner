export const SAMPLE_ICELAND_ITINERARY = {
  tripTitle: "Iceland Ring Road & Northern Lights Adventure",
  destination: "Reykjavik & South Coast, Iceland",
  totalDays: 4,
  days: [
    {
      id: "day-1-golden-circle",
      dayNumber: 1,
      title: "The Golden Circle & Geothermal Wonders",
      stops: [
        {
          id: "thingvellir-national-park",
          name: "Þingvellir National Park",
          type: "nature",
          description:
            "Walk between tectonic plates in this UNESCO World Heritage Site, rich in Viking history and dramatic continental rift valleys.",
          duration: "2.5 hours",
          costRange: "Free (Parking ~$8)",
          tips: "Arrive before 10 AM to experience the Öxarárfoss waterfall trail before tour buses arrive.",
          address: "Thingvellir, 801 Selfoss",
        },
        {
          id: "geysir-geothermal-area",
          name: "Strokkur & Geysir Geothermal Area",
          type: "nature",
          description:
            "Watch Strokkur erupt scalding water 20 meters into the air every 6-10 minutes, surrounded by bubbling mud pools and steaming vents.",
          duration: "1.5 hours",
          costRange: "Free",
          tips: "Stand upwind of the geyser to avoid sulphur steam and damp clothes.",
          address: "Haukadalur Valley, Route 35",
        },
        {
          id: "gullfoss-waterfall",
          name: "Gullfoss (Golden Falls)",
          type: "nature",
          description:
            "Marvel at the immense roaring power of the two-tiered waterfall plunging into the Hvítá canyon, often crowned with double rainbows.",
          duration: "1.5 hours",
          costRange: "Free",
          tips: "Wear waterproof jackets as spray will reach the lower observation walkway.",
          address: "Gullfoss Access Rd, 801",
        },
        {
          id: "fridheimar-tomato-farm",
          name: "Friðheimar Greenhouse Restaurant",
          type: "food",
          description:
            "Enjoy world-famous all-you-can-eat tomato soup and fresh bread right amidst bumblebees and lush geothermal greenhouse vines.",
          duration: "1.5 hours",
          costRange: "$25-35 per person",
          tips: "Book at least 2 weeks in advance or arrive at 11:45 AM for walk-in bar seating.",
          address: "Reykholt, 801",
        },
      ],
    },
    {
      id: "day-2-south-coast",
      dayNumber: 2,
      title: "Majestic Waterfalls & Black Sand Coastline",
      stops: [
        {
          id: "seljalandsfoss",
          name: "Seljalandsfoss Waterfall",
          type: "nature",
          description:
            "A breathtaking 60m waterfall with a hidden path allowing you to walk completely behind the curtain of falling water.",
          duration: "1.5 hours",
          costRange: "Parking ~$6",
          tips: "Bring full rain gear and waterproof phone cases for the behind-the-falls trail.",
          address: "Route 1, South Coast",
        },
        {
          id: "skogafoss",
          name: "Skógafoss & Cliff Stairs",
          type: "nature",
          description:
            "One of Iceland's largest and most classic waterfalls. Climb 527 stairs to the crest for sweeping views over the southern coast.",
          duration: "2 hours",
          costRange: "Free",
          tips: "Walk past the viewing platform along the waterfall way trail for extra quiet canyons.",
          address: "Skógar, 861",
        },
        {
          id: "reynisfjara-black-sand",
          name: "Reynisfjara Black Sand Beach",
          type: "nature",
          description:
            "Atmospheric black volcanic sands, towering basalt sea stacks, and dramatic hexagonal columns formed by ancient cooled lava.",
          duration: "1.5 hours",
          costRange: "Free",
          tips: "Never turn your back to the ocean — sneaker waves are powerful and unpredictable.",
          address: "Vik í Mýrdal, 870",
        },
        {
          id: "sudur-vik-restaurant",
          name: "Suður-Vík Dinner",
          type: "food",
          description:
            "Cozy hilltop restaurant in a historic house serving authentic Arctic char, lamb shank, and homemade skyr cake.",
          duration: "2 hours",
          costRange: "$35-55 per person",
          tips: "Try the baked local Arctic char with honey and almonds.",
          address: "Suðurvegur 1, Vík",
        },
      ],
    },
    {
      id: "day-3-glacier-lagoon",
      dayNumber: 3,
      title: "Glaciers & Sparkling Diamond Ice",
      stops: [
        {
          id: "jokulsarlon-glacier-lagoon",
          name: "Jökulsárlón Glacier Lagoon",
          type: "activity",
          description:
            "Huge electric-blue icebergs calve off the Breiðamerkurjökull glacier and drift gracefully across a deep serene lagoon into the Atlantic.",
          duration: "2.5 hours",
          costRange: "Free / Zodiac boat ~$80",
          tips: "Look out for seals lounging on floating ice chunks near the lagoon outlet.",
          address: "Jökulsárlón, Route 1",
        },
        {
          id: "diamond-beach",
          name: "Diamond Beach (Breiðamerkursandur)",
          type: "nature",
          description:
            "Glittering chunks of crystal-clear glacial ice wash up onto the pitch-black shore, creating an otherworldly contrast.",
          duration: "1.5 hours",
          costRange: "Free",
          tips: "Visit during late afternoon light for golden sun reflections through the translucent ice blocks.",
          address: "Opposite Jökulsárlón Lagoon",
        },
        {
          id: "pakkhus-restaurant-hofn",
          name: "Pakkhús Restaurant (Höfn)",
          type: "food",
          description:
            "Renowned maritime harbor restaurant celebrated for its garlic-butter baked langoustines and craft Icelandic ales.",
          duration: "2 hours",
          costRange: "$50-75 per person",
          tips: "The whole langoustine tail platter is a local culinary legend.",
          address: "Krosseyjarvegur 3, 780 Höfn",
        },
      ],
    },
    {
      id: "day-4-reykjavik-lagoon",
      dayNumber: 4,
      title: "Reykjavík Culture & Geothermal Relaxation",
      stops: [
        {
          id: "hallgrimskirkja",
          name: "Hallgrímskirkja Church & Tower",
          type: "attraction",
          description:
            "Iceland's iconic expressionist cathedral modeled after basalt columns, featuring an elevator to panoramic 360° city views.",
          duration: "1 hour",
          costRange: "Church: Free / Tower: ~$10",
          tips: "Listen to the 5,275-pipe organ if you visit on a weekday morning.",
          address: "Hallgrímstorg 1, 101 Reykjavík",
        },
        {
          id: "braud-and-co",
          name: "Brauð & Co Bakery",
          type: "food",
          description:
            "Artisan sourdough bakery known throughout Scandinavia for its hot, gooey cinnamon and cardamom buns pulled fresh from the oven.",
          duration: "45 mins",
          costRange: "$5-12",
          tips: "Order the warm vanilla-cardamom bun with fresh coffee.",
          address: "Frakkastígur 16, 101 Reykjavík",
        },
        {
          id: "sky-lagoon-experience",
          name: "Sky Lagoon Geothermal Ritual",
          type: "activity",
          description:
            "Oceanfront geothermal infinity pool overlooking the North Atlantic, complete with a traditional 7-step Icelandic spa ritual.",
          duration: "3 hours",
          costRange: "$75-100 per person",
          tips: "Book the sunset slot to soak while watching twilight over the ocean waves.",
          address: "Vesturvör 44, 200 Kópavogur",
        },
      ],
    },
  ],
};
