"""Demo content for Isla Blanca. Image paths point to the frontend's `public/images/` folder."""

from decimal import Decimal

from app.models.enums import BedType, MembershipTier, PricingUnit

AMENITIES = [
    {"slug": "air-conditioning", "name": "Air conditioning", "icon": "amenity-air-conditioning"},
    {"slug": "in-room-dining", "name": "In-room dining", "icon": "amenity-restaurant"},
    {"slug": "minibar", "name": "Minibar", "icon": "amenity-minibar"},
    {"slug": "wifi", "name": "High-speed Wi-Fi", "icon": "amenity-wifi"},
    {"slug": "bathrobes", "name": "Bathrobes and spa towels", "icon": "amenity-towels"},
    {"slug": "smart-tv", "name": "Smart TV", "icon": "amenity-tv"},
    {"slug": "keycard", "name": "Keycard access", "icon": "amenity-keycard"},
    {"slug": "safe", "name": "In-room safe", "icon": "amenity-safe"},
]

ALL_AMENITIES = [amenity["slug"] for amenity in AMENITIES]
ESSENTIALS = ["air-conditioning", "wifi", "keycard", "safe", "smart-tv"]

ROOMS = [
    {
        "slug": "tropical-garden-suite",
        "name": "Tropical Garden Suite",
        "tagline": "A quiet suite wrapped in palms and bougainvillea.",
        "description": (
            "Set at the heart of our tropical gardens, this suite opens onto a private terrace "
            "shaded by palms. Natural stone, linen and warm wood create a calm retreat for "
            "families or couples who want space to slow down."
        ),
        "price_per_night": Decimal("389.00"),
        "size_m2": 85,
        "bed_type": BedType.KING,
        "max_guests": 6,
        "images": ["tropical-garden-suite.jpg", "detail-01.jpg", "detail-02.jpg"],
        "amenities": ALL_AMENITIES,
    },
    {
        "slug": "infinity-pool-villa",
        "name": "Infinity Pool Villa",
        "tagline": "Your own infinity pool, facing the Mediterranean sunset.",
        "description": (
            "A private villa with an infinity pool that melts into the sea line. Open-plan "
            "living, a shaded outdoor lounge and floor-to-ceiling glass make every evening "
            "feel like a private sunset show."
        ),
        "price_per_night": Decimal("649.00"),
        "size_m2": 120,
        "bed_type": BedType.KING,
        "max_guests": 4,
        "panorama_url": "/images/sereno/panorama-360.jpg",
        "images": ["infinity-pool-villa.jpg", "detail-03.jpg", "detail-01.jpg"],
        "amenities": ALL_AMENITIES,
    },
    {
        "slug": "sunset-premium-ocean-suite",
        "name": "Sunset Premium Ocean Suite",
        "tagline": "Wake up to uninterrupted sea views.",
        "description": (
            "Elegant interiors, a panoramic window and a balcony made for golden hour. The "
            "perfect retreat for two, a few steps from the beach club."
        ),
        "price_per_night": Decimal("299.00"),
        "size_m2": 57,
        "bed_type": BedType.QUEEN,
        "max_guests": 2,
        "images": ["sunset-premium-ocean-suite.jpg", "detail-02.jpg"],
        "amenities": [*ESSENTIALS, "minibar", "bathrobes"],
    },
    {
        "slug": "coastal-breeze-suite",
        "name": "Coastal Breeze Suite",
        "tagline": "Light, airy and steps from the shore.",
        "description": (
            "Whitewashed walls, soft linen and the sound of the waves. A bright suite with a "
            "sea-facing terrace, ideal for a relaxed island escape."
        ),
        "price_per_night": Decimal("259.00"),
        "size_m2": 59,
        "bed_type": BedType.QUEEN,
        "max_guests": 2,
        "images": ["coastal-breeze-suite.jpg", "detail-03.jpg"],
        "amenities": [*ESSENTIALS, "bathrobes"],
    },
    {
        "slug": "executive-ocean-residence",
        "name": "Executive Ocean Residence",
        "tagline": "Our largest residence, with a private deck over the sea.",
        "description": (
            "Two bedrooms, a dining room for six and a wraparound deck above the water. "
            "Designed for families and friends who want a home rather than a room."
        ),
        "price_per_night": Decimal("899.00"),
        "size_m2": 140,
        "bed_type": BedType.KING,
        "max_guests": 6,
        "images": ["executive-ocean-residence.jpg", "detail-01.jpg", "detail-02.jpg"],
        "amenities": ALL_AMENITIES,
    },
    {
        "slug": "private-garden-villa",
        "name": "Private Garden Villa",
        "tagline": "A secluded villa with its own walled garden.",
        "description": (
            "Hidden behind white stone walls, this villa has a private garden, an outdoor "
            "shower and a plunge pool. Complete privacy, minutes from the main terrace."
        ),
        "price_per_night": Decimal("549.00"),
        "size_m2": 110,
        "bed_type": BedType.KING,
        "max_guests": 4,
        "images": ["private-garden-villa.jpg", "detail-03.jpg"],
        "amenities": ALL_AMENITIES,
    },
    {
        "slug": "white-isle-loft",
        "name": "White Isle Loft",
        "tagline": "A bright loft inspired by Ibiza's white villages.",
        "description": (
            "Lime-washed walls, a sleeping mezzanine and a reading nook by the window. A "
            "charming option for couples exploring the island."
        ),
        "price_per_night": Decimal("219.00"),
        "size_m2": 48,
        "bed_type": BedType.DOUBLE,
        "max_guests": 2,
        "images": ["detail-01.jpg", "detail-02.jpg"],
        "amenities": ESSENTIALS,
    },
    {
        "slug": "cala-view-junior-suite",
        "name": "Cala View Junior Suite",
        "tagline": "Overlooking the hidden cove below the resort.",
        "description": (
            "A junior suite with a sofa bed for a third guest and a balcony overlooking the "
            "cove. Morning swims are a short path away."
        ),
        "price_per_night": Decimal("239.00"),
        "size_m2": 52,
        "bed_type": BedType.QUEEN,
        "max_guests": 3,
        "images": ["detail-02.jpg", "detail-03.jpg"],
        "amenities": [*ESSENTIALS, "minibar"],
    },
    {
        "slug": "es-vedra-sunset-suite",
        "name": "Es Vedrà Sunset Suite",
        "tagline": "Front-row seats to Ibiza's most famous sunset.",
        "description": (
            "Facing the legendary rock of Es Vedrà, this suite has a sunset terrace with a "
            "daybed and an outdoor bathtub. Made for anniversaries and honeymoons."
        ),
        "price_per_night": Decimal("349.00"),
        "size_m2": 64,
        "bed_type": BedType.KING,
        "max_guests": 2,
        "images": ["detail-03.jpg", "detail-01.jpg"],
        "amenities": ALL_AMENITIES,
    },
    {
        "slug": "salinas-family-suite",
        "name": "Salinas Family Suite",
        "tagline": "Space for the whole family, near the kids' pool.",
        "description": (
            "Two connected rooms, a lounge and a terrace on the garden level. Close to the "
            "family pool, with cots and children's amenities on request."
        ),
        "price_per_night": Decimal("429.00"),
        "size_m2": 95,
        "bed_type": BedType.DOUBLE,
        "max_guests": 5,
        "images": ["detail-02.jpg", "detail-01.jpg", "detail-03.jpg"],
        "amenities": [*ESSENTIALS, "in-room-dining", "minibar"],
    },
]

SERVICES = [
    {
        "slug": "wellness-spa",
        "name": "Wellness & Spa",
        "description": "Holistic treatments, private yoga and the oceanfront steam lounge.",
        "price": Decimal("180.00"),
        "pricing_unit": PricingUnit.PER_GUEST,
        "icon": "service-spa",
    },
    {
        "slug": "sunset-dining",
        "name": "Sunset Dining",
        "description": "A Mediterranean tasting menu on the cliff terrace at golden hour.",
        "price": Decimal("140.00"),
        "pricing_unit": PricingUnit.PER_GUEST,
        "icon": "service-dining",
    },
    {
        "slug": "private-yacht",
        "name": "Private Yacht Day",
        "description": "A skippered day on the water to hidden beaches and Formentera.",
        "price": Decimal("1200.00"),
        "pricing_unit": PricingUnit.PER_STAY,
        "icon": "service-yacht",
    },
    {
        "slug": "breakfast",
        "name": "Breakfast on the Terrace",
        "description": "Daily breakfast served on your terrace or by the pool.",
        "price": Decimal("45.00"),
        "pricing_unit": PricingUnit.PER_NIGHT,
        "icon": None,
    },
    {
        "slug": "airport-transfer",
        "name": "Airport Transfer",
        "description": "Private chauffeur from Ibiza Airport to the resort and back.",
        "price": Decimal("95.00"),
        "pricing_unit": PricingUnit.PER_STAY,
        "icon": None,
    },
]

GUESTS = [
    {
        "email": "sofia.carter@islablanca.test",
        "first_name": "Sofia",
        "last_name": "Carter",
        "phone": "+44 20 7946 0958",
        "country": "United Kingdom",
        "membership_tier": MembershipTier.GOLD,
    },
    {
        "email": "daniel.morgan@islablanca.test",
        "first_name": "Daniel",
        "last_name": "Morgan",
        "phone": "+1 415 555 0136",
        "country": "United States",
        "membership_tier": MembershipTier.SILVER,
    },
]

# Days are relative to the day the seed runs, so the demo always has past and future stays.
BOOKINGS = [
    {
        "guest": "sofia.carter@islablanca.test",
        "room": "tropical-garden-suite",
        "starts_in_days": -40,
        "nights": 5,
        "adults": 2,
        "children": 1,
        "status": "completed",
        "services": ["wellness-spa", "breakfast"],
        "review": {
            "rating": 5,
            "title": "Pure calm",
            "comment": "The garden terrace was magical and the staff remembered every detail.",
        },
    },
    {
        "guest": "daniel.morgan@islablanca.test",
        "room": "sunset-premium-ocean-suite",
        "starts_in_days": -20,
        "nights": 4,
        "adults": 2,
        "children": 0,
        "status": "completed",
        "services": ["sunset-dining"],
        "review": {
            "rating": 4,
            "title": "Unforgettable sunsets",
            "comment": "Stunning views and great food. The beach club got busy in the afternoon.",
        },
    },
    {
        "guest": "sofia.carter@islablanca.test",
        "room": "infinity-pool-villa",
        "starts_in_days": 14,
        "nights": 4,
        "adults": 2,
        "children": 0,
        "status": "confirmed",
        "services": ["private-yacht", "airport-transfer"],
        "special_requests": "Anniversary trip, a bottle of cava on arrival would be lovely.",
    },
    {
        # Same villa and dates as above, but cancelled: it does not block the room.
        "guest": "daniel.morgan@islablanca.test",
        "room": "infinity-pool-villa",
        "starts_in_days": 15,
        "nights": 2,
        "adults": 2,
        "children": 0,
        "status": "cancelled",
        "services": [],
    },
    {
        "guest": "daniel.morgan@islablanca.test",
        "room": "coastal-breeze-suite",
        "starts_in_days": 30,
        "nights": 3,
        "adults": 1,
        "children": 0,
        "status": "pending",
        "services": ["breakfast", "airport-transfer"],
    },
]
