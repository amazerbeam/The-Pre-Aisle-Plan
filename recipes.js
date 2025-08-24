/** recipes.js
 * Uses INGREDIENTS.*.name to ensure consistent ingredient labels.
 * Requires ingredients.js to be loaded first.
 */
/** ingredients.js
 * Define aisles (with order) and a single source of truth for all ingredient names.
 * Load this BEFORE recipes.js in index.html.
 */

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
  MISC: { name: "Misc", order: 17},



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
      N("ROLLED_OATS", 40, "g"),
      N("GREEK_YOGURT", 100, "g"),
      N("MILK", 200, "ml"),
      N("MIXED_BERRIES", 100, "g"),
      N("CHIA_SEEDS", 2, "tsp"),
      N("HONEY", 0.5, "tsp"),
      N("PEANUT_BUTTER", 1, "tbsp"),
      N("BANANA", 1, "medium"),
      N("CINNAMON", 0.25, "tsp")
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
      N("EGGS", 8, "small"),
      N("BUTTER", 1, "tsp"),
      N("SPINACH", 60, "g"),
      N("AVOCADO", 1, "medium")
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
      N("CHICKEN_BREAST", 240, "g"),
      N("SALAD_LEAVES", 2, "handfuls"),
      N("CUCUMBER", 1, "piece"),
      N("CHERRY_TOMATOES", 10, "pieces"),
      N("CARROT", 2, "pieces"),
      N("LEMON", 1, "piece"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("AVOCADO", 1, "medium"),
      N("CHICKPEAS", 150, "g"),
      N("FETA_CHEESE", 40, "g")
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
      N("SALMON_FILLET", 2, "pieces (~150g each)"),
      N("BROCCOLI", 1, "head"),
      N("CARROT", 2, "pieces"),
      N("SALAD_LEAVES", 2, "handfuls"),
      N("LEMON", 1, "piece"),
      N("OLIVE_OIL", 3, "tbsp"),
      N("AVOCADO", 1, "medium"),
      N("ALMONDS", 30, "g"),
      N("SALT", 0.5, "tsp")
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
      N("CHICKEN_BREAST", 240, "g"),
      N("GREEN_BELL_PEPPER", 1, "piece"),
      N("RED_BELL_PEPPER", 1, "piece"),
      N("ONION", 1, "piece"),
      N("PAK_CHOI", 300, "g"),
      N("CELERY", 2, "pieces"),
      N("MUSHROOMS", 100, "g"),
      N("FIRM_TOFU", 100, "g"),
      N("EGGS", 2, "small"),
      N("CASHEWS", 30, "g"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("SOY_SAUCE", 1, "tbsp"),
      N("WORCESTERSHIRE_SAUCE", 0.5, "tbsp"),
      N("GINGER", 1, "tsp"),
      N("GARLIC", 1, "clove"),
      N("CORN_FLOUR", 1, "tsp"),
      N("SESAME_SEEDS", 1, "tsp"),
      N("SALT", 0.5, "tsp")
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
      N("FIRM_TOFU", 400, "g"),
      N("OLIVE_OIL", 3, "tbsp"),
      N("GARLIC", 1, "clove"),
      N("RED_BELL_PEPPER", 1, "piece"),
      N("ONION", 1, "piece"),
      N("MUSHROOMS", 150, "g"),
      N("SOY_SAUCE", 2, "tbsp"),
      N("SMOKED_PAPRIKA", 0.5, "tsp"),
      N("CHILI_FLAKES", 0.5, "tsp"),
      N("CASHEWS", 30, "g")
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
      N("PLAIN_FLOUR", 100, "g"),
      N("EGGS", 2, "small"),
      N("MILK", 300, "ml"),
      N("BUTTER", 10, "g"),
      N("STREAKY_BACON", 12, "slices"),
      N("MAPLE_SYRUP", 2, "tbsp")
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
      N("APPLE", 2, "medium"),
      N("ALMONDS", 30, "g"),
      N("GREEK_YOGURT", 150, "g")
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
      N("PINEAPPLE_CHUNKS", 150, "g"),
      N("CASHEWS", 30, "g"),
      N("GREEK_YOGURT", 150, "g"),
      N("CHIA_SEEDS", 2, "tsp")
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
      N("CHIA_SEEDS", 4, "tbsp"),
      N("WHOLE_MILK", 160, "ml"),
      N("BANANA", 1, "piece"),
      N("HONEY", 1, "tsp"),
      N("VANILLA_EXTRACT", 0.5, "tsp"),
      N("PEANUT_BUTTER", 2, "tbsp"),
      N("GREEK_YOGURT", 150, "g"),
      N("MIXED_BERRIES", 100, "g")
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
      N("TUNA", 220, "g"),
      N("EGGS", 8, "small"),
      N("SALT", 0.25, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("ONION_POWDER", 0.5, "tsp"),
      N("BUTTER", 4, "tsp")
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
      N("CHICKEN_WINGS", 750, "g"),
      N("BREADCRUMBS", 1, "cup"),
      N("SOY_SAUCE", 1, "tbsp"),
      N("WORCESTERSHIRE_SAUCE", 0.5, "tbsp"),
      N("FRANKS_HOT_SAUCE", 1, "tbsp"),
      N("GARLIC_POWDER", 1, "tsp"),
      N("ONION_POWDER", 0.5, "tsp"),
      N("SALT", 2, "tsp"),
      N("OLIVE_OIL", 1, "tbsp")
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
      N("CHICKEN_WINGS", 750, "g"),
      N("BREADCRUMBS", 1, "cup"),
      N("SOY_SAUCE", 1, "tbsp"),
      N("WORCESTERSHIRE_SAUCE", 0.5, "tbsp"),
      N("FRANKS_HOT_SAUCE", 1, "tbsp"),
      N("GARLIC_POWDER", 1, "tsp"),
      N("ONION_POWDER", 0.5, "tsp"),
      N("CORN_FLOUR", 0.5, "tbsp"),
      N("SALT", 2, "tsp"),
      N("OLIVE_OIL", 1, "tbsp"),
      N("POTATOES", 1000, "g")
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
      N("TURKEY_MINCE", 400, "g"),
      N("LETTUCE_LEAVES", 8, "pieces"),
      N("RED_BELL_PEPPER", 2, "pieces"),
      N("GARLIC", 1, "clove"),
      N("OLIVE_OIL", 3, "tbsp"),
      N("SALT", 0.25, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("CUCUMBER", 0.5, "piece"),
      N("CHERRY_TOMATOES", 6, "pieces"),
      N("RED_ONION", 0.25, "piece"),
      N("FETA_CHEESE", 40, "g"),
      N("ALMONDS", 20, "g"),
      N("LEMON_JUICE", 1, "tbsp")
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
      N("PEACH", 1, "medium"),
      N("GREEK_YOGURT", 150, "g"),
      N("HONEY", 2, "tsp"),
      N("CHIA_SEEDS", 2, "tsp"),
      N("CINNAMON", 0.25, "tsp"),
      N("ALMONDS", 15, "g"),
      N("COCONUT_FLAKES", 5, "g"),
      N("ALMOND_BUTTER", 1, "tbsp")
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
      N("CRISPS", 60, "g"), // assuming your “olive oil crackers” are a packaged snack—keep as CRISPS or add a CRACKERS item if you prefer
      N("PESTO", 2, "tbsp")
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
      N("CHICKEN_BREAST", 340, "g"),
      N("BREADCRUMBS", 0.25, "cup"),
      N("GARLIC_POWDER", 1, "tsp"),
      N("ONION_POWDER", 0.5, "tsp"),
      N("SMOKED_PAPRIKA", 0.5, "tsp"),
      N("SALT", 0.75, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("BROCCOLI", 1, "head"),
      N("CARROT", 2, "pieces"),
      N("GARLIC", 1, "clove"),
      N("AVOCADO", 1, "medium"),
      N("ALMONDS", 20, "g"),
      N("SESAME_SEEDS", 1, "tsp")
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
      N("PLAIN_FLOUR", 450, "g"),
      N("WATER", 240, "ml"),
      N("DRY_YEAST", 1, "tsp"),
      N("OLIVE_OIL", 4, "tbsp"),
      N("SALT", 2, "tsp"),
      N("TOMATO_SAUCE", 100, "g"),
      N("CHEESE", 300, "g"),
      N("CHORIZO", 100, "g")
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
      N("RED_BELL_PEPPER", 2, "pieces"),
      N("TURKEY_MINCE", 300, "g"),
      N("ONION", 1, "piece"),
      N("GARLIC", 1, "clove"),
      N("TOMATO_PASTE", 1, "tbsp"),
      N("SMOKED_PAPRIKA", 0.5, "tsp"),
      N("SALT", 0.5, "tsp"),
      N("OLIVE_OIL", 2.5, "tbsp"),
      N("SWEET_POTATO", 400, "g"),
      N("ALMONDS", 20, "g")
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
      N("CHICKPEAS", 240, "g"),
      N("FIRM_TOFU", 150, "g"),
      N("ONION", 1, "piece"),
      N("GARLIC", 2, "cloves"),
      N("CARROT", 2, "pieces"),
      N("RED_BELL_PEPPER", 1, "piece"),
      N("TINNED_TOMATOES", 1, "tin"),
      N("CURRY_POWDER", 2, "tbsp"),
      N("OLIVE_OIL", 2.5, "tbsp"),
      N("SWEET_POTATO", 400, "g"),
      N("CASHEWS", 20, "g"),
      N("SALT", 0.5, "tsp"),
      N("STOCK", 1, "cup"),
      N("BLACK_PEPPER", 0.25, "tsp")
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
      N("ZUCCHINI", 2, "medium"),
      N("TURKEY_MINCE", 300, "g"),
      N("TINNED_TOMATOES", 1, "tin"),
      N("GARLIC", 2, "cloves"),
      N("OLIVE_OIL", 1.5, "tbsp"),
      N("ONION", 1, "medium"),
      N("GREEN_OLIVES", 40, "g"),
      N("ITALIAN_SEASONING", 1, "tsp"),
      N("SALT", 1, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("PESTO", 1, "tbsp"),
      N("BASIL", 1, "tbsp"),
      N("SWEET_POTATO", 300, "g"),
      N("PARMESAN_CHEESE", 30, "g")
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
      N("ZUCCHINI", 2, "medium"),
      N("TURKEY_MINCE", 200, "g"),
      N("ALMONDS", 1, "tbsp"),
      N("CASHEWS", 60, "g"),
      N("MILK", 100, "ml"),
      N("EGGS", 1, "medium"),
      N("PARMESAN_CHEESE", 30, "g"),
      N("GARLIC", 1, "clove"),
      N("OLIVE_OIL", 2, "tsp"),
      N("SALT", 1, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("WHOLEMEAL_BREAD", 2, "slices (40g each)"),
      N("CHIVES", 1, "tbsp")
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
      N("CELERY", 8, "pieces"),
      N("HUMMUS", 6, "tbsp"),
      N("WALNUTS", 15, "g")
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
      N("AREPA_FLOUR_HARINA_PAN", 60, "g"),
      N("ROLLED_OATS", 60, "g"),
      N("WATER", 140, "ml"),
      N("SALT", 0.5, "tsp"),
      N("OLIVE_OIL", 1, "tbsp"),
      N("EGGS", 2, "small"),
      N("AVOCADO", 1, "piece"),
      N("CHICKEN_BREAST", 100, "g")
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
      N("TURKEY_MINCE", 300, "g"),
      N("BROWN_LENTILS", 1, "tin"),
      N("TINNED_TOMATOES", 1, "tin"),
      N("ONION", 1, "piece"),
      N("GARLIC", 3, "cloves"),
      N("CELERY", 2, "sticks"),
      N("CARROT", 1, "piece"),
      N("SPINACH", 60, "g"),
      N("BASIL", 1, "tbsp"),
      N("CAPERS", 1, "tbsp"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("SALT", 1, "tsp"),
      N("SUGAR", 1, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("ITALIAN_SEASONING", 1, "tsp"),
      N("STOCK", 1, "cup"),
      N("SWEET_POTATO", 300, "g")
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
    ingredients: [N("CRISPS", 135, "g")],
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
      N("PLAIN_FLOUR", 300, "g"),
      N("SALT", 1, "tsp"),
      N("BUTTER", 75, "g"),
      N("WATER", 120, "ml"),
      N("OLIVE_OIL", 1, "tbsp"),
      N("ONION", 1, "medium"),
      N("RED_BELL_PEPPER", 0.5, "piece"),
      N("GARLIC", 2, "cloves"),
      N("GROUND_BEEF", 400, "g"),
      N("SMOKED_PAPRIKA", 1, "tsp"),
      N("CUMIN", 1, "tsp"),
      N("SALT", 0.5, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("TOMATO_PASTE", 1.5, "tbsp"),
      N("STOCK", 60, "ml"),
      N("EGGS", 2, "pieces"),
      N("GREEN_OLIVES", 50, "g")
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
      N("BEEF_ROAST", 2, "pieces (200-250g each)"), // normalized to a single cut
      N("POTATOES", 600, "g"),
      N("SALT", 1, "tsp"),
      N("BLACK_PEPPER", 0.5, "tsp"),
      N("BUTTER", 20, "g"),
      N("GARLIC", 2, "cloves"),
      N("ROSEMARY", 2, "sprigs"),
      N("DOUBLE_CREAM", 100, "ml"),
      N("RUM", 1, "tbsp"),
      N("BLACK_PEPPER", 1, "tsp")
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
      N("CHICKEN_BREAST", 350, "g"),
      N("GREEN_BELL_PEPPER", 1, "piece"),
      N("RED_BELL_PEPPER", 1, "piece"),
      N("ONION", 1, "piece"),
      N("PAK_CHOI", 300, "g"),
      N("CELERY", 2, "pieces"),
      N("SALT", 0.5, "tsp"),
      N("SOY_SAUCE", 1, "tbsp"),
      N("PEANUT_BUTTER", 3.5, "tbsp"),
      N("COCONUT_WATER", 100, "ml"),
      N("WORCESTERSHIRE_SAUCE", 0.5, "tbsp"),
      N("GARLIC", 1, "clove"),
      N("CORN_FLOUR", 1, "tsp"),
      N("WATER", 1, "tbsp"),
      N("LIME_JUICE", 0.5, "tsp"),
      N("CUMIN", 0.25, "tsp")
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
      N("BROWN_LENTILS", 1, "tin"),
      N("ONION", 1, "piece"),
      N("GARLIC", 3, "cloves"),
      N("CARROT", 2, "pieces"),
      N("CELERY", 2, "sticks"),
      N("TINNED_TOMATOES", 1, "tin"),
      N("PAK_CHOI", 300, "g"),
      N("BAY_LEAF", 1, "piece"),
      N("STOCK", 1500, "ml"),
      N("SMOKED_PAPRIKA", 1, "tsp"),
      N("CUMIN", 1, "tsp"),
      N("SALT", 1, "tsp"),
      N("BLACK_PEPPER", 1, "to taste"),
      N("CAPERS", 2, "tbsp"),
      N("RED_BELL_PEPPER", 1, "piece")
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
      N("STREAKY_BACON", 12, "slices"),
      N("BREAD", 4, "slices"),
      N("POTATOES", 500, "g"),
      N("ONION", 70, "g"),
      N("SALT", 1, "tsp"),
      N("BUTTER", 20, "g")
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
      N("BREAD", 4, "slices"),
      N("BUTTER", 20, "g")
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
      N("RISOTTO_RICE", 300, "g"),
      N("STOCK", 700, "ml"),
      N("ONION", 1, "small"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("STREAKY_BACON", 100, "g"),
      N("MOZZARELLA", 100, "g"),
      N("PARMESAN_CHEESE", 40, "g"),
      N("EGGS", 1, "piece"),
      N("BREADCRUMBS", 80, "g"),
      N("BREADCRUMBS", 40, "g (for coating)"),
      N("SALT", 0.5, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp")
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
      N("BEEF_ROAST", 1000, "g"),
      N("SALT", 1, "tsp"),
      N("BLACK_PEPPER", 0.5, "tsp"),
      N("ONION", 2, "medium"),
      N("GARLIC", 2, "cloves"),
      N("CUMIN", 1, "tsp"),
      N("SMOKED_PAPRIKA", 1, "tsp"),
      N("STOCK", 500, "ml"),
      N("BUTTER", 2, "tbsp"),
      N("PLAIN_FLOUR", 2, "tbsp"),
      N("WORCESTERSHIRE_SAUCE", 1, "tsp"),
      N("FRANKS_HOT_SAUCE", 2, "tsp"),
      N("RICE_UNCOOKED", 0.33, "cups"),
      N("AVOCADO", 2, "pieces"),
      N("HALLOUMI", 200, "g"),
      N("JALAPENOS", 4, "tbsp"),
      N("FLOUR_TORTILLAS", 4, "large"),
      N("MOZZARELLA", 100, "g"),
      N("PARMESAN_CHEESE", 40, "g")
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
      N("TURKEY_BREAST", 300, "g"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("ONION", 1, "medium"),
      N("GARLIC", 2, "cloves"),
      N("TURNIP", 1, "small"),
      N("CARROT", 2, "medium"),
      N("CELERY", 2, "stalks"),
      N("MUSHROOMS", 150, "g"),
      N("SWEET_POTATO", 200, "g"),
      N("TOMATO_PASTE", 1, "tbsp"),
      N("THYME", 1, "tsp"),
      N("ROSEMARY", 1, "tsp"),
      N("BAY_LEAF", 1, "leaf"),
      N("STOCK", 500, "ml"),
      N("SALT", 1, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("PARSLEY", 1, "tbsp"),
      N("WHOLEMEAL_BREAD", 2, "slices")
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
      N("ALMOND_FLOUR", 60, "g"),
      N("EGGS", 2, "small"),
      N("MILK", 60, "ml"),
      N("BAKING_POWDER", 0.5, "tsp"),
      N("VANILLA_EXTRACT", 0.5, "tsp"),
      N("OLIVE_OIL", 1, "tsp"),
      N("MIXED_BERRIES", 60, "g"),
      N("HONEY", 1, "tsp"),
      N("GREEK_YOGURT", 100, "g"),
      N("BANANA", 1, "small")
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
      N("ROLLED_OATS", 60, "g"),
      N("MILK", 250, "ml"),
      N("WATER", 150, "ml"),
      N("MIXED_BERRIES", 80, "g"),
      N("HONEY", 1, "tsp"),
      N("SALT", 1, "pinch"),
      N("PEANUT_BUTTER", 1, "tbsp"),
      N("ALMONDS", 10, "g"),
      N("WALNUTS", 10, "g")
    ],
    steps: [
      "Simmer oats with milk, water & salt 5 min.",
      "Stir in peanut butter; serve topped with berries, nuts, honey."
    ]
  },
  {
    id: 38,
    meal: ["lunch"],
    recipe: "Fish Cakes with Leafy Salad & Sweet Potato",
    defaultServings: 2,
    calories: 1220,
    ingredients: [
      N("WHITE_FISH", 250, "g"),
      N("EGGS", 1, "piece"),
      N("GARLIC", 1, "clove"),
      N("SPRING_ONION", 1, "small"),
      N("PARSLEY", 1, "tbsp"),
      N("LEMON_ZEST", 0.5, "tsp"),
      N("ALMOND_FLOUR", 2, "tbsp"),
      N("OLIVE_OIL", 2, "tbsp"),
      N("SALT", 0.5, "tsp"),
      N("BLACK_PEPPER", 0.25, "tsp"),
      N("SWEET_POTATO", 300, "g"),
      N("SALAD_LEAVES", 2, "handfuls"),
      N("CUCUMBER", 0.5, "piece"),
      N("CHERRY_TOMATOES", 6, "pieces"),
      N("LEMON_JUICE", 1, "tbsp")
    ],
    steps: [
      "Roast sweet potato at 200°C 25–30 min.",
      "Poach fish; flake and mix with aromatics, flour, egg; form cakes; chill.",
      "Pan-fry cakes 3–4 min/side.",
      "Make salad; serve 2 cakes per person with salad and sweet potato."
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
      N("OLIVE_OIL", 50, "ml"),
      N("CHICKEN_WINGS", 8, "pieces"),
      N("PORK_BELLY", 8, "oz"),
      N("RED_BELL_PEPPER", 1, "piece"),
      N("GREEN_BELL_PEPPER", 1, "piece"),
      N("PEAS_PETIT_POIS", 50, "g"),
      N("GREEN_BEANS_FROZEN", 150, "g"),
      N("BUTTER_BEANS", 1, "tin"),
      N("GARLIC", 2, "cloves"),
      N("SMOKED_PAPRIKA", 1, "tsp"),
      N("TURMERIC", 0.5, "tsp"),
      N("TOMATO_SAUCE", 400, "g"),
      N("PAELLA_RICE", 400, "g"),
      N("WATER", 900, "ml"),
      N("ROSEMARY_SPRIG", 1, "piece")
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
