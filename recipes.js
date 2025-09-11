/** recipes.js
 * Uses INGREDIENTS.*.name to ensure consistent ingredient labels.
 * Requires ingredients.js to be loaded first.
 */
/** ingredients.js
 * Define aisles (with order) and a single source of truth for all ingredient names.
 * Load this BEFORE recipes.js in index.html.
 */

const UNIT = {
  // Weight
  GRAM: "g",
  KILOGRAM: "kg",
  OUNCE: "oz",
  POUND: "lb",

  // Volume (metric)
  MILLILITER: "ml",
  LITER: "l",

  // Volume (imperial/US style)
  TEASPOON: "tsp",
  TABLESPOON: "tbsp",
  CUP: "cup",

  // Count / size
  PIECES: "piece",    // plural-safe option
  SLICES: "slice",
  HANDFUL: "handful",
  SMALL: "small",      // e.g., 2 small eggs
  MEDIUM: "medium",
  LARGE: "large",

  // Cans / tins / packs
  TIN: "tin",
  CAN: "can",
  PACK: "pack",

  // Cooking measures
  PINCH: "pinch",
  DASH: "dash",
  SPRIG: "sprig",
  CLOVE: "clove",
  LEAF: "leaf",

  // Special
  HEAD: "head",  // e.g., 1 head of broccoli
  STALK: "stalk",   // e.g., 2 stalks of celery
  NONE: ""                     // for when you don’t want a unit
};


const AISLE = {
  MEAT: { name: "Meat", order: 1 },
  POULTRY: { name: "Poultry", order: 2 },

  VEG: { name: "Veg", order: 3 },
  FRUIT: { name: "Fruit", order: 4 },
  FISH: { name: "Fish", order: 5 },
  DAIRY: { name: "Dairy", order: 6 },
  FROZEN: { name: "Frozen", order: 7 },

  HERBS_SPICES: { name: "Herbs & Spices", order: 8 },
  OILS: { name: "Oils & Fats", order: 9 },
  TINS_JARS: { name: "Tins & Jars", order: 10 },
  GRAINS_PASTA: { name: "Grains & Pasta", order: 11 },
  CONDIMENTS: { name: "Condiments & Sauces", order: 12 },


  BAKERY: { name: "Bakery", order: 13 },
  NUTS: { name: "Nuts", order: 14 },
  SEEDS: { name: "Seeds", order: 15 },
  BEVERAGES: { name: "Beverages", order: 16 },
  MISC: { name: "Misc", order: 17 },



};

const INGREDIENTS = {
  // Grains / bakery / flours
  ROLLED_OATS: { name: "Rolled oats", aisle: AISLE.GRAINS_PASTA, key: "ROLLED_OATS" },
  PLAIN_FLOUR: { name: "Plain flour", aisle: AISLE.BAKERY, key: "PLAIN_FLOUR" },
  ALMOND_FLOUR: { name: "Almond flour", aisle: AISLE.BAKERY, key: "ALMOND_FLOUR" },
  PAELLA_RICE: { name: "Paella rice", aisle: AISLE.GRAINS_PASTA, key: "PAELLA_RICE" },
  BREAD: { name: "Bread", aisle: AISLE.BAKERY, key: "BREAD" },
  WHOLEMEAL_BREAD: { name: "Wholemeal bread", aisle: AISLE.BAKERY, key: "WHOLEMEAL_BREAD" },
  FLOUR_TORTILLAS: { name: "Flour tortillas", aisle: AISLE.BAKERY, key: "FLOUR_TORTILLAS" },

  // Dairy & eggs
  GREEK_YOGURT: { name: "Greek yogurt", aisle: AISLE.DAIRY, key: "GREEK_YOGURT" },
  MILK: { name: "Milk", aisle: AISLE.DAIRY, key: "MILK" },
  BUTTER: { name: "Butter", aisle: AISLE.DAIRY, key: "BUTTER" },
  DOUBLE_CREAM: { name: "Double cream", aisle: AISLE.DAIRY, key: "DOUBLE_CREAM" },
  CHEESE: { name: "Cheese", aisle: AISLE.DAIRY, key: "CHEESE" },
  MOZZARELLA: { name: "Mozzarella", aisle: AISLE.DAIRY, key: "MOZZARELLA" },
  PARMESAN_CHEESE: { name: "Parmesan", aisle: AISLE.DAIRY, key: "PARMESAN_CHEESE" },
  FETA_CHEESE: { name: "Feta cheese", aisle: AISLE.DAIRY, key: "FETA_CHEESE" },
  HALLOUMI: { name: "Halloumi", aisle: AISLE.DAIRY, key: "HALLOUMI" },
  EGGS: { name: "Eggs", aisle: AISLE.BAKERY, key: "EGGS" },

  // Meat / poultry / fish
  CHICKEN_BREAST: { name: "Chicken breast", aisle: AISLE.POULTRY, key: "CHICKEN_BREAST" },
  CHICKEN_WINGS: { name: "Chicken wings", aisle: AISLE.POULTRY, key: "CHICKEN_WINGS" },
  TURKEY_BREAST: { name: "Turkey breast", aisle: AISLE.POULTRY, key: "TURKEY_BREAST" },
  TURKEY_MINCE: { name: "Turkey mince", aisle: AISLE.POULTRY, key: "TURKEY_MINCE" },
  STREAKY_BACON: { name: "Streaky bacon", aisle: AISLE.MEAT, key: "STREAKY_BACON" },
  GROUND_BEEF: { name: "Beef Mince (3% fat) ", aisle: AISLE.MEAT, key: "GROUND_BEEF" },
  BEEF_ROAST: { name: "Beef roast", aisle: AISLE.MEAT, key: "BEEF_ROAST" },
  PORK_BELLY: { name: "Pork belly", aisle: AISLE.MEAT, key: "PORK_BELLY" },
  SALMON_FILLET: { name: "Salmon fillet", aisle: AISLE.FISH, key: "SALMON_FILLET" },
  WHITE_FISH: { name: "White fish", aisle: AISLE.FISH, key: "WHITE_FISH" },
  SIRLOIN_STEAK: { name: "Sirloin  Steak", aisle: AISLE.MEAT, key: "SIRLOIN_STEAK" },


  // Veg
  BROCCOLI: { name: "Broccoli", aisle: AISLE.VEG, key: "BROCCOLI" },
  TURNIP: { name: "Turnip", aisle: AISLE.VEG, key: "TURNIP" },
  LETTUCE_LEAVES: { name: "Lettuce leaves", aisle: AISLE.VEG, key: "LETTUCE_LEAVES" },
  SALAD_LEAVES: { name: "Salad leaves", aisle: AISLE.VEG, key: "SALAD_LEAVES" },
  SPINACH: { name: "Spinach", aisle: AISLE.VEG, key: "SPINACH" },
  ZUCCHINI: { name: "Zucchini", aisle: AISLE.VEG, key: "ZUCCHINI" },
  GARLIC: { name: "Garlic", aisle: AISLE.VEG, key: "GARLIC" },
  GINGER: { name: "Ginger", aisle: AISLE.VEG, key: "GINGER" },
  GREEN_BELL_PEPPER: { name: "Green bell pepper", aisle: AISLE.VEG, key: "GREEN_BELL_PEPPER" },
  RED_BELL_PEPPER: { name: "Red bell pepper", aisle: AISLE.VEG, key: "RED_BELL_PEPPER" },
  ONION: { name: "Onion", aisle: AISLE.VEG, key: "ONION" },
  RED_ONION: { name: "Red onion", aisle: AISLE.VEG, key: "RED_ONION" },
  SPRING_ONION: { name: "Spring onion", aisle: AISLE.VEG, key: "SPRING_ONION" },
  PAK_CHOI: { name: "Pak choi", aisle: AISLE.VEG, key: "PAK_CHOI" },
  CELERY: { name: "Celery", aisle: AISLE.VEG, key: "CELERY" },
  CARROT: { name: "Carrot", aisle: AISLE.VEG, key: "CARROT" },
  CUCUMBER: { name: "Cucumber", aisle: AISLE.VEG, key: "CUCUMBER" },
  CHERRY_TOMATOES: { name: "Cherry tomatoes", aisle: AISLE.VEG, key: "CHERRY_TOMATOES" },
  SCALLIONS: { name: "Scallions", aisle: AISLE.VEG, key: "SCALLIONS" },
  POTATOES: { name: "Potatoes", aisle: AISLE.VEG, key: "POTATOES" },
  SWEET_POTATO: { name: "Sweet potato", aisle: AISLE.VEG, key: "SWEET_POTATO" },

  TOMATO_PASTE: { name: "Tomato paste", aisle: AISLE.TINS_JARS, key: "TOMATO_PASTE" },
  TINNED_TOMATOES: { name: "Tinned tomatoes", aisle: AISLE.TINS_JARS, key: "TINNED_TOMATOES" },
  TOMATO_SAUCE: { name: "Tomato sauce", aisle: AISLE.TINS_JARS, key: "TOMATO_SAUCE" },

  BASIL: { name: "Basil", aisle: AISLE.HERBS_SPICES, key: "BASIL" },
  THYME: { name: "Thyme (dried)", aisle: AISLE.HERBS_SPICES, key: "THYME" },
  ROSEMARY: { name: "Rosemary (dried)", aisle: AISLE.HERBS_SPICES, key: "ROSEMARY" },
  BAY_LEAF: { name: "Bay leaf", aisle: AISLE.HERBS_SPICES, key: "BAY_LEAF" },
  CHIVES: { name: "Chives", aisle: AISLE.HERBS_SPICES, key: "CHIVES" },

  // Fruit
  LEMON: { name: "Lemon", aisle: AISLE.FRUIT, key: "LEMON" },
  LEMON_JUICE: { name: "Lemon juice", aisle: AISLE.FRUIT, key: "LEMON_JUICE" },
  LIME_JUICE: { name: "Lime juice", aisle: AISLE.FRUIT, key: "LIME_JUICE" },
  BANANA: { name: "Banana", aisle: AISLE.FRUIT, key: "BANANA" },
  APPLE: { name: "Apple", aisle: AISLE.FRUIT, key: "APPLE" },
  PEACH: { name: "Peach", aisle: AISLE.FRUIT, key: "PEACH" },
  AVOCADO: { name: "Avocado", aisle: AISLE.FRUIT, key: "AVOCADO" },
  MIXED_BERRIES: { name: "Mixed berries", aisle: AISLE.FRUIT, key: "MIXED_BERRIES" },
  PINEAPPLE_CHUNKS: { name: "Pineapple chunks", aisle: AISLE.TINS_JARS, key: "PINEAPPLE_CHUNKS" },
  LEMON_ZEST: { name: "Lemon zest", aisle: AISLE.HERBS_SPICES, key: "LEMON_ZEST" },

  // Legumes / tins
  CHICKPEAS: { name: "Chickpeas", aisle: AISLE.TINS_JARS, key: "CHICKPEAS" },
  BUTTER_BEANS: { name: "Butter beans", aisle: AISLE.TINS_JARS, key: "BUTTER_BEANS" },
  BROWN_LENTILS: { name: "Brown lentils", aisle: AISLE.TINS_JARS, key: "BROWN_LENTILS" },
  HUMMUS: { name: "Hummus", aisle: AISLE.TINS_JARS, key: "HUMMUS" },
  CAPERS: { name: "Capers", aisle: AISLE.TINS_JARS, key: "CAPERS" },
  GREEN_OLIVES: { name: "Green olives", aisle: AISLE.TINS_JARS, key: "GREEN_OLIVES" },

  // Nuts & seeds
  ALMONDS: { name: "Almonds", aisle: AISLE.NUTS, key: "ALMONDS" },
  CASHEWS: { name: "Cashews", aisle: AISLE.NUTS, key: "CASHEWS" },
  WALNUTS: { name: "Walnuts", aisle: AISLE.NUTS, key: "WALNUTS" },
  ALMOND_BUTTER: { name: "Almond butter", aisle: AISLE.NUTS, key: "ALMOND_BUTTER" },
  PEANUT_BUTTER: { name: "Peanut butter", aisle: AISLE.NUTS, key: "PEANUT_BUTTER" },
  COCONUT_FLAKES: { name: "Coconut flakes", aisle: AISLE.BAKERY, key: "COCONUT_FLAKES" },
  SESAME_SEEDS: { name: "Sesame seeds", aisle: AISLE.SEEDS, key: "SESAME_SEEDS" },
  CHIA_SEEDS: { name: "Chia seeds", aisle: AISLE.SEEDS, key: "CHIA_SEEDS" },

  // Oils / condiments / sauces
  OLIVE_OIL: { name: "Olive oil", aisle: AISLE.OILS, key: "OLIVE_OIL" },
  PESTO: { name: "Pesto", aisle: AISLE.CONDIMENTS, key: "PESTO" },
  SOY_SAUCE: { name: "Soy sauce", aisle: AISLE.CONDIMENTS, key: "SOY_SAUCE" },
  WORCESTERSHIRE_SAUCE: { name: "Worcestershire sauce", aisle: AISLE.CONDIMENTS, key: "WORCESTERSHIRE_SAUCE" },
  FRANKS_HOT_SAUCE: { name: "Frank’s Hot Sauce", aisle: AISLE.CONDIMENTS, key: "FRANKS_HOT_SAUCE" },
  MAPLE_SYRUP: { name: "Maple syrup", aisle: AISLE.BAKERY, key: "MAPLE_SYRUP" },
  VANILLA_EXTRACT: { name: "Vanilla extract", aisle: AISLE.BAKERY, key: "VANILLA_EXTRACT" },
  COCONUT_WATER: { name: "Coconut water", aisle: AISLE.FRUIT, key: "COCONUT_WATER" },

  // Stocks / broth
  STOCK: { name: "Stock", aisle: AISLE.MISC, key: "STOCK" },

  // Seasoning
  SALT: { name: "Salt", aisle: AISLE.HERBS_SPICES, key: "SALT" },
  BLACK_PEPPER: { name: "Black pepper", aisle: AISLE.HERBS_SPICES, key: "BLACK_PEPPER" },
  SMOKED_PAPRIKA: { name: "Smoked paprika", aisle: AISLE.HERBS_SPICES, key: "SMOKED_PAPRIKA" },
  CHILI_FLAKES: { name: "Chili flakes", aisle: AISLE.HERBS_SPICES, key: "CHILI_FLAKES" },
  ITALIAN_SEASONING: { name: "Italian seasoning", aisle: AISLE.HERBS_SPICES, key: "ITALIAN_SEASONING" },
  CUMIN: { name: "Cumin", aisle: AISLE.HERBS_SPICES, key: "CUMIN" },
  CINNAMON: { name: "Cinnamon", aisle: AISLE.HERBS_SPICES, key: "CINNAMON" },
  SUGAR: { name: "Sugar", aisle: AISLE.BAKERY, key: "SUGAR" },

  // Starches & odds
  BREADCRUMBS: { name: "Breadcrumbs", aisle: AISLE.BAKERY, key: "BREADCRUMBS" },
  BAKING_POWDER: { name: "Baking powder", aisle: AISLE.BAKERY, key: "BAKING_POWDER" },
  CORN_FLOUR: { name: "Corn flour", aisle: AISLE.BAKERY, key: "CORN_FLOUR" },
  CRISPS: { name: "Crisps", aisle: AISLE.MISC, key: "CRISPS" },
  AREPA_FLOUR_HARINA_PAN: { name: "Harina PAN", aisle: AISLE.MISC, key: "AREPA_FLOUR_HARINA_PAN" },
  WATER: { name: "Water", aisle: AISLE.BEVERAGES, key: "WATER" },
  RUM: { name: "Rum", aisle: AISLE.BEVERAGES, key: "RUM" },
  PEAS_PETIT_POIS: { name: "Petit pois", aisle: AISLE.FROZEN, key: "PEAS_PETIT_POIS" },
  GREEN_BEANS_FROZEN: { name: "Green beans (frozen)", aisle: AISLE.FROZEN, key: "GREEN_BEANS_FROZEN" },
  ROSEMARY_SPRIG: { name: "Rosemary sprig", aisle: AISLE.VEG, key: "ROSEMARY_SPRIG" },

  // Sweeteners
  HONEY: { name: "Honey", aisle: AISLE.BAKERY, key: "HONEY" },

  // Extra veg & proteins
  MUSHROOMS: { name: "Mushrooms", aisle: AISLE.VEG, key: "MUSHROOMS" },
  FIRM_TOFU: { name: "Firm tofu", aisle: AISLE.MEAT, key: "FIRM_TOFU" },

  // Seasonings & powders
  ONION_POWDER: { name: "Onion powder", aisle: AISLE.HERBS_SPICES, key: "ONION_POWDER" },
  GARLIC_POWDER: { name: "Garlic powder", aisle: AISLE.HERBS_SPICES, key: "GARLIC_POWDER" },
  CURRY_POWDER: { name: "Curry powder", aisle: AISLE.HERBS_SPICES, key: "CURRY_POWDER" },
  TURMERIC: { name: "Turmeric", aisle: AISLE.HERBS_SPICES, key: "TURMERIC" },

  // Baking & dough
  DRY_YEAST: { name: "Dry yeast", aisle: AISLE.BAKERY, key: "DRY_YEAST" },

  // Meats
  CHORIZO: { name: "Chorizo", aisle: AISLE.MEAT, key: "CHORIZO" },

  // Grains
  RISOTTO_RICE: { name: "Risotto rice", aisle: AISLE.GRAINS_PASTA, key: "RISOTTO_RICE" },
  JASMINE_RICE: { name: "Jasmine rice", aisle: AISLE.GRAINS_PASTA, key: "JASMINE_RICE" },

  // Condiments & extras
  JALAPENOS: { name: "Jalapeños", aisle: AISLE.CONDIMENTS, key: "JALAPENOS" },
  TUNA: { name: "Tuna", aisle: AISLE.TINS_JARS, key: "TUNA" },
  RICE_UNCOOKED: { name: "Uncooked rice", aisle: AISLE.GRAINS_PASTA, key: "RICE_UNCOOKED" },
};



// --- Aisle helpers for shopping list sorting & styling ---
const AISLE_OBJ_TO_KEY = new Map(Object.entries(AISLE).map(([k, obj]) => [obj, k]));
const NAME_TO_ING = new Map(
  Object.entries(INGREDIENTS).map(([key, v]) => [v.name, { key, aisleObj: v.aisle }])
);
function getAisleInfoByName(name) {
  const inf = NAME_TO_ING.get(name);
  if (!inf) return { key: 'MISC', order: 999, cssKey: 'misc', name: 'Misc' };
  const aisleObj = inf.aisleObj;
  const cssKey = (AISLE_OBJ_TO_KEY.get(aisleObj) || 'MISC').toLowerCase();
  return { key: cssKey.toUpperCase(), order: aisleObj.order ?? 999, cssKey, name: aisleObj.name };
}


// Tiny helper to keep arrays tidy
const N = (key, quantity, unit) => {
  if (!INGREDIENTS[key]) {
    console.error(`❌ Missing ingredient key in INGREDIENTS: "${key}"`);
    return { name: key, quantity, unit }; // fallback to raw key so it still shows
  }
  return { name: INGREDIENTS[key].name, quantity, unit };
};


const recipeData = [
  {
    id: 1,
    meal: ["breakfast"],
    recipe: "Overnight Oats",
    defaultServings: 2,
    calories: 880,
    ingredients: [
      N(INGREDIENTS.ROLLED_OATS.key, 40, UNIT.GRAM),
      N(INGREDIENTS.GREEK_YOGURT.key, 100, UNIT.GRAM),
      N(INGREDIENTS.MILK.key, 200, UNIT.MILLILITER),
      N(INGREDIENTS.MIXED_BERRIES.key, 100, UNIT.GRAM),
      N(INGREDIENTS.CHIA_SEEDS.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.HONEY.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.PEANUT_BUTTER.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.BANANA.key, 1, UNIT.PIECES),
      N(INGREDIENTS.CINNAMON.key, 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Combine oats, yogurt, milk, chia seeds, and peanut butter.",
      "Mix well and refrigerate overnight.",
      "In the morning, stir and top with berries, banana slices, honey, and cinnamon."
    ]
  },
  {
    id: 2,
    meal: ["breakfast"],
    recipe: "Scrambled Eggs with Spinach & Avocado",
    defaultServings: 2,
    calories: 734,
    ingredients: [
      N(INGREDIENTS.EGGS.key, 8, UNIT.SMALL),
      N(INGREDIENTS.BUTTER.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SPINACH.key, 60, UNIT.GRAM),
      N(INGREDIENTS.AVOCADO.key, 1, UNIT.MEDIUM)
    ],
    steps: [
      "Slice or mash avocado and set aside.",
      "Sauté spinach in a non-stick pan until wilted. Remove and plate.",
      "Whisk eggs with salt to taste.",
      "Heat butter in a pan, add eggs, and stir continuously until softly scrambled.",
      "Serve eggs with spinach and avocado on the side."
    ]
  },
  {
    id: 3,
    meal: ["lunch"],
    recipe: "Grilled Chicken Salad with Avocado, Chickpeas & Feta",
    defaultServings: 2,
    calories: 1210,
    ingredients: [
      N(INGREDIENTS.CHICKEN_BREAST.key, 240, UNIT.GRAM),
      N(INGREDIENTS.SALAD_LEAVES.key, 2, UNIT.HANDFUL),
      N(INGREDIENTS.CUCUMBER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.CHERRY_TOMATOES.key, 10, UNIT.PIECES),
      N(INGREDIENTS.CARROT.key, 2, UNIT.PIECES),
      N(INGREDIENTS.LEMON.key, 1, UNIT.PIECES),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.AVOCADO.key, 1, UNIT.MEDIUM),
      N(INGREDIENTS.CHICKPEAS.key, 150, UNIT.GRAM),
      N(INGREDIENTS.FETA_CHEESE.key, 40, UNIT.GRAM)
    ],
    steps: [
      "Cook and slice the chicken breast. Let rest if made in advance.",
      "Wash and prep the salad leaves, cucumber, tomatoes, and carrots.",
      "Slice avocado and drain chickpeas.",
      "Crumble feta over the vegetables.",
      "In a small bowl, mix lemon juice and 2 tbsp olive oil for dressing.",
      "Combine all ingredients in a large bowl and toss with dressing.",
      "Top with grilled chicken and serve."
    ]
  },
  {
    id: 4,
    meal: ["dinner"],
    recipe: "Baked Salmon with Avocado & Nut Salad",
    defaultServings: 2,
    calories: 1200,
    ingredients: [
      N(INGREDIENTS.SALMON_FILLET.key, 2, UNIT.PIECES),
      N(INGREDIENTS.BROCCOLI.key, 1, UNIT.HEAD),
      N(INGREDIENTS.CARROT.key, 2, UNIT.PIECES),
      N(INGREDIENTS.SALAD_LEAVES.key, 2, UNIT.HANDFUL),
      N(INGREDIENTS.LEMON.key, 1, UNIT.PIECES),
      N(INGREDIENTS.OLIVE_OIL.key, 3, UNIT.TABLESPOON),
      N(INGREDIENTS.AVOCADO.key, 1, UNIT.MEDIUM),
      N(INGREDIENTS.GINGER.key, 30, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON)
    ],
    steps: [
      "Preheat oven to 180°C.",
      "Cut broccoli into florets and toss with 1 tbsp olive oil and salt.",
      "Spread broccoli on a baking tray and roast for 10 minutes.",
      "Add salmon fillets in the center, drizzle with olive oil and season.",
      "Bake for another 20 minutes until salmon is cooked and broccoli tender.",
      "Spiralize carrots and toss with salad leaves, avocado (sliced), and chopped almonds.",
      "Make a dressing with lemon juice and 1 tbsp olive oil, and toss with salad.",
      "Serve the baked salmon with roasted broccoli and the avocado-nut salad."
    ]
  },
  {
    id: 5,
    meal: ["dinner"],
    recipe: "Stir-Fried Chicken & Peppers with Tofu & Nuts",
    defaultServings: 2,
    calories: 1180,
    ingredients: [
      N(INGREDIENTS.CHICKEN_BREAST.key, 240, UNIT.GRAM),
      N(INGREDIENTS.GREEN_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.PAK_CHOI.key, 300, UNIT.GRAM),
      N(INGREDIENTS.CELERY.key, 2, UNIT.PIECES),
      N(INGREDIENTS.MUSHROOMS.key, 100, UNIT.GRAM),
      N(INGREDIENTS.FIRM_TOFU.key, 100, UNIT.GRAM),
      N(INGREDIENTS.EGGS.key, 2, UNIT.SMALL),
      N(INGREDIENTS.CASHEWS.key, 30, UNIT.GRAM),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.SOY_SAUCE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.WORCESTERSHIRE_SAUCE.key, 0.5, UNIT.TABLESPOON),
      N(INGREDIENTS.GINGER.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.CORN_FLOUR.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SESAME_SEEDS.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON)
    ],
    steps: [
      "Slice chicken, peppers, onion, celery, pak choi, and mushrooms.",
      "Toss everything with 1 tbsp olive oil and salt to marinate overnight.",
      "Cut tofu into strips and pan-fry separately in a bit of oil until golden. Set aside.",
      "Boil eggs, peel, and slice.",
      "Stir-fry chicken and marinated veg for 4–5 minutes.",
      "Add garlic, ginger, mushrooms; stir-fry 1 minute.",
      "Add soy sauce and Worcestershire; stir.",
      "Mix corn flour with water, add to pan, and thicken sauce.",
      "Add tofu, sliced boiled eggs, and nuts. Toss briefly to warm through.",
      "Sprinkle sesame seeds before serving."
    ]
  },
  {
    id: 6,
    meal: ["dinner"],
    recipe: "Spicy Tofu Stir-Fry with Mushrooms & Nuts",
    defaultServings: 2,
    calories: 1180,
    ingredients: [
      N(INGREDIENTS.FIRM_TOFU.key, 400, UNIT.GRAM),
      N(INGREDIENTS.OLIVE_OIL.key, 3, UNIT.TABLESPOON),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.MUSHROOMS.key, 150, UNIT.GRAM),
      N(INGREDIENTS.SOY_SAUCE.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.CHILI_FLAKES.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.CASHEWS.key, 30, UNIT.GRAM)
    ],
    steps: [
      "Heat 1 tbsp olive oil or ghee in a pan and fry tofu until golden, about 20 minutes. Set aside.",
      "Add 1 tbsp more oil to the pan, sauté garlic for 30 seconds.",
      "Add red pepper, onion, and mushrooms. Stir-fry for 4–5 minutes.",
      "Return tofu to the pan. Add soy sauce, smoked paprika, and chili flakes.",
      "Add final 1 tbsp of oil and the nuts. Stir well and cook for 1–2 more minutes.",
      "Serve hot."
    ]
  },
  {
    id: 7,
    meal: ["breakfast"],
    isCheat: true,
    recipe: "Pancakes and Bacon",
    defaultServings: 2,
    calories: 900,
    ingredients: [
      N(INGREDIENTS.PLAIN_FLOUR.key, 100, UNIT.GRAM),
      N(INGREDIENTS.EGGS.key, 2, UNIT.SMALL),
      N(INGREDIENTS.MILK.key, 300, UNIT.MILLILITER),
      N(INGREDIENTS.GREEK_YOGURT.key, 10, UNIT.GRAM),
      N(INGREDIENTS.STREAKY_BACON.key, 12, UNIT.SLICES),
      N(INGREDIENTS.MAPLE_SYRUP.key, 2, UNIT.TABLESPOON)
    ],
    steps: [
      "Whisk flour and salt to taste in a bowl.",
      "Crack in the eggs and add the milk. Whisk until smooth and lump-free.",
      "Heat a non-stick pan and melt a little butter.",
      "Pour in batter to form pancakes; cook until golden on one side, then flip.",
      "Fry bacon separately until crispy.",
      "Serve pancakes stacked with 6 slices of bacon per serving.",
      "Drizzle with maple syrup and enjoy warm."
    ]
  },
  {
    id: 8,
    meal: ["snacks"],
    recipe: "Apple, Almonds & Greek Yogurt",
    defaultServings: 2,
    calories: 450,
    ingredients: [
      N(INGREDIENTS.APPLE.key, 2, UNIT.MEDIUM),
      N(INGREDIENTS.ALMONDS.key, 30, UNIT.GRAM),
      N(INGREDIENTS.GREEK_YOGURT.key, 150, UNIT.GRAM)
    ],
    steps: [
      "Slice each apple into wedges or bite-sized pieces.",
      "Portion the almonds into two servings (15g each).",
      "Spoon 75g of Greek yogurt into a bowl per person.",
      "Serve one apple, 15g almonds, and 75g yogurt per person."
    ]
  },
  {
    id: 9,
    meal: ["snacks"],
    recipe: "Pineapple, Cashew & Yogurt Bowl",
    defaultServings: 2,
    calories: 540,
    ingredients: [
      N(INGREDIENTS.PINEAPPLE_CHUNKS.key, 150, UNIT.GRAM),
      N(INGREDIENTS.CASHEWS.key, 30, UNIT.GRAM),
      N(INGREDIENTS.GREEK_YOGURT.key, 150, UNIT.GRAM),
      N(INGREDIENTS.CHIA_SEEDS.key, 2, UNIT.TEASPOON)
    ],
    steps: [
      "Divide pineapple chunks into two bowls (75g each).",
      "Add 15g of cashews to each bowl.",
      "Spoon 75g of Greek yogurt into each bowl.",
      "Top each with 1 tsp of chia seeds.",
      "Serve chilled." 
    ]
  },
  {
    id: 10,
    meal: ["breakfast"],
    recipe: "Banana Chia Pudding with Peanut Butter & Berries",
    defaultServings: 2,
    calories: 660,
    ingredients: [
      N(INGREDIENTS.CHIA_SEEDS.key, 4, UNIT.TABLESPOON),
      N(INGREDIENTS.MILK.key, 160, UNIT.MILLILITER),
      N(INGREDIENTS.BANANA.key, 1, UNIT.PIECES),
      N(INGREDIENTS.HONEY.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.VANILLA_EXTRACT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.PEANUT_BUTTER.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.GREEK_YOGURT.key, 150, UNIT.GRAM),
      N(INGREDIENTS.MIXED_BERRIES.key, 100, UNIT.GRAM)
    ],
    steps: [
      "Mash the banana in a bowl or jar.",
      "Add milk, chia seeds, honey, and vanilla. Mix well.",
      "Let sit for 5 minutes, then stir again to break up clumps.",
      "Cover and refrigerate for at least 2 hours or overnight.",
      "In the morning, stir in peanut butter and Greek yogurt.",
      "Top with fresh berries before serving."
    ]
  },
  {
    id: 11,
    meal: "lunch",
    recipe: "Tuna & Egg Patties",
    defaultServings: 2,
    calories: 1380,
    ingredients: [
      N(INGREDIENTS.TUNA.key, 220, UNIT.GRAM),
      N(INGREDIENTS.EGGS.key, 8, UNIT.SMALL),
      N(INGREDIENTS.SALT.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.ONION_POWDER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.GREEK_YOGURT.key, 4, UNIT.TEASPOON)
    ],
    steps: [
      "Whisk the eggs in a bowl and mix in the drained tuna.",
      "Season with salt, pepper, and onion powder.",
      "Heat 2 tsp of butter in a non-stick pan over medium heat.",
      "Scoop and flatten patties into the pan, fry 2–3 mins per side until golden.",
      "Serve hot, optionally brushing with remaining melted butter if desired."
    ]
  },

  {
    id: 12,
    meal: ["lunch"],
    isCheat: true,
    recipe: "Crispy Spiced Chicken Wings",
    defaultServings: 2,
    calories: 1100,
    ingredients: [
      N(INGREDIENTS.CHICKEN_WINGS.key, 750, UNIT.GRAM),
      N(INGREDIENTS.BREADCRUMBS.key, 1, UNIT.CUP),
      N(INGREDIENTS.SOY_SAUCE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.WORCESTERSHIRE_SAUCE.key, 0.5, UNIT.TABLESPOON),
      N(INGREDIENTS.FRANKS_HOT_SAUCE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.GARLIC_POWDER.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.ONION_POWDER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Preheat oven to 215°C (419°F).",
      "In a large bowl, mix soy sauce, Worcestershire sauce, hot sauce, olive oil, garlic powder, onion powder, and salt.",
      "Add the chicken wings and toss to coat. Let marinate for 10–15 minutes.",
      "Coat wings evenly with breadcrumbs, pressing gently to stick.",
      "Place wings on a lined baking tray in a single layer.",
      "Bake for 25 minutes.",
      "Flip wings and bake for another 10 minutes until crispy and golden.",
      "Serve hot."
    ]
  },
  {
    id: 13,
    meal: "dinner",
    isCheat: true,
    recipe: "Crispy Chicken Wings with Fries",
    defaultServings: 2,
    calories: 1800,
    ingredients: [
      N(INGREDIENTS.CHICKEN_BREAST.key, 750, UNIT.GRAM),
      N(INGREDIENTS.BREADCRUMBS.key, 1, UNIT.CUP),
      N(INGREDIENTS.SOY_SAUCE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.WORCESTERSHIRE_SAUCE.key, 0.5, UNIT.TABLESPOON),
      N(INGREDIENTS.FRANKS_HOT_SAUCE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.GARLIC_POWDER.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.ONION_POWDER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.CORN_FLOUR.key, 0.5, UNIT.TABLESPOON),
      N(INGREDIENTS.SALT.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.POTATOES.key, 1000, UNIT.GRAM)
    ],
    steps: [
      "Preheat oven to 215°C (419°F).",
      "In a large bowl, mix soy sauce, Worcestershire sauce, hot sauce, olive oil, garlic powder, onion powder, and salt.",
      "Add the chicken wings and toss to coat. Add the Corn Flour and Let marinate for 10–15 minutes.",
      "Coat wings evenly with breadcrumbs, pressing gently to stick.",
      "Place wings on a lined baking tray in a single layer.",
      "Bake wings for 25 minutes, flip, and bake another 10 minutes until crispy and golden.",
      "For perfect potatoes. Slice potatoes into fries (~1–1.5 cm thick).",
      "Boil a kettle and pour the boiling water into a large pot.",
      "Add the fries and repeat with 2 more kettles (total ~3 kettles).",
      "Boil fries for 6–7 minutes, then drain and let steam off until dry.",
      "Deep fry fries.",
      "Serve the wings with the fries hot."
    ]
  },
  {
    id: 14,
    meal: ["lunch"],
    recipe: "Turkey Lettuce Cups with Feta & Nut Salad",
    defaultServings: 2,
    calories: 1280,
    ingredients: [
      N(INGREDIENTS.TURKEY_MINCE.key, 400, UNIT.GRAM),
      N(INGREDIENTS.LETTUCE_LEAVES.key, 8, UNIT.PIECES),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 2, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.OLIVE_OIL.key, 3, UNIT.TABLESPOON),
      N(INGREDIENTS.SALT.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.CUCUMBER.key, 0.5, UNIT.PIECES),
      N(INGREDIENTS.CHERRY_TOMATOES.key, 6, UNIT.PIECES),
      N(INGREDIENTS.RED_ONION.key, 0.25, UNIT.PIECES),
      N(INGREDIENTS.GREEK_YOGURT.key, 40, UNIT.GRAM),
      N(INGREDIENTS.GINGER.key, 20, UNIT.GRAM),
      N(INGREDIENTS.LEMON_JUICE.key, 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Heat 1 tbsp olive oil in a pan over medium heat.",
      "Add garlic and cook for 30 seconds.",
      "Add turkey mince and cook until browned (6–8 minutes).",
      "Add diced bell peppers, cook for 2–3 minutes. Season with salt and pepper.",
      "Let mixture cool slightly. Wash and dry lettuce leaves.",
      "Spoon the turkey mixture into the lettuce leaves.",
      "To make the salad, slice cucumber, cherry tomatoes, and red onion.",
      "Toss with 2 tbsp olive oil, lemon juice, chopped almonds, and crumbled feta.",
      "Serve the lettuce cups with the salad on the side."
    ]
  },
  {
    id: 15,
    meal: ["snacks"],
    recipe: "Peach Yogurt Bowl with Almonds & Coconut",
    defaultServings: 2,
    calories: 520,
    ingredients: [
      N(INGREDIENTS.PEACH.key, 1, UNIT.MEDIUM),
      N(INGREDIENTS.GREEK_YOGURT.key, 150, UNIT.GRAM),
      N(INGREDIENTS.HONEY.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.CHIA_SEEDS.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.CINNAMON.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.GINGER.key, 15, UNIT.GRAM),
      N(INGREDIENTS.COCONUT_FLAKES.key, 5, UNIT.GRAM),
      N(INGREDIENTS.ALMOND_BUTTER.key, 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Wash and slice the peach into thin wedges.",
      "Divide the yogurt into two bowls.",
      "Top each bowl with peach slices.",
      "Drizzle 1 tsp honey over each serving.",
      "Sprinkle chia seeds, cinnamon, chopped almonds, and coconut flakes.",
      "Add 0.5 tbsp almond butter to each bowl.",
      "Serve immediately or chill briefly before serving."
    ]
  },
  {
    id: 16,
    meal: ["snacks"],
    isCheat: true,
    recipe: "Olive Oil Crackers with Pesto",
    defaultServings: 2,
    calories: 340,
    ingredients: [
      N(INGREDIENTS.CRISPS.key, 60, UNIT.GRAM), // assuming your “olive oil crackers” are a packaged snack—keep as CRISPS or add a CRACKERS item if you prefer
      N(INGREDIENTS.PESTO.key, 2, UNIT.TABLESPOON)
    ],
    steps: [
      "Portion into two servings.",
      "Serve with pesto.",
      "Optional: garnish with grated Parmesan."
    ]
  },
  {
    id: 17,
    meal: ["dinner"],
    recipe: "Breaded Chicken with Garlic Veggies & Avocado",
    defaultServings: 2,
    calories: 1195,
    ingredients: [
      N(INGREDIENTS.CHICKEN_BREAST.key, 340, UNIT.GRAM),
      N(INGREDIENTS.BREADCRUMBS.key, 0.25, UNIT.CUP),
      N(INGREDIENTS.GARLIC_POWDER.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.ONION_POWDER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 0.75, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.BROCCOLI.key, 1, UNIT.HEAD),
      N(INGREDIENTS.CARROT.key, 2, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.AVOCADO.key, 1, UNIT.MEDIUM),
      N(INGREDIENTS.GINGER.key, 20, UNIT.GRAM),
      N(INGREDIENTS.SESAME_SEEDS.key, 1, UNIT.TEASPOON)
    ],
    steps: [
      "Preheat oven to 200°C (392°F).",
      "Mix breadcrumbs, garlic powder, onion powder, paprika, salt, and pepper.",
      "Brush chicken breasts with 1 tbsp olive oil.",
      "Coat chicken in breadcrumb mixture and place on a baking sheet.",
      "Bake chicken for 25 minutes, flipping halfway.",
      "Cut broccoli into florets and slice carrots.",
      "Toss vegetables with 1 tbsp olive oil, minced garlic, and a pinch of salt.",
      "Roast veggies for 20–25 minutes with the chicken.",
      "Slice avocado and divide between plates.",
      "Top roasted vegetables with chopped nuts and sesame seeds.",
      "Serve chicken with garlic veggies and avocado slices on the side."
    ]
  },
  {
    id: 18,
    isCheat: true,
    meal: ["dinner"],
    recipe: "Chorizo Pizza",
    defaultServings: 2,
    calories: 1800,
    ingredients: [
      N(INGREDIENTS.PLAIN_FLOUR.key, 450, UNIT.GRAM),
      N(INGREDIENTS.WATER.key, 240, UNIT.MILLILITER),
      N(INGREDIENTS.DRY_YEAST.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 4, UNIT.TABLESPOON),
      N(INGREDIENTS.SALT.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.TOMATO_SAUCE.key, 100, UNIT.GRAM),
      N(INGREDIENTS.CHEESE.key, 300, UNIT.GRAM),
      N(INGREDIENTS.CHORIZO.key, 100, UNIT.GRAM)
    ],
    steps: [
      "Mix flour, yeast, and salt.",
      "Add water and oil; knead 8–10 min. Rise 1 hour.",
      "Preheat 230°C.",
      "Roll, sauce, top with cheese & chorizo. Bake 12–15 min."
    ]
  },
  {
    id: 19,
    meal: ["dinner"],
    recipe: "Turkey Stuffed Peppers with Roasted Sweet Potato & Nuts",
    defaultServings: 2,
    calories: 1020,
    ingredients: [
      N(INGREDIENTS.RED_BELL_PEPPER.key, 2, UNIT.PIECES),
      N(INGREDIENTS.TURKEY_MINCE.key, 300, UNIT.GRAM),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.TOMATO_PASTE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 2.5, UNIT.TABLESPOON),
      N(INGREDIENTS.SWEET_POTATO.key, 400, UNIT.GRAM),
      N(INGREDIENTS.GINGER.key, 20, UNIT.GRAM)
    ],
    steps: [
      "Preheat oven to 190°C.",
      "Peel and cube sweet potatoes. Toss with 1.5 tbsp olive oil and a pinch of salt.",
      "Roast sweet potatoes on a tray for 25–30 minutes, flipping halfway.",
      "Slice tops off peppers and remove seeds.",
      "Sauté onion and garlic in 1 tbsp olive oil, then add turkey mince.",
      "Cook until browned, then stir in tomato paste, paprika, and salt.",
      "Stuff mixture into peppers and bake for 25–30 minutes.",
      "Serve the stuffed peppers with roasted sweet potato.",
      "Sprinkle chopped nuts over the sweet potato just before serving."
    ]
  },
  {
    id: 20,
    meal: ["dinner"],
    recipe: "Chickpea & Tofu Curry",
    defaultServings: 2,
    calories: 1340,
    ingredients: [
      N(INGREDIENTS.CHICKPEAS.key, 240, UNIT.GRAM),
      N(INGREDIENTS.FIRM_TOFU.key, 150, UNIT.GRAM),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.CARROT.key, 2, UNIT.PIECES),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.TINNED_TOMATOES.key, 1, UNIT.TIN),
      N(INGREDIENTS.CURRY_POWDER.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 2.5, UNIT.TABLESPOON),
      N(INGREDIENTS.SWEET_POTATO.key, 400, UNIT.GRAM),
      N(INGREDIENTS.CASHEWS.key, 20, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.STOCK.key, 1, UNIT.CUP),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Preheat oven to 200°C.",
      "Peel and cube sweet potatoes. Toss with 1.5 tbsp olive oil and roast for 25–30 minutes until golden.",
      "Press tofu for 10 minutes and cube.",
      "Heat 1 tbsp olive oil in a pan, sauté tofu cubes until lightly browned, then remove and set aside.",
      "In the same pan, sauté onion and garlic until soft.",
      "Add carrots and red pepper, cook for 5 minutes.",
      "Stir in curry powder and toast for 30 seconds.",
      "Add chickpeas, tinned tomatoes and stock. Simmer 10–15 minutes.",
      "Add tofu back to the curry and heat through. Season with salt and pepper.",
      "Serve hot with sweet potato and top with chopped nuts."
    ]
  },
  {
    id: 21,
    meal: ["dinner"],
    recipe: "Turkey Bolognese",
    defaultServings: 2,
    calories: 1240,
    ingredients: [
      N(INGREDIENTS.ZUCCHINI.key, 2, UNIT.MEDIUM),
      N(INGREDIENTS.TURKEY_MINCE.key, 300, UNIT.GRAM),
      N(INGREDIENTS.TINNED_TOMATOES.key, 1, UNIT.TIN),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.OLIVE_OIL.key, 1.5, UNIT.TABLESPOON),
      N(INGREDIENTS.ONION.key, 1, UNIT.MEDIUM),
      N(INGREDIENTS.GREEN_OLIVES.key, 40, UNIT.GRAM),
      N(INGREDIENTS.ITALIAN_SEASONING.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.PESTO.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.BASIL.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.SWEET_POTATO.key, 300, UNIT.GRAM),
      N(INGREDIENTS.PARMESAN_CHEESE.key, 30, UNIT.GRAM)
    ],
    steps: [
      "Preheat oven to 200°C.",
      "Peel and cube sweet potatoes. Toss with 1 tbsp olive oil and roast 25–30 minutes.",
      "Spiralize the zucchini and set aside.",
      "Heat 0.5 tbsp olive oil in a pan. Add chopped garlic and onion. Sauté until soft.",
      "Add turkey mince, breaking it apart, and cook until browned.",
      "Add tinned tomatoes, Italian seasoning, salt, pepper, olives, and pesto or capers.",
      "Simmer sauce 10–15 minutes, stirring occasionally.",
      "Add zucchini noodles and toss gently for 2–3 minutes until just tender.",
      "Serve warm, topped with roasted sweet potato and grated parmesan. Garnish with basil if desired."
    ]
  },
  {
    id: 22,
    meal: ["dinner"],
    recipe: "Cashew Carbonara",
    defaultServings: 2,
    calories: 1260,
    ingredients: [
      N(INGREDIENTS.ZUCCHINI.key, 2, UNIT.MEDIUM),
      N(INGREDIENTS.TURKEY_MINCE.key, 200, UNIT.GRAM),
      N(INGREDIENTS.GINGER.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.CASHEWS.key, 60, UNIT.GRAM),
      N(INGREDIENTS.MILK.key, 100, UNIT.MILLILITER),
      N(INGREDIENTS.EGGS.key, 1, UNIT.SMALL),
      N(INGREDIENTS.GREEK_YOGURT.key, 30, UNIT.GRAM),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.WHOLEMEAL_BREAD.key, 2, UNIT.SLICES),
      N(INGREDIENTS.CHIVES.key, 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Preheat the oven to 40°C and warm the milk to the same temperature.",
      "Soak the cashews in the warm milk for 30 minutes.",
      "In a bowl, mix turkey mince with ground almonds, salt and pepper. Shape into small cubes or patties.",
      "Heat 1 tsp olive oil in a pan and sear the turkey nut cubes until golden and fully cooked. Set aside.",
      "Blend the soaked cashews and milk until smooth to form a cashew cream.",
      "Mix the cashew cream with the egg and parmesan in a bowl to make the sauce.",
      "Spiralize the zucchini. Heat 1 tsp olive oil in a pan, sauté the garlic, then add the zucchini noodles. Cook for 2–3 minutes until just tender.",
      "Remove the pan from heat and stir in the sauce quickly to avoid scrambling the egg.",
      "Serve warm, topped with turkey cubes and chives or scallions. Add a slice of warm wholemeal bread on the side."
    ]
  },
  {
    id: 23,
    meal: ["snacks"],
    recipe: "Celery and Hummus",
    defaultServings: 2,
    calories: 500,
    ingredients: [
      N(INGREDIENTS.CELERY.key, 8, UNIT.PIECES),
      N(INGREDIENTS.HUMMUS.key, 6, UNIT.TABLESPOON),
      N(INGREDIENTS.WALNUTS.key, 15, UNIT.GRAM)
    ],
    steps: [
      "Wash and cut celery into sticks (about 4 pieces per serving).",
      "Portion 3 tbsp of hummus into a small bowl for each person.",
      "Serve celery with hummus for dipping.",
      "Top each serving with a few chopped walnuts (optional) for extra calories and healthy fats."
    ]
  },
  {
    id: 24,
    meal: ["breakfast"],
    recipe: "Arepa with Chicken, Egg & Avocado",
    defaultServings: 2,
    calories: 715,
    ingredients: [
      N(INGREDIENTS.AREPA_FLOUR_HARINA_PAN.key, 60, UNIT.GRAM),
      N(INGREDIENTS.ROLLED_OATS.key, 60, UNIT.GRAM),
      N(INGREDIENTS.WATER.key, 140, UNIT.MILLILITER),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.EGGS.key, 2, UNIT.SMALL),
      N(INGREDIENTS.AVOCADO.key, 1, UNIT.PIECES),
      N(INGREDIENTS.CHICKEN_BREAST.key, 100, UNIT.GRAM)
    ],
    steps: [
      "Grind the oats slightly if needed to make them finer.",
      "Mix Harina PAN, oats, water, and salt to form a soft dough. Let it rest for 5 minutes.",
      "Shape into small flat patties.",
      "Heat olive oil in a pan over medium heat and cook arepas for 4–5 minutes per side until golden and cooked through.",
      "Boil or shred cooked chicken breast if not already prepared.",
      "Fry or scramble the eggs.",
      "Slice the avocado.",
      "Split arepas and fill each with chicken, egg, and avocado. Serve warm."
    ]
  },
  {
    id: 25,
    meal: ["dinner"],
    recipe: "Tuscan Turkey Meatballs",
    defaultServings: 2,
    calories: 1584,
    ingredients: [
      N(INGREDIENTS.TURKEY_MINCE.key, 300, UNIT.GRAM),
      N(INGREDIENTS.BROWN_LENTILS.key, 1, UNIT.TIN),
      N(INGREDIENTS.TINNED_TOMATOES.key, 1, UNIT.TIN),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 3, UNIT.CLOVE),
      N(INGREDIENTS.CELERY.key, 2, UNIT.STALK),
      N(INGREDIENTS.CARROT.key, 1, UNIT.PIECES),
      N(INGREDIENTS.SPINACH.key, 60, UNIT.GRAM),
      N(INGREDIENTS.BASIL.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.CAPERS.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SUGAR.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.ITALIAN_SEASONING.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.STOCK.key, 1, UNIT.CUP),
      N(INGREDIENTS.SWEET_POTATO.key, 300, UNIT.GRAM)
    ],
    steps: [
      "Preheat oven to 200°C (390°F). Peel and cube the sweet potatoes. Toss with a pinch of salt and 1 tsp olive oil. Roast for 25–30 minutes until tender and golden. Set aside.",
      "Finely chop half the onion, 1 clove garlic, and half the basil (if using leaves). In a bowl, mix with turkey mince, salt, and pepper.",
      "Form the turkey mixture into small meatballs (about 12).",
      "Finely chop the remaining onion, celery, carrot, and garlic.",
      "Heat 1 tbsp olive oil in a large pan over medium heat. Add the chopped onion, celery, carrot, and a pinch of salt. Fry for 5–7 minutes until softened and lightly golden. Remove the veg from the pan and set aside.",
      "Add a little more olive oil if needed, then fry the meatballs in the same pan until browned on all sides. Remove and set aside.",
      "In a saucepan, heat 1 tbsp olive oil over medium heat. Add the remaining garlic and sauté for 30 seconds until fragrant.",
      "Add the capers and cook for another minute.",
      "Add the tinned tomatoes, 1 tsp salt,  1 tsp sugar and Italian seasoning herbs. Stir and bring to a simmer.",
      "Return the fried vegetables and meatballs to the sauce, along with the lentils. Stir to combine.",
      "Add the stock and bring to a gentle simmer.",
      "Cover and simmer everything together for 30 minutes on low heat.",
      "Stir in the spinach and remaining basil (if using leaves) until wilted.",
      "Serve the lentil and meatball stew hot with a portion of roasted sweet potatoes on the side or stirred through."
    ]
  },
  {
    id: 26,
    meal: ["snacks"],
    isCheat: true,
    recipe: "Olive Oil & Himalayan Pink Salt Crisps",
    defaultServings: 2,
    calories: 700,
    ingredients: [N(INGREDIENTS.CRISPS.key, 135, UNIT.GRAM)],
    steps: ["Divide and eat the crisps as a snack."]
  },
  {
    id: 27,
    meal: ["lunch"],
    isCheat: true,
    recipe: "Argentine Beef Empanada Bites",
    defaultServings: 2,
    calories: 900,
    ingredients: [
      N(INGREDIENTS.PLAIN_FLOUR.key, 300, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.GREEK_YOGURT.key, 75, UNIT.GRAM),
      N(INGREDIENTS.WATER.key, 120, UNIT.MILLILITER),
      N(INGREDIENTS.OLIVE_OIL.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 0.5, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.GROUND_BEEF.key, 400, UNIT.GRAM),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.CUMIN.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.TOMATO_PASTE.key, 1.5, UNIT.TABLESPOON),
      N(INGREDIENTS.STOCK.key, 60, UNIT.MILLILITER),
      N(INGREDIENTS.EGGS.key, 2, UNIT.SMALL),
      N(INGREDIENTS.GREEN_OLIVES.key, 50, UNIT.GRAM)
    ],
    steps: [
      "Mix flour and salt in a large bowl.",
      "Rub in the cold butter or lard with your fingers until the mixture resembles breadcrumbs.",
      "Add warm water a little at a time, mixing until a dough forms.",
      "Knead for about 5 minutes until smooth. Cover and let rest for 30 minutes.",
      "Roll out dough to 2–3mm thick and cut into 12cm circles. Keep covered until ready to fill.",
      "Heat olive oil in a pan over medium heat.",
      "Add onion and red pepper, cook until softened (5–7 minutes).",
      "Add garlic, cook for 1 minute.",
      "Add ground beef, break up and cook until browned.",
      "Stir in paprika, cumin, salt, and pepper. Cook 1–2 minutes.",
      "Add tomato paste and beef stock, stir well, and simmer for 5 minutes until slightly thickened but still moist.",
      "Remove from heat and let cool slightly.",
      "Mix in chopped boiled eggs and olives.",
      "Place a spoonful of filling in the center of each dough circle. Fold over and seal the edges.",
      "Place on a baking tray, brush with beaten egg.",
      "Bake at 200°C for 20–22 minutes until golden.",
      "Serve warm."
    ]
  },
  {
    id: 28,
    meal: ["dinner"],
    isCheat: true,
    recipe: "Steak and Chips",
    defaultServings: 2,
    calories: 1600,
    ingredients: [
      N(INGREDIENTS.BEEF_ROAST.key, 2, UNIT.PIECES), // normalized to a single cut
      N(INGREDIENTS.POTATOES.key, 600, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.GREEK_YOGURT.key, 20, UNIT.GRAM),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.ROSEMARY.key, 2, UNIT.STALK),
      N(INGREDIENTS.DOUBLE_CREAM.key, 100, UNIT.MILLILITER),
    ],
    steps: [
      "Fry chips at 180°C; drain & season.",
      "Sauté pearl onions in butter; set aside.",
      "Sear steaks; baste with butter, garlic & herbs; rest 5 min.",
      "Deglaze with rum; add cream & peppercorns; reduce.",
      "Serve steaks with chips, onions, and sauce."
    ]
  },
  {
    id: 29,
    meal: ["dinner"],
    recipe: "Satay Chicken",
    defaultServings: 2,
    calories: 1140,
    ingredients: [
      N(INGREDIENTS.CHICKEN_BREAST.key, 350, UNIT.GRAM),
      N(INGREDIENTS.GREEN_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.PAK_CHOI.key, 300, UNIT.GRAM),
      N(INGREDIENTS.CELERY.key, 2, UNIT.PIECES),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.SOY_SAUCE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.PEANUT_BUTTER.key, 3.5, UNIT.TABLESPOON),
      N(INGREDIENTS.COCONUT_WATER.key, 100, UNIT.MILLILITER),
      N(INGREDIENTS.WORCESTERSHIRE_SAUCE.key, 0.5, UNIT.TABLESPOON),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.CORN_FLOUR.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.WATER.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.LIME_JUICE.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.CUMIN.key, 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Chop the chicken breast and vegetables (peppers, onion, celery, pak choi).",
      "In the morning or the night before, toss the sliced chicken, peppers, onion, celery, and pak choi with salt. Cover and refrigerate to marinate.",
      "Heat a large pan or wok over medium-high heat.",
      "Add the marinated chicken and vegetables to the pan and stir-fry for about 5-7 minutes until the chicken is mostly cooked.",
      "Stir in the peanut butter and mix well to coat the chicken and vegetables.",
      "Add the soy sauce, coconut water, Worcestershire sauce, minced garlic, lime juice, and ground cumin. Stir everything together and let simmer for a few minutes.",
      "In a small bowl, mix the corn flour with 1 tablespoon of water to create a slurry.",
      "Pour the slurry into the pan, stirring constantly, and cook for another 1-2 minutes until the sauce thickens.",
      "Serve hot. Optionally, garnish with lime or chopped peanuts."
    ]
  },
  {
    id: 30,
    meal: ["lunch"],
    recipe: "Lentils with Pak Choi",
    defaultServings: 4,
    calories: 700,
    ingredients: [
      N(INGREDIENTS.BROWN_LENTILS.key, 1, UNIT.TIN),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 3, UNIT.CLOVE),
      N(INGREDIENTS.CARROT.key, 2, UNIT.PIECES),
      N(INGREDIENTS.CELERY.key, 2, UNIT.ST),
      N(INGREDIENTS.TINNED_TOMATOES.key, 1, UNIT.TIN),
      N(INGREDIENTS.PAK_CHOI.key, 300, UNIT.GRAM),
      N(INGREDIENTS.BAY_LEAF.key, 1, UNIT.PIECES),
      N(INGREDIENTS.STOCK.key, 1500, UNIT.MILLILITER),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.CUMIN.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.CAPERS.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES)
    ],
    steps: [
      "Dice the onion, garlic, carrots, and celery.",
      "Rinse the lentils under cold water and set aside.",
      "In a large pot, heat olive oil over medium heat. Add the diced onion, garlic, carrots, and celery. Sauté for about 5-7 minutes until softened. Add salt.",
      "Chop the pak choi stems (reserve the leaves for later) and add to the pot. Cook for another 3-4 minutes until softened.",
      "Stir in ground cumin and paprika, and cook for 1 minute until fragrant.",
      "Add the diced tomatoes (or substitute with 1 can of tomatoes if using). Cook for another 3 minutes.",
      "Add lentils, bay leaf, and broth. Bring to a boil, then reduce heat to low, cover, and simmer for 25-30 minutes until lentils are tender, stirring occasionally.",
      "When lentils are nearly cooked, add the pak choi leaves. Simmer for an additional 5 minutes until wilted.",
      "Once lentils are tender, season with salt and pepper to taste."
    ]
  },
  {
    id: 31,
    meal: ["breakfast"],
    isCheat: true,
    recipe: "Hash Browns & Bacon Sandwich",
    defaultServings: 2,
    calories: 1843,
    ingredients: [
      N(INGREDIENTS.STREAKY_BACON.key, 12, UNIT.SLICES),
      N(INGREDIENTS.BREAD.key, 4, UNIT.SLICES),
      N(INGREDIENTS.POTATOES.key, 500, UNIT.GRAM),
      N(INGREDIENTS.ONION.key, 70, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.GREEK_YOGURT.key, 20, UNIT.GRAM)
    ],
    steps: [
      "Peel and grate the potatoes and onion. Combine with salt.",
      "Place mixture in a clean towel and squeeze out as much water as possible.",
      "Form into hash browns (about 100g each).",
      "Heat butter in a pan and fry hash browns until golden and crisp on both sides. Freeze extras.",
      "Fry bacon until crispy.",
      "Toast the bread slices.",
      "Assemble each sandwich with 1 hash brown and 3 slices of bacon between 2 slices of bread. Serve hot."
    ]
  },
  {
    id: 32,
    meal: ["snacks"],
    isCheat: true,
    recipe: "Toast and Butter",
    defaultServings: 2,
    calories: 470,
    ingredients: [
      N(INGREDIENTS.BREAD.key, 4, UNIT.SLICES),
      N(INGREDIENTS.GREEK_YOGURT.key, 20, UNIT.GRAM)
    ],
    steps: ["Toast bread, butter, serve warm."]
  },
  {
    id: 33,
    meal: ["lunch"],
    isCheat: true,
    recipe: "Cheese & Bacon Arancini",
    calories: 974,
    defaultServings: 2,
    ingredients: [
      N(INGREDIENTS.RISOTTO_RICE, 300, UNIT.GRAM),
      N(INGREDIENTS.STOCK.key, 700, UNIT.MILLILITER),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.STREAKY_BACON.key, 100, UNIT.GRAM),
      N(INGREDIENTS.MOZZARELLA.key, 100, UNIT.GRAM),
      N(INGREDIENTS.GREEK_YOGURT.key, 40, UNIT.GRAM),
      N(INGREDIENTS.EGGS.key, 1, UNIT.SMALL),
      N(INGREDIENTS.BREADCRUMBS.key, 80, UNIT.GRAM),
      N(INGREDIENTS.BREADCRUMBS.key, 40, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Heat olive oil and sauté chopped onion until soft.",
      "Add chopped bacon and cook until crispy.",
      "Stir in risotto rice, toast for 1–2 minutes.",
      "Gradually add stock while stirring until rice is cooked and creamy (about 20 minutes).",
      "Stir in grated Parmesan, season with salt and pepper, and let cool completely.",
      "Mix in beaten egg and 80g breadcrumbs.",
      "Form golf-ball-sized balls, inserting a cube of mozzarella in the center of each.",
      "Roll each ball in the remaining breadcrumbs to coat.",
      "Heat oil to 170–180°C and deep-fry arancini in batches until golden (3–4 minutes).",
      "Drain on kitchen paper and serve hot."
    ]
  },
  {
    id: 34,
    meal: ["lunch"],
    isCheat: true,
    recipe: "Airport Burrito",
    defaultServings: 4,
    calories: 1266,
    ingredients: [
      N(INGREDIENTS.BEEF_ROAST.key, 1000, UNIT.GRAM),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.ONION.key, 2, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.CUMIN.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.STOCK.key, 500, UNIT.MILLILITER),
      N(INGREDIENTS.GREEK_YOGURT.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.PLAIN_FLOUR.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.WORCESTERSHIRE_SAUCE.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.FRANKS_HOT_SAUCE.key, 2, UNIT.TEASPOON),
      N(INGREDIENTS.RICE_UNCOOKED, 0.33, UNIT.CUP),
      N(INGREDIENTS.AVOCADO.key, 2, UNIT.PIECES),
      N(INGREDIENTS.HALLOUMI.key, 200, UNIT.GRAM),
      N(INGREDIENTS.JALAPENOS.key, 4, UNIT.TABLESPOON),
      N(INGREDIENTS.FLOUR_TORTILLAS.key, 4, UNIT.LARGE),
      N(INGREDIENTS.GREEK_YOGURT.key, 100, UNIT.GRAM),
      N(INGREDIENTS.GREEK_YOGURT.key, 40, UNIT.GRAM)
    ],
    steps: [
      "Season beef with salt and pepper.",
      "Sear beef in oil until browned on all sides, then remove and set aside.",
      "Sauté sliced onions and minced garlic until soft and golden.",
      "Add cumin and smoked paprika, stir well.",
      "Return beef to the pot and pour in beef stock. Simmer covered at 160°C for about 2.5 hours, until tender.",
      "Remove beef and shred with forks. Strain the stock if desired.",
      "In a saucepan, melt butter and whisk in flour to make a roux.",
      "Gradually add hot beef stock, whisking until thickened. Stir in Worcestershire sauce and Frank’s Hot Sauce.",
      "Add shredded beef and cooked onions back into the gravy. Mix well.",
      "Cook rice according to package instructions.",
      "Slice halloumi and pan-fry until golden on both sides.",
      "Warm the tortillas.",
      "Assemble each burrito with cooked rice, shredded beef in gravy, sliced or mashed avocado, fried halloumi, mozzarella, parmesan and jalapeños.",
      "Roll the burritos tightly and toast seam-side down in a dry pan until golden and warm."
    ]
  },
  {
    id: 35,
    meal: ["lunch"],
    recipe: "Irish Turkey Stew with Sweet Potatoes & Wholemeal Bread",
    defaultServings: 2,
    calories: 1200,
    ingredients: [
      N(INGREDIENTS.TURKEY_BREAST.key, 300, UNIT.GRAM),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.ONION.key, 1, UNIT.PIECES),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.TURNIP.key, 1, UNIT.SMALL),
      N(INGREDIENTS.CARROT.key, 1, UNIT.PIECES),
      N(INGREDIENTS.MUSHROOMS.key, 150, UNIT.GRAM),
      N(INGREDIENTS.SWEET_POTATO.key, 200, UNIT.GRAM),
      N(INGREDIENTS.TOMATO_PASTE.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.THYME.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.ROSEMARY.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BAY_LEAF.key, 1, UNIT.LEAF),
      N(INGREDIENTS.STOCK.key, 500, UNIT.MILLILITER),
      N(INGREDIENTS.SALT.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.WHOLEMEAL_BREAD.key, 2, UNIT.SLICES)
    ],
    steps: [
      "Pat the turkey dry and cut into 2–3 cm cubes. Season with salt and pepper.",
      "Heat 1 tbsp olive oil in a pot over medium-high heat. Sear turkey cubes until browned, then set aside.",
      "Lower heat to medium. Add remaining olive oil, then sauté onion, garlic, and celery for 3–4 minutes.",
      "Add mushrooms and cook until browned, about 5 minutes.",
      "Stir in tomato paste, thyme, rosemary, and bay leaf. Cook for 1 minute.",
      "Add the turkey back to the pot along with diced turnip, sweet potatoes, and chopped carrots.",
      "Pour in the stock and bring to a boil. Reduce heat and simmer covered for 25–30 minutes until tender.",
      "Discard bay leaf, adjust seasoning",
      "Serve hot with a slice of wholemeal bread on the side."
    ]
  },
  {
    id: 36,
    meal: ["breakfast"],
    recipe: "Almond Flour Pancakes",
    defaultServings: 2,
    calories: 880,
    ingredients: [
      N(INGREDIENTS.ALMOND_FLOUR.key, 60, UNIT.GRAM),
      N(INGREDIENTS.EGGS.key, 2, UNIT.SMALL),
      N(INGREDIENTS.MILK.key, 60, UNIT.MILLILITER),
      N(INGREDIENTS.BAKING_POWDER.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.VANILLA_EXTRACT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.MIXED_BERRIES.key, 60, UNIT.GRAM),
      N(INGREDIENTS.HONEY.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.GREEK_YOGURT.key, 100, UNIT.GRAM),
      N(INGREDIENTS.BANANA.key, 1, UNIT.PIECES)
    ],
    steps: [
      "In a bowl, whisk eggs, milk, and vanilla extract.",
      "Add almond flour and baking powder. Mix until a smooth batter forms.",
      "Heat a non-stick pan over medium heat and lightly grease with oil or butter.",
      "Pour small portions of batter to form 4–6 mini pancakes.",
      "Cook for 2–3 minutes until bubbles form, then flip and cook another 1–2 minutes.",
      "Serve warm with berries, sliced banana, a dollop of Greek yogurt, and a drizzle of honey if desired."
    ]
  },
  {
    id: 37,
    meal: ["breakfast"],
    recipe: "Warm Oat Porridge with Berries & Nuts",
    defaultServings: 2,
    calories: 880,
    ingredients: [
      N(INGREDIENTS.ROLLED_OATS.key, 60, UNIT.GRAM),
      N(INGREDIENTS.MILK.key, 250, UNIT.MILLILITER),
      N(INGREDIENTS.WATER.key, 150, UNIT.MILLILITER),
      N(INGREDIENTS.MIXED_BERRIES.key, 80, UNIT.GRAM),
      N(INGREDIENTS.HONEY.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.SALT.key, .5, UNIT.TEASPOON),
      N(INGREDIENTS.PEANUT_BUTTER.key, 1, UNIT.TABLESPOON),
      N(INGREDIENTS.ALMONDS.key, 10, UNIT.GRAM),
      N(INGREDIENTS.WALNUTS.key, 10, UNIT.GRAM)
    ],
    steps: [
      "Set heat to 7/9. Bring milk, water, salt to boil.",
      "Chop and salt the nuts.",
      "Transfer oats to bowl. Add honey, peanut butter, nuts, and berries in that order.",
    ]
  },
  {
    id: 38,
    meal: ["lunch"],
    recipe: "Fish Cakes with Leafy Salad & Sweet Potato",
    defaultServings: 2,
    calories: 1220,
    ingredients: [
      N(INGREDIENTS.WHITE_FISH.key, 250, UNIT.GRAM),
      N(INGREDIENTS.EGGS.key, 2, UNIT.SMALL),
      N(INGREDIENTS.GARLIC.key, 1, UNIT.CLOVE),
      N(INGREDIENTS.SPRING_ONION.key, 1, UNIT.SMALL),
      N(INGREDIENTS.LEMON_ZEST.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.PLAIN_FLOUR.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.OLIVE_OIL.key, 2, UNIT.TABLESPOON),
      N(INGREDIENTS.SALT.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.BLACK_PEPPER.key, 0.25, UNIT.TEASPOON),
      N(INGREDIENTS.SWEET_POTATO.key, 300, UNIT.GRAM),
      N(INGREDIENTS.SALAD_LEAVES.key, 2, UNIT.HANDFUL),
      N(INGREDIENTS.CUCUMBER.key, 0.5, UNIT.PIECES),
      N(INGREDIENTS.CUCUMBER.key, 6, UNIT.PIECES),
      N(INGREDIENTS.LEMON_JUICE.key, 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Peel and cube the sweet potato. Roast in the oven at 200°C for 25–30 minutes with a bit of olive oil and salt.",
      "Poach the fish in simmering water for 5–6 minutes or until cooked through. Drain and cool.",
      "Flake the fish into a bowl. Add finely chopped onion, garlic, lemon zest, almond flour, and beaten egg.",
      "Season with salt and pepper. Mix well and form into 4 small fish cakes.",
      "Chill for 10–15 minutes if time allows to help them hold shape.",
      "Heat 1 tbsp olive oil in a non-stick pan over medium heat. Fry fish cakes for 3–4 minutes per side until golden and heated through.",
      "Meanwhile, prepare the salad: toss mixed leaves with sliced cucumber and halved cherry tomatoes. Dress with lemon juice and 1 tbsp olive oil.",
      "Serve 2 fish cakes per person alongside the salad and roasted sweet potato."
    ]

  },
  {
    id: 39,
    meal: ["dinner"],
    isCheat: true,
    recipe: "Chicken & Pork Paella",
    defaultServings: 4,
    calories: 1200,
    ingredients: [
      N(INGREDIENTS.OLIVE_OIL.key, 50, UNIT.MILLILITER),
      N(INGREDIENTS.CHICKEN_BREAST.key, 8, UNIT.PIECES),
      N(INGREDIENTS.PORK_BELLY.key, 8, UNIT.OUNCE),
      N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.GREEN_BELL_PEPPER.key, 1, UNIT.PIECES),
      N(INGREDIENTS.PEAS_PETIT_POIS, 50, UNIT.GRAM),
      N(INGREDIENTS.GREEN_BEANS_FROZEN.key, 150, UNIT.GRAM),
      N(INGREDIENTS.BUTTER_BEANS.key, 1, UNIT.TIN),
      N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
      N(INGREDIENTS.SMOKED_PAPRIKA.key, 1, UNIT.TEASPOON),
      N(INGREDIENTS.TURMERIC.key, 0.5, UNIT.TEASPOON),
      N(INGREDIENTS.TOMATO_SAUCE.key, 400, UNIT.GRAM),
      N(INGREDIENTS.PAELLA_RICE.key, 400, UNIT.GRAM),
      N(INGREDIENTS.WATER.key, 900, UNIT.MILLILITER),
      N(INGREDIENTS.ROSEMARY, 1, UNIT.PIECES)
    ],
    steps: [
      "Pour the olive oil into a paella pan and when hot, add all the meat and cook until browned.",
      "Add the garlic (crushed or sliced) and the red and green peppers. Cook for 2 minutes and stir.",
      "Add the tomato sauce and stir well.",
      "Pour in the rice and stir to coat with the sauce.",
      "Pour the water and stir very gently on high heat. Season with paprika, turmeric, and salt.",
      "Once it starts to boil, stop stirring and add the green beans, butter beans, and rosemary to the middle of the pan.",
      "Let the water absorb and keep the paella on the hob until fully cooked. Adjust seasoning.",
      "Let it rest for 3–5 minutes. Before serving, 'break' the paella by loosening the rice with a spoon.",
      "If the rice is undercooked, cover with foil and bake at 200°C for 5–10 min to finish cooking."
    ]
  },
  {
    id: 40,
    meal: ["breakfast"],
    recipe: "Monkey Moo",
    defaultServings: 4,
    calories: 513,
    ingredients: [
      N(INGREDIENTS.BANANA.key, 200, UNIT.GRAM),
      N(INGREDIENTS.MILK.key, 260, UNIT.MILLILITER),
      N(INGREDIENTS.PEANUT_BUTTER.key, 30, UNIT.GRAM),
    ],
    steps: [
      "Freeze Banana.",
      "Blend everything until smooth.",
    ]
  },
  {
    id: 0,
    meal: ["breakfast", "lunch", "dinner", "snacks"],
    recipe: "Skip",
    defaultServings: 2,
    ingredients: [],
    calories: 0,
    steps: []
  },
  {
  id: 41,
  meal: ["dinner"],
  recipe: "Black Pepper Beef Stir Fry",
  defaultServings: 2,
  calories: 0, // You can fill this in if needed
  ingredients: [
    // Beef
    N(INGREDIENTS.SIRLOIN_STEAK.key, 250, UNIT.GRAM), // flank or sirloin
    
    // Sauce
    N(INGREDIENTS.BLACK_PEPPER.key, 1, UNIT.TABLESPOON),
    N(INGREDIENTS.SOY_SAUCE.key, 1, UNIT.TABLESPOON),
    N(INGREDIENTS.WORCESTERSHIRE_SAUCE.key, 0.5, UNIT.TABLESPOON),
    N(INGREDIENTS.SUGAR.key, 0.5, UNIT.TEASPOON),
    N(INGREDIENTS.WATER.key, 1, UNIT.TABLESPOON),
    N(INGREDIENTS.CORN_FLOUR.key, 1, UNIT.TEASPOON), // to mix with water at the end
    
    // Vegetables
    N(INGREDIENTS.ONION.key, 0.5, UNIT.PIECES), // sliced
    N(INGREDIENTS.GARLIC.key, 2, UNIT.CLOVE),
    N(INGREDIENTS.RED_BELL_PEPPER.key, 1, UNIT.PIECES),
    N(INGREDIENTS.GREEN_BELL_PEPPER.key, 1, UNIT.PIECES),
    N(INGREDIENTS.OLIVE_OIL.key, 1, UNIT.TABLESPOON),

    // Side
    N(INGREDIENTS.JASMINE_RICE.key, 1, UNIT.CUP)
  ],
  steps: [
    "Marinate the beef and leave it to rest for at least 15 min.",
    "Prepare the sauce: mix black pepper, soy sauce, Worcestershire sauce, sugar, and 1 tbsp water. Set aside.",
    "Heat 1 tbsp olive oil in a wok over high heat. Add the beef and stir-fry 1–2 min until browned. Remove and set aside.",
    "In the same wok, add sliced onion and minced garlic. Stir-fry until fragrant. Add more oil if needed.",
    "Add sliced red and green peppers. Stir-fry for 1 min.",
    "Return the beef to the wok. Pour in the prepared sauce and mix well.",
    "Stir in the cornstarch slurry (1 tsp cornstarch mixed with 1 tbsp water). Cook 30 sec until the sauce thickens and coats the beef and vegetables.",
    "Serve hot with 1 cup cooked jasmine rice."
  ]
}
];

// Export if you ever switch to modules:
// export default recipeData;
