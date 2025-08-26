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
  ROLLED_OATS: { name: "Rolled oats", aisle: AISLE.GRAINS_PASTA },
  PLAIN_FLOUR: { name: "Plain flour", aisle: AISLE.BAKERY },
  ALMOND_FLOUR: { name: "Almond flour", aisle: AISLE.BAKERY },
  PAELLA_RICE: { name: "Paella rice", aisle: AISLE.GRAINS_PASTA },
  BREAD: { name: "Bread", aisle: AISLE.BAKERY },
  WHOLEMEAL_BREAD: { name: "Wholemeal bread", aisle: AISLE.BAKERY },
  FLOUR_TORTILLAS: { name: "Flour tortillas", aisle: AISLE.BAKERY },

  // Dairy & eggs
  GREEK_YOGURT: { name: "Greek yogurt", aisle: AISLE.DAIRY },
  WHOLE_MILK: { name: "Whole milk", aisle: AISLE.DAIRY },
  MILK: { name: "Milk", aisle: AISLE.DAIRY },
  BUTTER: { name: "Butter", aisle: AISLE.DAIRY },
  DOUBLE_CREAM: { name: "Double cream", aisle: AISLE.DAIRY },
  CHEESE: { name: "Cheese", aisle: AISLE.DAIRY },
  MOZZARELLA: { name: "Mozzarella", aisle: AISLE.DAIRY },
  PARMESAN_CHEESE: { name: "Parmesan", aisle: AISLE.DAIRY },
  FETA_CHEESE: { name: "Feta cheese", aisle: AISLE.DAIRY },
  HALLOUMI: { name: "Halloumi", aisle: AISLE.DAIRY },
  EGGS: { name: "Eggs", aisle: AISLE.BAKERY },

  // Meat / poultry / fish
  CHICKEN_BREAST: { name: "Chicken breast", aisle: AISLE.POULTRY },
  CHICKEN_WINGS: { name: "Chicken wings", aisle: AISLE.POULTRY },
  TURKEY_BREAST: { name: "Turkey breast", aisle: AISLE.POULTRY },
  TURKEY_MINCE: { name: "Turkey mince", aisle: AISLE.POULTRY },
  STREAKY_BACON: { name: "Streaky bacon", aisle: AISLE.MEAT },
  GROUND_BEEF: { name: "Ground beef", aisle: AISLE.MEAT },
  BEEF_ROAST: { name: "Beef roast", aisle: AISLE.MEAT },
  PORK_BELLY: { name: "Pork belly", aisle: AISLE.MEAT },
  SALMON_FILLET: { name: "Salmon fillet", aisle: AISLE.FISH },
  WHITE_FISH: { name: "White fish", aisle: AISLE.FISH },

  // Veg
  BROCCOLI: { name: "Broccoli", aisle: AISLE.VEG },
  GREEN_BEANS: { name: "Green beans", aisle: AISLE.FROZEN },
  TURNIP: { name: "Turnip", aisle: AISLE.VEG },
  LETTUCE_LEAVES: { name: "Lettuce leaves", aisle: AISLE.VEG },
  SALAD_LEAVES: { name: "Salad leaves", aisle: AISLE.VEG },
  SPINACH: { name: "Spinach", aisle: AISLE.VEG },
  ZUCCHINI: { name: "Zucchini", aisle: AISLE.VEG },
  GARLIC: { name: "Garlic", aisle: AISLE.VEG },
  GINGER: { name: "Ginger", aisle: AISLE.VEG },
  GREEN_BELL_PEPPER: { name: "Green bell pepper", aisle: AISLE.VEG },
  RED_BELL_PEPPER: { name: "Red bell pepper", aisle: AISLE.VEG },
  ONION: { name: "Onion", aisle: AISLE.VEG },
  RED_ONION: { name: "Red onion", aisle: AISLE.VEG },
  SPRING_ONION: { name: "Spring onion", aisle: AISLE.VEG },
  PAK_CHOI: { name: "Pak choi", aisle: AISLE.VEG },
  CELERY: { name: "Celery", aisle: AISLE.VEG },
  CARROT: { name: "Carrot", aisle: AISLE.VEG },
  CUCUMBER: { name: "Cucumber", aisle: AISLE.VEG },
  CHERRY_TOMATOES: { name: "Cherry tomatoes", aisle: AISLE.VEG },
  SCALLIONS: { name: "Scallions", aisle: AISLE.VEG },
  POTATOES: { name: "Potatoes", aisle: AISLE.VEG },
  SWEET_POTATO: { name: "Sweet potato", aisle: AISLE.VEG },

  TOMATO_PASTE: { name: "Tomato paste", aisle: AISLE.TINS_JARS },
  TINNED_TOMATOES: { name: "Tinned tomatoes", aisle: AISLE.TINS_JARS },
  TOMATO_SAUCE: { name: "Tomato sauce", aisle: AISLE.TINS_JARS },



  BASIL: { name: "Basil", aisle: AISLE.HERBS_SPICES },
  PARSLEY: { name: "Parsley", aisle: AISLE.HERBS_SPICES },
  THYME: { name: "Thyme (dried)", aisle: AISLE.HERBS_SPICES },
  ROSEMARY: { name: "Rosemary (dried)", aisle: AISLE.HERBS_SPICES },
  BAY_LEAF: { name: "Bay leaf", aisle: AISLE.HERBS_SPICES },
  CHIVES: { name: "Chives", aisle: AISLE.HERBS_SPICES },

  // Fruit
  LEMON: { name: "Lemon", aisle: AISLE.FRUIT },
  LEMON_JUICE: { name: "Lemon juice", aisle: AISLE.FRUIT },
  LIME_JUICE: { name: "Lime juice", aisle: AISLE.FRUIT },
  BANANA: { name: "Banana", aisle: AISLE.FRUIT },
  APPLE: { name: "Apple", aisle: AISLE.FRUIT },
  PEACH: { name: "Peach", aisle: AISLE.FRUIT },
  AVOCADO: { name: "Avocado", aisle: AISLE.FRUIT },
  MIXED_BERRIES: { name: "Mixed berries", aisle: AISLE.FRUIT },
  PINEAPPLE_CHUNKS: { name: "Pineapple chunks", aisle: AISLE.TINS_JARS },
  LEMON_ZEST: { name: "Lemon zest", aisle: AISLE.HERBS_SPICES },

  // Legumes / tins
  CHICKPEAS: { name: "Chickpeas", aisle: AISLE.TINS_JARS },
  BUTTER_BEANS: { name: "Butter beans", aisle: AISLE.TINS_JARS },
  BROWN_LENTILS: { name: "Brown lentils", aisle: AISLE.TINS_JARS },
  HUMMUS: { name: "Hummus", aisle: AISLE.TINS_JARS },
  CAPERS: { name: "Capers", aisle: AISLE.TINS_JARS },
  GREEN_OLIVES: { name: "Green olives", aisle: AISLE.TINS_JARS },

  // Nuts & seeds
  ALMONDS: { name: "Almonds", aisle: AISLE.NUTS },
  CASHEWS: { name: "Cashews", aisle: AISLE.NUTS },
  WALNUTS: { name: "Walnuts", aisle: AISLE.NUTS },
  ALMOND_BUTTER: { name: "Almond butter", aisle: AISLE.NUTS },
  PEANUT_BUTTER: { name: "Peanut butter", aisle: AISLE.NUTS },
  COCONUT_FLAKES: { name: "Coconut flakes", aisle: AISLE.BAKERY },
  SESAME_SEEDS: { name: "Sesame seeds", aisle: AISLE.SEEDS },
  CHIA_SEEDS: { name: "Chia seeds", aisle: AISLE.SEEDS },

  // Oils / condiments / sauces
  OLIVE_OIL: { name: "Olive oil", aisle: AISLE.OILS },
  PESTO: { name: "Pesto", aisle: AISLE.CONDIMENTS },
  SOY_SAUCE: { name: "Soy sauce", aisle: AISLE.CONDIMENTS },
  WORCESTERSHIRE_SAUCE: { name: "Worcestershire sauce", aisle: AISLE.CONDIMENTS },
  FRANKS_HOT_SAUCE: { name: "Frank’s Hot Sauce", aisle: AISLE.CONDIMENTS },
  MAPLE_SYRUP: { name: "Maple syrup", aisle: AISLE.BAKERY },
  VANILLA_EXTRACT: { name: "Vanilla extract", aisle: AISLE.BAKERY },
  COCONUT_WATER: { name: "Coconut water", aisle: AISLE.FRUIT },

  // Stocks / broth
  STOCK: { name: "Stock", aisle: AISLE.MISC },

  // Seasoning
  SALT: { name: "Salt", aisle: AISLE.HERBS_SPICES },
  BLACK_PEPPER: { name: "Black pepper", aisle: AISLE.HERBS_SPICES },
  SMOKED_PAPRIKA: { name: "Smoked paprika", aisle: AISLE.HERBS_SPICES },
  CHILI_FLAKES: { name: "Chili flakes", aisle: AISLE.HERBS_SPICES },
  ITALIAN_SEASONING: { name: "Italian seasoning", aisle: AISLE.HERBS_SPICES },
  CUMIN: { name: "Cumin", aisle: AISLE.HERBS_SPICES },
  CINNAMON: { name: "Cinnamon", aisle: AISLE.HERBS_SPICES },
  SUGAR: { name: "Sugar", aisle: AISLE.BAKERY },

  // Starches & odds

  BREADCRUMBS: { name: "Breadcrumbs", aisle: AISLE.BAKERY },
  BAKING_POWDER: { name: "Baking powder", aisle: AISLE.BAKERY },
  CORN_FLOUR: { name: "Corn flour", aisle: AISLE.BAKERY },
  CRISPS: { name: "Crisps", aisle: AISLE.MISC },
  AREPA_FLOUR_HARINA_PAN: { name: "Harina PAN", aisle: AISLE.MISC },
  WATER: { name: "Water", aisle: AISLE.BEVERAGES },
  LIME_JUICE: { name: "Lime juice", aisle: AISLE.FRUIT }, // alias-safe
  RUM: { name: "Rum", aisle: AISLE.BEVERAGES },
  PEAS_PETIT_POIS: { name: "Petit pois", aisle: AISLE.FROZEN },
  GREEN_BEANS_FROZEN: { name: "Green beans", aisle: AISLE.FROZEN },
  ROSEMARY_SPRIG: { name: "Rosemary sprig", aisle: AISLE.VEG },

  // Sweeteners
  HONEY: { name: "Honey", aisle: AISLE.BAKERY },

  // Extra veg & proteins
  MUSHROOMS: { name: "Mushrooms", aisle: AISLE.VEG },
  FIRM_TOFU: { name: "Firm tofu", aisle: AISLE.MEAT },

  // Seasonings & powders
  ONION_POWDER: { name: "Onion powder", aisle: AISLE.HERBS_SPICES },
  GARLIC_POWDER: { name: "Garlic powder", aisle: AISLE.HERBS_SPICES },
  CURRY_POWDER: { name: "Curry powder", aisle: AISLE.HERBS_SPICES },
  TURMERIC: { name: "Turmeric", aisle: AISLE.HERBS_SPICES },

  // Baking & dough
  DRY_YEAST: { name: "Dry yeast", aisle: AISLE.BAKERY },

  // Meats
  CHORIZO: { name: "Chorizo", aisle: AISLE.MEAT },

  // Grains
  RISOTTO_RICE: { name: "Risotto rice", aisle: AISLE.GRAINS_PASTA },

  // Condiments & extras
  JALAPENOS: { name: "Jalapeños", aisle: AISLE.CONDIMENTS },
  TUNA: { name: "Tuna", aisle: AISLE.TINS_JARS },
  RICE_UNCOOKED: { name: "Uncooked rice", aisle: AISLE.GRAINS_PASTA },

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
      N("ROLLED_OATS", 40, UNIT.GRAM),
      N("GREEK_YOGURT", 100, UNIT.GRAM),
      N("MILK", 200, UNIT.MILLILITER),
      N("MIXED_BERRIES", 100, UNIT.GRAM),
      N("CHIA_SEEDS", 2, UNIT.TEASPOON),
      N("HONEY", 0.5, UNIT.TEASPOON),
      N("PEANUT_BUTTER", 1, UNIT.TABLESPOON),
      N("BANANA", 1, UNIT.PIECES),
      N("CINNAMON", 0.25, UNIT.TEASPOON)
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
      N("EGGS", 8, UNIT.SMALL),
      N("BUTTER", 1, UNIT.TEASPOON),
      N("SPINACH", 60, UNIT.GRAM),
      N("AVOCADO", 1, UNIT.MEDIUM)
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
      N("CHICKEN_BREAST", 240, UNIT.GRAM),
      N("SALAD_LEAVES", 2, UNIT.HANDFUL),
      N("CUCUMBER", 1, UNIT.PIECES),
      N("CHERRY_TOMATOES", 10, UNIT.PIECES),
      N("CARROT", 2, UNIT.PIECES),
      N("LEMON", 1, UNIT.PIECES),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("AVOCADO", 1, UNIT.MEDIUM),
      N("CHICKPEAS", 150, UNIT.GRAM),
      N("FETA_CHEESE", 40, UNIT.GRAM)
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
      N("SALMON_FILLET", 2, UNIT.PIECES),
      N("BROCCOLI", 1, UNIT.HEAD),
      N("CARROT", 2, UNIT.PIECES),
      N("SALAD_LEAVES", 2, UNIT.HANDFUL),
      N("LEMON", 1, UNIT.PIECES),
      N("OLIVE_OIL", 3, UNIT.TABLESPOON),
      N("AVOCADO", 1, UNIT.MEDIUM),
      N("ALMONDS", 30, UNIT.GRAM),
      N("SALT", 0.5, UNIT.TEASPOON)
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
      N("CHICKEN_BREAST", 240, UNIT.GRAM),
      N("GREEN_BELL_PEPPER", 1, UNIT.PIECES),
      N("RED_BELL_PEPPER", 1, UNIT.PIECES),
      N("ONION", 1, UNIT.PIECES),
      N("PAK_CHOI", 300, UNIT.GRAM),
      N("CELERY", 2, UNIT.PIECES),
      N("MUSHROOMS", 100, UNIT.GRAM),
      N("FIRM_TOFU", 100, UNIT.GRAM),
      N("EGGS", 2, UNIT.SMALL),
      N("CASHEWS", 30, UNIT.GRAM),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("SOY_SAUCE", 1, UNIT.TABLESPOON),
      N("WORCESTERSHIRE_SAUCE", 0.5, UNIT.TABLESPOON),
      N("GINGER", 1, UNIT.TEASPOON),
      N("GARLIC", 1, UNIT.CLOVE),
      N("CORN_FLOUR", 1, UNIT.TEASPOON),
      N("SESAME_SEEDS", 1, UNIT.TEASPOON),
      N("SALT", 0.5, UNIT.TEASPOON)
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
      N("FIRM_TOFU", 400, UNIT.GRAM),
      N("OLIVE_OIL", 3, UNIT.TABLESPOON),
      N("GARLIC", 1, UNIT.CLOVE),
      N("RED_BELL_PEPPER", 1, UNIT.PIECES),
      N("ONION", 1, UNIT.PIECES),
      N("MUSHROOMS", 150, UNIT.GRAM),
      N("SOY_SAUCE", 2, UNIT.TABLESPOON),
      N("SMOKED_PAPRIKA", 0.5, UNIT.TEASPOON),
      N("CHILI_FLAKES", 0.5, UNIT.TEASPOON),
      N("CASHEWS", 30, UNIT.GRAM)
    ],
    steps: [
      "Press tofu for ~15 minutes and cut into cubes.",
      "Heat 1 tbsp olive oil or ghee in a pan and fry tofu until golden. Set aside.",
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
      N("PLAIN_FLOUR", 100, UNIT.GRAM),
      N("EGGS", 2, UNIT.SMALL),
      N("MILK", 300, UNIT.MILLILITER),
      N("BUTTER", 10, UNIT.GRAM),
      N("STREAKY_BACON", 12, UNIT.SLICES),
      N("MAPLE_SYRUP", 2, UNIT.TABLESPOON)
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
      N("APPLE", 2, UNIT.MEDIUM),
      N("ALMONDS", 30, UNIT.GRAM),
      N("GREEK_YOGURT", 150, UNIT.GRAM)
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
      N("PINEAPPLE_CHUNKS", 150, UNIT.GRAM),
      N("CASHEWS", 30, UNIT.GRAM),
      N("GREEK_YOGURT", 150, UNIT.GRAM),
      N("CHIA_SEEDS", 2, UNIT.TEASPOON)
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
      N("CHIA_SEEDS", 4, UNIT.TABLESPOON),
      N("WHOLE_MILK", 160, UNIT.MILLILITER),
      N("BANANA", 1, UNIT.PIECES),
      N("HONEY", 1, UNIT.TEASPOON),
      N("VANILLA_EXTRACT", 0.5, UNIT.TEASPOON),
      N("PEANUT_BUTTER", 2, UNIT.TABLESPOON),
      N("GREEK_YOGURT", 150, UNIT.GRAM),
      N("MIXED_BERRIES", 100, UNIT.GRAM)
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
      N("TUNA", 220, UNIT.GRAM),
      N("EGGS", 8, UNIT.SMALL),
      N("SALT", 0.25, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("ONION_POWDER", 0.5, UNIT.TEASPOON),
      N("BUTTER", 4, UNIT.TEASPOON)
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
      N("CHICKEN_WINGS", 750, UNIT.GRAM),
      N("BREADCRUMBS", 1, UNIT.CUP),
      N("SOY_SAUCE", 1, UNIT.TABLESPOON),
      N("WORCESTERSHIRE_SAUCE", 0.5, UNIT.TABLESPOON),
      N("FRANKS_HOT_SAUCE", 1, UNIT.TABLESPOON),
      N("GARLIC_POWDER", 1, UNIT.TEASPOON),
      N("ONION_POWDER", 0.5, UNIT.TEASPOON),
      N("SALT", 2, UNIT.TEASPOON),
      N("OLIVE_OIL", 1, UNIT.TABLESPOON)
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
      N("CHICKEN_WINGS", 750, UNIT.GRAM),
      N("BREADCRUMBS", 1, UNIT.CUP),
      N("SOY_SAUCE", 1, UNIT.TABLESPOON),
      N("WORCESTERSHIRE_SAUCE", 0.5, UNIT.TABLESPOON),
      N("FRANKS_HOT_SAUCE", 1, UNIT.TABLESPOON),
      N("GARLIC_POWDER", 1, UNIT.TEASPOON),
      N("ONION_POWDER", 0.5, UNIT.TEASPOON),
      N("CORN_FLOUR", 0.5, UNIT.TABLESPOON),
      N("SALT", 2, UNIT.TEASPOON),
      N("OLIVE_OIL", 1, UNIT.TABLESPOON),
      N("POTATOES", 1000, UNIT.GRAM)
    ],
    steps: [
      "Preheat oven to 215°C (419°F).",
      "In a large bowl, mix soy sauce, Worcestershire sauce, hot sauce, olive oil, garlic powder, onion powder, and salt.",
      "Add the chicken wings and toss to coat. Add the corn flour and let marinate for 10–15 minutes.",
      "Coat wings evenly with breadcrumbs, pressing gently to stick.",
      "Place wings on a lined baking tray in a single layer.",
      "Bake wings for 25 minutes, flip, and bake another 10 minutes until crispy and golden.",
      "Slice potatoes into fries (~1–1.5 cm thick). Parboil 6–7 minutes, drain and dry.",
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
      N("TURKEY_MINCE", 400, UNIT.GRAM),
      N("LETTUCE_LEAVES", 8, UNIT.PIECES),
      N("RED_BELL_PEPPER", 2, UNIT.PIECES),
      N("GARLIC", 1, UNIT.CLOVE),
      N("OLIVE_OIL", 3, UNIT.TABLESPOON),
      N("SALT", 0.25, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("CUCUMBER", 0.5, UNIT.PIECES),
      N("CHERRY_TOMATOES", 6, UNIT.PIECES),
      N("RED_ONION", 0.25, UNIT.PIECES),
      N("FETA_CHEESE", 40, UNIT.GRAM),
      N("ALMONDS", 20, UNIT.GRAM),
      N("LEMON_JUICE", 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Heat 1 tbsp olive oil in a pan over medium heat.",
      "Add garlic and cook for 30 seconds.",
      "Add turkey mince and cook until browned (6–8 minutes).",
      "Add diced bell peppers, cook for 2–3 minutes. Season with salt and pepper.",
      "Let mixture cool slightly. Wash and dry lettuce leaves.",
      "Spoon the turkey mixture into the lettuce leaves.",
      "Make the salad, toss cucumber, cherry tomatoes, red onion, 2 tbsp olive oil, lemon juice, chopped almonds, and crumbled feta.",
      "Serve the lettuce cups with the salad."
    ]
  },
  {
    id: 15,
    meal: ["snacks"],
    recipe: "Peach Yogurt Bowl with Almonds & Coconut",
    defaultServings: 2,
    calories: 520,
    ingredients: [
      N("PEACH", 1, UNIT.MEDIUM),
      N("GREEK_YOGURT", 150, UNIT.GRAM),
      N("HONEY", 2, UNIT.TEASPOON),
      N("CHIA_SEEDS", 2, UNIT.TEASPOON),
      N("CINNAMON", 0.25, UNIT.TEASPOON),
      N("ALMONDS", 15, UNIT.GRAM),
      N("COCONUT_FLAKES", 5, UNIT.GRAM),
      N("ALMOND_BUTTER", 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Wash and slice the peach.",
      "Divide the yogurt into two bowls.",
      "Top with peach slices, honey, chia, cinnamon, almonds, coconut, and almond butter.",
      "Serve."
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
      N("CRISPS", 60, UNIT.GRAM), // assuming your “olive oil crackers” are a packaged snack—keep as CRISPS or add a CRACKERS item if you prefer
      N("PESTO", 2, UNIT.TABLESPOON)
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
      N("CHICKEN_BREAST", 340, UNIT.GRAM),
      N("BREADCRUMBS", 0.25, UNIT.CUP),
      N("GARLIC_POWDER", 1, UNIT.TEASPOON),
      N("ONION_POWDER", 0.5, UNIT.TEASPOON),
      N("SMOKED_PAPRIKA", 0.5, UNIT.TEASPOON),
      N("SALT", 0.75, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("BROCCOLI", 1, "head"),
      N("CARROT", 2, UNIT.PIECES),
      N("GARLIC", 1, UNIT.CLOVE),
      N("AVOCADO", 1, UNIT.MEDIUM),
      N("ALMONDS", 20, UNIT.GRAM),
      N("SESAME_SEEDS", 1, UNIT.TEASPOON)
    ],
    steps: [
      "Preheat oven to 200°C.",
      "Mix breadcrumbs and spices.",
      "Brush chicken with oil and coat in crumbs.",
      "Bake 25 minutes, flipping halfway.",
      "Toss broccoli & carrots with oil and garlic; roast 20–25 minutes.",
      "Slice avocado; plate with veg and chicken. Sprinkle nuts & seeds."
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
      N("PLAIN_FLOUR", 450, UNIT.GRAM),
      N("WATER", 240, UNIT.MILLILITER),
      N("DRY_YEAST", 1, UNIT.TEASPOON),
      N("OLIVE_OIL", 4, UNIT.TABLESPOON),
      N("SALT", 2, UNIT.TEASPOON),
      N("TOMATO_SAUCE", 100, UNIT.GRAM),
      N("CHEESE", 300, UNIT.GRAM),
      N("CHORIZO", 100, UNIT.GRAM)
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
      N("RED_BELL_PEPPER", 2, UNIT.PIECES),
      N("TURKEY_MINCE", 300, UNIT.GRAM),
      N("ONION", 1, UNIT.PIECES),
      N("GARLIC", 1, UNIT.CLOVE),
      N("TOMATO_PASTE", 1, UNIT.TABLESPOON),
      N("SMOKED_PAPRIKA", 0.5, UNIT.TEASPOON),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("OLIVE_OIL", 2.5, UNIT.TABLESPOON),
      N("SWEET_POTATO", 400, UNIT.GRAM),
      N("ALMONDS", 20, UNIT.GRAM)
    ],
    steps: [
      "Roast sweet potatoes 25–30 min at 190°C.",
      "Prep peppers; sauté onion & garlic; brown turkey.",
      "Stir in tomato paste & paprika; stuff peppers; bake 25–30 min.",
      "Serve with roasted sweet potato; sprinkle nuts."
    ]
  },
  {
    id: 20,
    meal: ["dinner"],
    recipe: "Chickpea & Tofu Curry",
    defaultServings: 2,
    calories: 1340,
    ingredients: [
      N("CHICKPEAS", 240, UNIT.GRAM),
      N("FIRM_TOFU", 150, UNIT.GRAM),
      N("ONION", 1, UNIT.PIECES),
      N("GARLIC", 2, UNIT.CLOVE),
      N("CARROT", 2, UNIT.PIECES),
      N("RED_BELL_PEPPER", 1, UNIT.PIECES),
      N("TINNED_TOMATOES", 1, UNIT.TIN),
      N("CURRY_POWDER", 2, UNIT.TABLESPOON),
      N("OLIVE_OIL", 2.5, UNIT.TABLESPOON),
      N("SWEET_POTATO", 400, UNIT.GRAM),
      N("CASHEWS", 20, UNIT.GRAM),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("STOCK", 1, UNIT.CUP),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Roast sweet potato 25–30 min at 200°C.",
      "Brown tofu; remove.",
      "Sauté onion/garlic; add veg; toast curry powder.",
      "Add chickpeas, tomatoes, stock; simmer 10–15 min.",
      "Return tofu; season; serve with sweet potato and nuts."
    ]
  },
  {
    id: 21,
    meal: ["dinner"],
    recipe: "Turkey Bolognese",
    defaultServings: 2,
    calories: 1240,
    ingredients: [
      N("ZUCCHINI", 2, UNIT.MEDIUM),
      N("TURKEY_MINCE", 300, UNIT.GRAM),
      N("TINNED_TOMATOES", 1, UNIT.TIN),
      N("GARLIC", 2, UNIT.CLOVE),
      N("OLIVE_OIL", 1.5, UNIT.TABLESPOON),
      N("ONION", 1, UNIT.MEDIUM),
      N("GREEN_OLIVES", 40, UNIT.GRAM),
      N("ITALIAN_SEASONING", 1, UNIT.TEASPOON),
      N("SALT", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("PESTO", 1, UNIT.TABLESPOON),
      N("BASIL", 1, UNIT.TABLESPOON),
      N("SWEET_POTATO", 300, UNIT.GRAM),
      N("PARMESAN_CHEESE", 30, UNIT.GRAM)
    ],
    steps: [
      "Roast sweet potato 25–30 min at 200°C.",
      "Spiralize zucchini.",
      "Sauté onion/garlic; brown turkey; add tomatoes, seasoning, olives, pesto.",
      "Simmer 10–15 min. Toss in zucchini 2–3 min.",
      "Serve topped with sweet potato and parmesan."
    ]
  },
  {
    id: 22,
    meal: ["dinner"],
    recipe: "Cashew Carbonara",
    defaultServings: 2,
    calories: 1260,
    ingredients: [
      N("ZUCCHINI", 2, UNIT.MEDIUM),
      N("TURKEY_MINCE", 200, UNIT.GRAM),
      N("ALMONDS", 1, UNIT.TABLESPOON),
      N("CASHEWS", 60, UNIT.GRAM),
      N("MILK", 100, UNIT.MILLILITER),
      N("EGGS", 1, UNIT.SMALL),
      N("PARMESAN_CHEESE", 30, UNIT.GRAM),
      N("GARLIC", 1, UNIT.CLOVE),
      N("OLIVE_OIL", 2, UNIT.TEASPOON),
      N("SALT", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("WHOLEMEAL_BREAD", 2, UNIT.SLICES),
      N("CHIVES", 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Warm milk and soak cashews 30 min.",
      "Sear turkey (mixed with ground almonds, seasoning).",
      "Blend cashews + milk → cashew cream; mix with egg & parmesan.",
      "Sauté garlic; cook zucchini 2–3 min.",
      "Off heat, stir in sauce; top with turkey and chives. Serve with bread."
    ]
  },
  {
    id: 23,
    meal: ["snacks"],
    recipe: "Celery and Hummus",
    defaultServings: 2,
    calories: 500,
    ingredients: [
      N("CELERY", 8, UNIT.PIECES),
      N("HUMMUS", 6, UNIT.TABLESPOON),
      N("WALNUTS", 15, UNIT.GRAM)
    ],
    steps: [
      "Prep celery sticks, portion hummus.",
      "Serve with walnuts."
    ]
  },
  {
    id: 24,
    meal: ["breakfast"],
    recipe: "Arepa with Chicken, Egg & Avocado",
    defaultServings: 2,
    calories: 715,
    ingredients: [
      N("AREPA_FLOUR_HARINA_PAN", 60, UNIT.GRAM),
      N("ROLLED_OATS", 60, UNIT.GRAM),
      N("WATER", 140, UNIT.MILLILITER),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("OLIVE_OIL", 1, UNIT.TABLESPOON),
      N("EGGS", 2, UNIT.SMALL),
      N("AVOCADO", 1, UNIT.PIECES),
      N("CHICKEN_BREAST", 100, UNIT.GRAM)
    ],
    steps: [
      "Mix Harina PAN, oats, water, and salt; rest 5 min.",
      "Cook patties 4–5 min/side in oil.",
      "Add cooked chicken, egg, avocado to split arepas."
    ]
  },
  {
    id: 25,
    meal: ["dinner"],
    recipe: "Tuscan Turkey Meatballs",
    defaultServings: 2,
    calories: 1584,
    ingredients: [
      N("TURKEY_MINCE", 300, UNIT.GRAM),
      N("BROWN_LENTILS", 1, UNIT.TIN),
      N("TINNED_TOMATOES", 1, UNIT.TIN),
      N("ONION", 1, UNIT.PIECES),
      N("GARLIC", 3, UNIT.CLOVE),
      N("CELERY", 2, UNIT.STALK),
      N("CARROT", 1, UNIT.PIECES),
      N("SPINACH", 60, UNIT.GRAM),
      N("BASIL", 1, UNIT.TABLESPOON),
      N("CAPERS", 1, UNIT.TABLESPOON),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("SALT", 1, UNIT.TEASPOON),
      N("SUGAR", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("ITALIAN_SEASONING", 1, UNIT.TEASPOON),
      N("STOCK", 1, UNIT.CUP),
      N("SWEET_POTATO", 300, UNIT.GRAM)
    ],
    steps: [
      "Roast sweet potato 25–30 min at 200°C.",
      "Make meatballs with turkey, onion, garlic, basil, salt & pepper.",
      "Sauté mirepoix; brown meatballs.",
      "Build tomato sauce with capers, seasoning, sugar; add lentils, stock, veg & meatballs; simmer 30 min.",
      "Stir in spinach and serve with sweet potato."
    ]
  },
  {
    id: 26,
    meal: ["snacks"],
    isCheat: true,
    recipe: "Olive Oil & Himalayan Pink Salt Crisps",
    defaultServings: 2,
    calories: 700,
    ingredients: [N("CRISPS", 135, UNIT.GRAM)],
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
      N("PLAIN_FLOUR", 300, UNIT.GRAM),
      N("SALT", 1, UNIT.TEASPOON),
      N("BUTTER", 75, UNIT.GRAM),
      N("WATER", 120, UNIT.MILLILITER),
      N("OLIVE_OIL", 1, UNIT.TABLESPOON),
      N("ONION", 1, UNIT.PIECES),
      N("RED_BELL_PEPPER", 0.5, UNIT.PIECES),
      N("GARLIC", 2, UNIT.CLOVE),
      N("GROUND_BEEF", 400, UNIT.GRAM),
      N("SMOKED_PAPRIKA", 1, UNIT.TEASPOON),
      N("CUMIN", 1, UNIT.TEASPOON),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("TOMATO_PASTE", 1.5, UNIT.TABLESPOON),
      N("STOCK", 60, UNIT.MILLILITER),
      N("EGGS", 2, UNIT.SMALL),
      N("GREEN_OLIVES", 50, UNIT.GRAM)
    ],
    steps: [
      "Make dough; rest 30 min; cut circles.",
      "Cook filling with veg, beef, spices, tomato paste, stock; cool; add egg & olives.",
      "Fill, seal, egg-wash and bake 200°C ~20–22 min."
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
      N("BEEF_ROAST", 2, UNIT.PIECES), // normalized to a single cut
      N("POTATOES", 600, UNIT.GRAM),
      N("SALT", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.5, UNIT.TEASPOON),
      N("BUTTER", 20, UNIT.GRAM),
      N("GARLIC", 2, UNIT.CLOVE),
      N("ROSEMARY", 2, "sprigs"),
      N("DOUBLE_CREAM", 100, UNIT.MILLILITER),
      N("RUM", 1, UNIT.TABLESPOON),
      N("BLACK_PEPPER", 1, UNIT.TEASPOON)
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
      N("CHICKEN_BREAST", 350, UNIT.GRAM),
      N("GREEN_BELL_PEPPER", 1, UNIT.PIECES),
      N("RED_BELL_PEPPER", 1, UNIT.PIECES),
      N("ONION", 1, UNIT.PIECES),
      N("PAK_CHOI", 300, UNIT.GRAM),
      N("CELERY", 2, UNIT.PIECES),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("SOY_SAUCE", 1, UNIT.TABLESPOON),
      N("PEANUT_BUTTER", 3.5, UNIT.TABLESPOON),
      N("COCONUT_WATER", 100, UNIT.MILLILITER),
      N("WORCESTERSHIRE_SAUCE", 0.5, UNIT.TABLESPOON),
      N("GARLIC", 1, UNIT.CLOVE),
      N("CORN_FLOUR", 1, UNIT.TEASPOON),
      N("WATER", 1, UNIT.TABLESPOON),
      N("LIME_JUICE", 0.5, UNIT.TEASPOON),
      N("CUMIN", 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Marinate sliced chicken & veg with salt.",
      "Stir-fry chicken & veg 5–7 min.",
      "Add peanut butter, soy, coconut water, Worcestershire, garlic, lime, cumin.",
      "Add cornflour slurry; thicken and serve."
    ]
  },
  {
    id: 30,
    meal: ["lunch"],
    recipe: "Lentils with Pak Choi",
    defaultServings: 4,
    calories: 700,
    ingredients: [
      N("BROWN_LENTILS", 1, UNIT.TIN),
      N("ONION", 1, UNIT.PIECES),
      N("GARLIC", 3, UNIT.CLOVE),
      N("CARROT", 2, UNIT.PIECES),
      N("CELERY", 2, UNIT.ST),
      N("TINNED_TOMATOES", 1, UNIT.TIN),
      N("PAK_CHOI", 300, UNIT.GRAM),
      N("BAY_LEAF", 1, UNIT.PIECES),
      N("STOCK", 1500, UNIT.MILLILITER),
      N("SMOKED_PAPRIKA", 1, UNIT.TEASPOON),
      N("CUMIN", 1, UNIT.TEASPOON),
      N("SALT", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 1, UNIT.TEASPOON),
      N("CAPERS", 2, UNIT.TABLESPOON),
      N("RED_BELL_PEPPER", 1, UNIT.PIECES)
    ],
    steps: [
      "Sauté onion/garlic/carrots/celery with salt.",
      "Add pak choi stems; cook 3–4 min.",
      "Add spices; then tomatoes.",
      "Add lentils, bay leaf, stock; simmer 25–30 min.",
      "Add pak choi leaves and finish; season."
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
      N("STREAKY_BACON", 12, UNIT.SLICES),
      N("BREAD", 4, UNIT.SLICES),
      N("POTATOES", 500, UNIT.GRAM),
      N("ONION", 70, UNIT.GRAM),
      N("SALT", 1, UNIT.TEASPOON),
      N("BUTTER", 20, UNIT.GRAM)
    ],
    steps: [
      "Grate potatoes & onion; salt; squeeze water.",
      "Form patties; fry in butter until crisp. Freeze extras.",
      "Fry bacon; toast bread; assemble."
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
      N("BREAD", 4, UNIT.SLICES),
      N("BUTTER", 20, UNIT.GRAM)
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
      N("RISOTTO_RICE", 300, UNIT.GRAM),
      N("STOCK", 700, UNIT.MILLILITER),
      N("ONION", 1, UNIT.PIECES),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("STREAKY_BACON", 100, UNIT.GRAM),
      N("MOZZARELLA", 100, UNIT.GRAM),
      N("PARMESAN_CHEESE", 40, UNIT.GRAM),
      N("EGGS", 1, UNIT.SMALL),
      N("BREADCRUMBS", 80, UNIT.GRAM),
      N("BREADCRUMBS", 40, UNIT.GRAM),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON)
    ],
    steps: [
      "Make risotto with onions and stock; cool.",
      "Stir in parmesan, egg, breadcrumbs; form balls with mozzarella centers.",
      "Coat in crumbs; deep-fry 170–180°C 3–4 min."
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
      N("BEEF_ROAST", 1000, UNIT.GRAM),
      N("SALT", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.5, UNIT.TEASPOON),
      N("ONION", 2, UNIT.PIECES),
      N("GARLIC", 2, UNIT.CLOVE),
      N("CUMIN", 1, UNIT.TEASPOON),
      N("SMOKED_PAPRIKA", 1, UNIT.TEASPOON),
      N("STOCK", 500, UNIT.MILLILITER),
      N("BUTTER", 2, UNIT.TABLESPOON),
      N("PLAIN_FLOUR", 2, UNIT.TABLESPOON),
      N("WORCESTERSHIRE_SAUCE", 1, UNIT.TEASPOON),
      N("FRANKS_HOT_SAUCE", 2, UNIT.TEASPOON),
      N("RICE_UNCOOKED", 0.33, UNIT.CUP),
      N("AVOCADO", 2, UNIT.PIECES),
      N("HALLOUMI", 200, UNIT.GRAM),
      N("JALAPENOS", 4, UNIT.TABLESPOON),
      N("FLOUR_TORTILLAS", 4, UNIT.LARGE),
      N("MOZZARELLA", 100, UNIT.GRAM),
      N("PARMESAN_CHEESE", 40, UNIT.GRAM)
    ],
    steps: [
      "Sear beef; sauté onions/garlic; add spices & stock; braise at 160°C ~2.5h; shred.",
      "Make gravy with roux + braising liquid; add sauces; combine with beef.",
      "Cook rice; fry halloumi; warm tortillas; assemble with beef, rice, avocado, cheeses, jalapeños."
    ]
  },
  {
    id: 35,
    meal: ["lunch"],
    recipe: "Irish Turkey Stew with Sweet Potatoes & Wholemeal Bread",
    defaultServings: 2,
    calories: 1200,
    ingredients: [
      N("TURKEY_BREAST", 300, UNIT.GRAM),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("ONION", 1, UNIT.PIECES),
      N("GARLIC", 2, UNIT.CLOVE),
      N("TURNIP", 1, UNIT.SMALL),
      N("CARROT", 2, UNIT.PIECES),
      N("CELERY", 2, UNIT.STALK),
      N("MUSHROOMS", 150, UNIT.GRAM),
      N("SWEET_POTATO", 200, UNIT.GRAM),
      N("TOMATO_PASTE", 1, UNIT.TABLESPOON),
      N("THYME", 1, UNIT.TEASPOON),
      N("ROSEMARY", 1, UNIT.TEASPOON),
      N("BAY_LEAF", 1, UNIT.LEAF),
      N("STOCK", 500, UNIT.MILLILITER),
      N("SALT", 1, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("PARSLEY", 1, UNIT.TABLESPOON),
      N("WHOLEMEAL_BREAD", 2, UNIT.SLICES)
    ],
    steps: [
      "Sear turkey; remove.",
      "Sauté onions/garlic/celery; add mushrooms.",
      "Add tomato paste, herbs, stock; return turkey and root veg; simmer 25–30 min.",
      "Adjust seasoning; serve with bread."
    ]
  },
  {
    id: 36,
    meal: ["breakfast"],
    recipe: "Almond Flour Pancakes",
    defaultServings: 2,
    calories: 880,
    ingredients: [
      N("ALMOND_FLOUR", 60, UNIT.GRAM),
      N("EGGS", 2, UNIT.SMALL),
      N("MILK", 60, UNIT.MILLILITER),
      N("BAKING_POWDER", 0.5, UNIT.TEASPOON),
      N("VANILLA_EXTRACT", 0.5, UNIT.TEASPOON),
      N("OLIVE_OIL", 1, UNIT.TEASPOON),
      N("MIXED_BERRIES", 60, UNIT.GRAM),
      N("HONEY", 1, UNIT.TEASPOON),
      N("GREEK_YOGURT", 100, UNIT.GRAM),
      N("BANANA", 1, UNIT.PIECES)
    ],
    steps: [
      "Whisk eggs, milk, vanilla; add almond flour & baking powder.",
      "Cook small pancakes; serve with berries, banana, yogurt, honey."
    ]
  },
  {
    id: 37,
    meal: ["breakfast"],
    recipe: "Warm Oat Porridge with Berries & Nuts",
    defaultServings: 2,
    calories: 880,
    ingredients: [
      N("ROLLED_OATS", 60, UNIT.GRAM),
      N("MILK", 250, UNIT.MILLILITER),
      N("WATER", 150, UNIT.MILLILITER),
      N("MIXED_BERRIES", 80, UNIT.GRAM),
      N("HONEY", 1, UNIT.TEASPOON),
      N("SALT", .5, UNIT.TEASPOON),
      N("PEANUT_BUTTER", 1, UNIT.TABLESPOON),
      N("ALMONDS", 10, UNIT.GRAM),
      N("WALNUTS", 10, UNIT.GRAM)
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
      N("WHITE_FISH", 250, UNIT.GRAM),
      N("EGGS", 2, UNIT.SMALL),
      N("GARLIC", 1, UNIT.CLOVE),
      N("SPRING_ONION", 1, UNIT.SMALL),
      N("PARSLEY", 1, UNIT.TABLESPOON),
      N("LEMON_ZEST", 0.5, UNIT.TEASPOON),
      N("ALMOND_FLOUR", 2, UNIT.TABLESPOON),
      N("OLIVE_OIL", 2, UNIT.TABLESPOON),
      N("SALT", 0.5, UNIT.TEASPOON),
      N("BLACK_PEPPER", 0.25, UNIT.TEASPOON),
      N("SWEET_POTATO", 300, UNIT.GRAM),
      N("SALAD_LEAVES", 2, UNIT.HANDFUL),
      N("CUCUMBER", 0.5, UNIT.PIECES),
      N("CHERRY_TOMATOES", 6, UNIT.PIECES),
      N("LEMON_JUICE", 1, UNIT.TABLESPOON)
    ],
    steps: [
      "Heat oven to 200°C (fan 180°C). Peel and cut the sweet potato into 2–3 cm chunks. Toss on a baking tray with 1 tbsp olive oil, a pinch of salt and black pepper. Roast 25–30 min, turning halfway, until tender and lightly browned.",
      "While the potato roasts, place the white fish in a shallow pan and add cold water to just cover. Bring to a bare simmer over medium heat, then turn off the heat, cover, and leave 8–10 min until the fish is opaque and flakes easily.",
      "Lift out the fish, drain well, and pat dry with kitchen paper. Flake into a large bowl, discarding any bones/skin.",
      "Finely chop the spring onion and parsley; mince the garlic; zest the lemon (for the listed zest).",
      "Add to the bowl: flaked fish, spring onion, parsley, garlic, lemon zest, almond flour, the small egg (lightly beaten), 1/4 tsp salt, and a few grinds of black pepper. Gently fold to combine—don’t mash completely; leave some flakes.",
      "If the mix feels too wet, rest it 5–10 min so the almond flour hydrates; then add up to 1 tsp extra almond flour only if still needed. If too dry to bind, add 1–2 tsp lemon juice from the listed amount.",
      "Divide into 4 patties (~6–7 cm wide, ~2 cm thick). Place on a plate, cover, and chill 10–15 min to firm up.",
      "Warm a non-stick pan over medium heat with 1 tbsp olive oil. Fry the fish cakes 3–4 min per side until deep golden with crisp edges. Move to a warm plate to rest 1–2 min.",
      "Make the salad: halve the cherry tomatoes and slice the cucumber. Toss with the salad leaves, 1 tbsp lemon juice, a small pinch of salt, and black pepper.",
      "Serve: 2 fish cakes per person with the roasted sweet potato and the leafy salad."
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
      N("OLIVE_OIL", 50, UNIT.MILLILITER),
      N("CHICKEN_WINGS", 8, UNIT.PIECES),
      N("PORK_BELLY", 8, UNIT.OUNCE),
      N("RED_BELL_PEPPER", 1, UNIT.PIECES),
      N("GREEN_BELL_PEPPER", 1, UNIT.PIECES),
      N("PEAS_PETIT_POIS", 50, UNIT.GRAM),
      N("GREEN_BEANS_FROZEN", 150, UNIT.GRAM),
      N("BUTTER_BEANS", 1, UNIT.TIN),
      N("GARLIC", 2, UNIT.CLOVE),
      N("SMOKED_PAPRIKA", 1, UNIT.TEASPOON),
      N("TURMERIC", 0.5, UNIT.TEASPOON),
      N("TOMATO_SAUCE", 400, UNIT.GRAM),
      N("PAELLA_RICE", 400, UNIT.GRAM),
      N("WATER", 900, UNIT.MILLILITER),
      N("ROSEMARY_SPRIG", 1, UNIT.PIECES)
    ],
    steps: [
      "Brown meats in oil; add garlic & peppers.",
      "Add tomato sauce; stir in rice.",
      "Add water, seasonings; stop stirring once boiling.",
      "Add beans & rosemary; cook until liquid absorbed; rest; finish in oven if needed."
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
  }
];

// Export if you ever switch to modules:
// export default recipeData;
