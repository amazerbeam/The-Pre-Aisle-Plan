const recipeData = [
  {
    "id": 1,
    "meal": ["breakfast"],
    "recipe": "Overnight Oats",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Rolled oats", "quantity": 40, "unit": "g" },
      { "name": "Greek yogurt", "quantity": 100, "unit": "g" },
      { "name": "Milk", "quantity": 100, "unit": "ml" },
      { "name": "Berries", "quantity": 100, "unit": "g" },
      { "name": "Chia seeds", "quantity": 1, "unit": "tsp" },
      { "name": "Honey", "quantity": 1, "unit": "tsp" },
      { "name": "Cinnamon", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Combine oats, yogurt, milk, and chia seeds.",
      "Stir and top with berries.",
      "Refrigerate overnight.",
      "Add honey and cinnamon before serving."
    ]
  },
  {
    "id": 2,
    "meal": ["breakfast"],
    "recipe": "Scrambled Eggs",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Eggs", "quantity": 8, "unit": "small" },
      { "name": "Butter", "quantity": 1, "unit": "tsp" }
    ],
    "steps": [
      "Whisk eggs with salt to taste.",
      "Heat butter in a pan and pour in eggs.",
      "Stir continuously until softly scrambled.",
      "Serve hot."
    ]
  },
  {
    "id": 3,
    "meal": ["lunch"],
    "recipe": "Grilled Chicken Salad",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chicken breast", "quantity": 240, "unit": "g" },
      { "name": "Salad leaves", "quantity": 2, "unit": "handfuls" },
      { "name": "Cucumber", "quantity": 1, "unit": "piece" },
      { "name": "Cherry tomatoes", "quantity": 10, "unit": "pieces" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Lemon", "quantity": 1, "unit": "piece" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
      "Boil the chicken breast in stock and rest for and hour or overnight.",
      "Wash and dry the salad leaves, then place them in a large mixing bowl.",
      "Peel and grate the carrots using a coarse grater.",
      "Slice the cucumber into thin rounds or half-moons.",
      "Cut the cherry tomatoes in half.",
      "Add the grated carrots, cucumber, and cherry tomatoes to the bowl with the salad leaves.",
      "Juice the lemon",
      "In a small bowl, mix the lemon juice and olive oil to make a light dressing.",
      "Drizzle the dressing over the salad and toss gently to combine.",
      "Top the salad with the sliced grilled chicken just before serving."
    ]
  },

  {
    "id": 5,
    "meal": ["dinner"],
    "recipe": "Baked Salmon",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Salmon fillet", "quantity": 2, "unit": "pieces" },
      { "name": "Broccoli", "quantity": 1, "unit": "head" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Salad leaves", "quantity": 2, "unit": "handfuls" },
      { "name": "Lemon", "quantity": 1, "unit": "piece" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" }
    ],
    "steps": [
      "Preheat oven to 180°C.",
      "Cut broccoli into florets and toss with 1 tbsp olive oil and a pinch of salt.",
      "Spread broccoli on a baking tray and roast for 10 minutes.",
      "After 10 minutes, push broccoli to the sides and place salmon fillets in the center. Drizzle salmon with a little olive oil and a pinch of salt.",
      "Return tray to oven and bake for another 20 minutes, until salmon is cooked through and broccoli is tender and slightly crispy (broccoli total cook time: 30 minutes).",
      "While the salmon and broccoli cook, spiralize the carrots.",
      "In a bowl, combine salad leaves and spiralized carrots.",
      "Squeeze over the juice of 1 lemon, add 1 tbsp olive oil and a pinch of salt. Toss to coat.",
      "Serve the baked salmon with the roasted broccoli and carrot salad on the side."
    ]
  },
  {
    "id": 6,
    "meal": ["dinner"],
    "recipe": "Stir-Fried Chicken & Peppers",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chicken breast", "quantity": 240, "unit": "g" },
      { "name": "Green bell pepper", "quantity": 1, "unit": "piece" },
      { "name": "Red bell pepper", "quantity": 1, "unit": "piece" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Pak choi", "quantity": 300, "unit": "g" },
      { "name": "Celery", "quantity": 2, "unit": "pieces" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" }, // For marinating
      { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Worcestershire sauce", "quantity": 0.5, "unit": "tbsp" },
      { "name": "Ginger", "quantity": 1, "unit": "tsp" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Corn flour", "quantity": 1, "unit": "tsp" },
      { "name": "Sesame seeds", "quantity": 1, "unit": "tsp" }

    ],
    "steps": [
      "Slice the chicken breast, green pepper, red pepper, and onion into strips.",
      "In the morning or the night before, toss the sliced chicken, peppers, onion, celery and pak choi with olive oil and salt. Cover and refrigerate to marinate.",
      "When ready to cook, heat a pan or wok over medium-high heat.",
      "Add the marinated chicken and vegetables and stir-fry for 3–4 minutes until the chicken is nearly cooked and the vegetables are just softened.",
      "Add garlic and ginger, stir-fry for 1 minute until fragrant.",
      "Add soy sauce and Worcestershire sauce, stir to combine.",
      "Mix corn flour with a splash of water to make a slurry, then add to the pan and stir until the sauce thickens.",
      "Sprinkle sesame seeds before serving."
    ]
  },

  {
    "id": 9,
    "meal": ["dinner"],
    "recipe": "Tofu Stir-Fry",
    "defaultServings": 2,

    "ingredients": [
      { "name": "Firm tofu", "quantity": 300, "unit": "g" },
      { "name": "Olive oil or ghee", "quantity": 2, "unit": "tbsp" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Red pepper", "quantity": 1, "unit": "piece" },
      { "name": "White onion", "quantity": 1, "unit": "piece" },
      { "name": "Mushrooms", "quantity": 150, "unit": "g" },
      { "name": "Soy sauce", "quantity": 2, "unit": "tbsp" },
      { "name": "Smoked paprika", "quantity": 0.5, "unit": "tsp" }
    ],
    "steps": [
      "Press tofu for ~15 minutes and cut into cubes.",
      "Heat 1 tbsp oil in a pan and fry tofu until golden. Set aside.",
      "Add 1 tbsp more oil to the pan, sauté garlic for 30 seconds.",
      "Add red pepper, onion, and mushrooms. Stir-fry 4–5 minutes.",
      "Return tofu to the pan. Add soy sauce and smoked paprika.",
      "Toss well and cook another 1–2 minutes until heated through."
    ]
  },
  {
    "id": 10,
    "meal": ["breakfast"],
    "recipe": "Pancakes and Bacon",
    "isCheat": true,
    "defaultServings": 2,
    "ingredients": [
      { "name": "Plain flour", "quantity": 100, "unit": "g" },
      { "name": "Eggs", "quantity": 2, "unit": "small" },
      { "name": "Milk", "quantity": 300, "unit": "ml" },
      { "name": "Butter", "quantity": 10, "unit": "g" },
      { "name": "Streaky bacon", "quantity": 12, "unit": "slices" },
      { "name": "Maple syrup", "quantity": 2, "unit": "tbsp" }
    ],
    "steps": [
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
    "id": 11,
    "meal": ["snacks"],
    "recipe": "Apple and Almond Nuts",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Apple", "quantity": 2, "unit": "medium" },
      { "name": "Almonds", "quantity": 30, "unit": "g" }
    ],
    "steps": [
      "Slice each apple into wedges or bite-sized pieces.",
      "Portion the almonds into two servings (15g each).",
      "Serve one apple and 15g of almonds per person."
    ]
  }, {
    "id": 12,
    "meal": ["snacks"],
    "recipe": "Pineapple & Cashew Snack",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Pineapple chunks", "quantity": 150, "unit": "g" },
      { "name": "Cashews", "quantity": 30, "unit": "g" }
    ],
    "steps": [
      "Portion 75g of pineapple chunks into two bowls.",
      "Add 15g of cashews to each bowl.",
      "Serve chilled or at room temperature."
    ]
  }, {
    "id": 13,
    "meal": ["breakfast", "snacks"],
    "recipe": "Banana Chia Pudding",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chia seeds", "quantity": 4, "unit": "tbsp" },
      { "name": "Milk", "quantity": 160, "unit": "ml" },
      { "name": "Banana", "quantity": 0.5, "unit": "piece" },
      { "name": "Honey", "quantity": 1, "unit": "tsp" },
      { "name": "Vanilla extract", "quantity": 0.5, "unit": "tsp" }
    ],
    "steps": [
      "Mash the banana in a bowl or jar.",
      "Add milk, chia seeds, honey, and vanilla. Mix well.",
      "Let sit for 5 minutes, then stir again to break up clumps.",
      "Cover and refrigerate for at least 2 hours or overnight.",
      "Stir before serving. Optionally top with fruit or nuts."
    ]
  },
  {
    "id": 14,
    "meal": "lunch",
    "recipe": "Tuna & Egg Patties",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Tuna", "quantity": 110, "unit": "g" },
      { "name": "Eggs", "quantity": 4, "unit": "small" },
      { "name": "Salt", "quantity": 0.25, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Onion powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
      "Crack the eggs into a bowl and whisk.",
      "Add drained tuna and mix until well combined.",
      "Season with salt, pepper, and onion powder.",
      "Heat olive oil in a non-stick pan over medium heat.",
      "Scoop small portions into the pan and flatten slightly.",
      "Fry for 2–3 minutes per side until golden brown.",
      "Serve hot, optionally with salad or dipping sauce."
    ]
  },{
    "id": 15,
    "meal": ["lunch"],
    "recipe": "Crispy Spiced Chicken Wings",
    "defaultServings": 2,
    "isCheat": true,
    "ingredients": [
      { "name": "Chicken wings", "quantity": 750, "unit": "g" },
      { "name": "Breadcrumbs", "quantity": 1, "unit": "cup" },
      { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Worcestershire sauce", "quantity": 0.5, "unit": "tbsp" },
      { "name": "Franks hot sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Garlic powder", "quantity": 1, "unit": "tsp" },
      { "name": "Onion powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Salt", "quantity": 2, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
      "Preheat oven to 215°C (419°F).",
      "In a large bowl, mix soy sauce, Worcestershire sauce, hot sauce, olive oil, garlic powder, onion powder, and salt.",
      "Add the chicken wings and toss to coat. Let marinate for 10–15 minutes.",
      "Coat wings evenly with breadcrumbs, pressing gently to stick.",
      "Place wings on a lined baking tray in a single layer.",
      "Bake for 25 minutes.",
      "Flip wings and bake for another 10 minutes until crispy and golden.",
      "Serve hot."
    ]
  }, {
    "id": 16,
    "meal": "dinner",
    isCheat: "true",
    "recipe": "Crispy Chicken Wings with Fries ",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chicken wings", "quantity": 750, "unit": "g" },
      { "name": "Breadcrumbs", "quantity": 1, "unit": "cup" },
      { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Worcestershire sauce", "quantity": 0.5, "unit": "tbsp" },
      { "name": "Franks hot sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Garlic powder", "quantity": 1, "unit": "tsp" },
      { "name": "Onion powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Corn Flour", "quantity": 0.5, "unit": "tbsp" },
      { "name": "Salt", "quantity": 2, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Potatoes", "quantity": 1000, "unit": "g" },
    ],
    "steps": [
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
    "id": 17,
    "meal": ["lunch"],
    "recipe": "Turkey Lettuce Cups",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Lettuce leaves", "quantity": 8, "unit": "pieces" },
      { "name": "Bell peppers", "quantity": 2, "unit": "pieces" },
      { "name": "Hummus or tahini", "quantity": 2, "unit": "tbsp" },
      { "name": "Fresh parsley or coriander", "quantity": 1, "unit": "small bunch" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Olive oil", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.25, "unit": "tsp" },
      { "name": "Pepper", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Heat olive oil in a pan over medium heat.",
      "Add garlic and cook for 30 seconds until fragrant.",
      "Add turkey mince and cook until browned and cooked through (6–8 minutes).",
      "Season with salt, pepper, and optional chili flakes or lemon juice.",
      "Stir in diced bell peppers and cook for 2–3 minutes.",
      "Let the mixture cool slightly.",
      "Wash and dry the lettuce leaves.",
      "Spoon the turkey mixture into each lettuce leaf.",
      "Drizzle or spread hummus or tahini on top.",
      "Sprinkle with chopped herbs and serve immediately."
    ]
  },
  {
    "id": 19,
    "meal": ["snacks"],
    "recipe": "Peach Yogurt Bowl",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Peaches", "quantity": 2, "unit": "medium" },
      { "name": "Greek yogurt", "quantity": 200, "unit": "g" },
      { "name": "Honey", "quantity": 2, "unit": "tsp" },
      { "name": "Chia seeds", "quantity": 2, "unit": "tsp" },
      { "name": "Cinnamon", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Wash and slice the peaches into thin wedges.",
      "Divide the yogurt into two bowls.",
      "Top each bowl with peach slices.",
      "Drizzle 1 tsp honey over each serving.",
      "Sprinkle chia seeds and cinnamon.",
      "Serve immediately or chill briefly before serving."
    ]
  },
  {
    "id": 20,
    "meal": ["snacks"],
    "recipe": "Olive Oil Crackers with Pesto",
    "defaultServings": 2,
    "isCheat": true,
    "ingredients": [
      { "name": "Olive oil crackers", "quantity": 60, "unit": "g" },
      { "name": "Pesto", "quantity": 2, "unit": "tbsp" }
    ],
    "steps": [
      "Portion out olive oil crackers into two servings (about 30g each).",
      "Serve with 1 tbsp of pesto per person for dipping or spreading.",
      "Optional: Garnish with a sprinkle of grated Parmesan or a basil leaf."
    ]
  }, {
    "id": 21,
    "meal": ["dinner"],
    "recipe": "Breaded Chicken with Garlic Veggies",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chicken breasts", "quantity": 240, "unit": "g" },
      { "name": "Breadcrumbs", "quantity": 0.25, "unit": "cup" },
      { "name": "Garlic powder", "quantity": 1, "unit": "tsp" },
      { "name": "Onion powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Paprika", "quantity": 0.5, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Broccoli", "quantity": 1, "unit": "head" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Olive oil", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Preheat oven to 200°C (392°F).",
      "In a bowl, mix breadcrumbs, garlic powder, onion powder, paprika, salt, and pepper.",
      "Brush chicken breasts with olive oil or spray lightly.",
      "Coat chicken in the breadcrumb mixture and place on a baking sheet.",
      "Bake chicken for 25 minutes, flipping halfway, until golden and cooked through.",
      "Meanwhile, cut broccoli into florets and slice carrots into chips.",
      "Toss vegetables with 1 tsp olive oil, minced garlic, and a pinch of salt.",
      "Roast vegetables for 20–25 minutes in the oven alongside the chicken.",
      "Serve chicken with garlic veggies hot."
    ]
  },
  {
    "id": 22,
    "isCheat": true,
    "meal": ["dinner"],
    "recipe": "Chorizo Pizza",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Flour", "quantity": 450, "unit": "g" },
      { "name": "Water", "quantity": 240, "unit": "ml" },
      { "name": "Dry yeast", "quantity": 1, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 4, "unit": "tbsp" },
      { "name": "Salt", "quantity": 2, "unit": "tsp" },
      { "name": "Tomato sauce", "quantity": 100, "unit": "g" },
      { "name": "Cheese", "quantity": 300, "unit": "g" },
      { "name": "Chorizo", "quantity": 100, "unit": "g" }
    ],
    "steps": [
      "In a large bowl, combine flour, yeast, and salt.",
      "Add water and 2 tbsp olive oil. Mix and knead for 8–10 minutes until smooth.",
      "Cover and let dough rise for 1 hour or until doubled.",
      "Preheat oven to 230°C (446°F).",
      "Roll out dough on a floured surface to your desired thickness.",
      "Transfer to a baking tray or pizza stone.",
      "Spread tomato sauce evenly over the base.",
      "Top with cheese and sliced chorizo.",
      "Drizzle 2 tbsp olive oil over the top.",
      "Bake for 12–15 minutes until crust is golden and cheese is bubbly.",
      "Slice and serve hot."
    ]
  },

  {
    "id": 24,
    "meal": ["dinner"],
    "recipe": "Turkey Stuffed Peppers",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Bell peppers", "quantity": 2, "unit": "pieces" },
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Tomato paste", "quantity": 1, "unit": "tbsp" },
      { "name": "Paprika", "quantity": 0.5, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tsp" }
    ],
    "steps": [
      "Preheat oven to 190°C.",
      "Slice tops off peppers and remove seeds.",
      "Sauté onion and garlic in oil, then add turkey mince.",
      "Cook until browned, stir in tomato paste and paprika.",
      "Stuff mixture into peppers and bake for 25–30 minutes."
    ]
  },
  {
    "id": 25,
    "meal": ["dinner"],
    "recipe": "Chickpea & Veg Curry",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chickpeas (cooked or canned)", "quantity": 240, "unit": "g" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Red pepper", "quantity": 1, "unit": "piece" },
      { "name": "Chopped tomatoes", "quantity": 200, "unit": "g" },
      { "name": "Curry powder", "quantity": 1, "unit": "tbsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Chop onion, garlic, carrots, and pepper.",
      "Heat olive oil in a pan, sauté onion and garlic until soft.",
      "Add carrots and peppers, cook for 5 minutes.",
      "Stir in curry powder and toast for 30 seconds.",
      "Add chickpeas and chopped tomatoes.",
      "Simmer for 10–15 minutes until thickened and veggies are tender.",
      "Season with salt and pepper, serve hot."
    ]
  },

  {
    "id": 27,
    "meal": ["dinner"],
    "recipe": "Veggie-Packed Omelette",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Eggs", "quantity": 8, "unit": "small" },
      { "name": "Spinach", "quantity": 50, "unit": "g" },
      { "name": "Tomatoes", "quantity": 1, "unit": "piece" },
      { "name": "Mushrooms", "quantity": 100, "unit": "g" },
      { "name": "Onion", "quantity": 0.5, "unit": "piece" },
      { "name": "Olive oil", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Whisk eggs with salt to taste.",
      "Sauté chopped onion, tomato, spinach, and mushrooms.",
      "Pour in eggs, cook until set, then fold and serve."
    ]
  },
  {
    "id": 29,
    "meal": ["dinner"],
    "recipe": "Turkey Bolognese with Zucchini Noodles",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Zucchini", "quantity": 2, "unit": "medium" },
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Tinned tomatoes", "quantity": 1, "unit": "can (400g)" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Onion", "quantity": 1, "unit": "medium" },
      { "name": "Green olives", "quantity": 40, "unit": "g" },
      { "name": "Italian seasoning", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Pesto or Capers", "quantity": 1, "unit": "tbsp" },
      { "name": "Basil (optional garnish)", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
      "Spiralize the zucchini to make noodles and set aside.",
      "Heat half the olive oil in a pan. Add chopped garlic and sauté for 30 seconds until fragrant.",
      "Add chopped onion and cook until soft.",
      "Add turkey mince, breaking it apart, and cook until fully browned.",
      "Heat the rest of the olive oil in a saucepan. Add chopped garlic and capers sauté for 30 seconds until fragrant.",
      "Add tinned tomatoes, Italian seasoning, salt, black pepper and pesto (now if using pesto) . Stir well.",
      "Add chopped green olives. Simmer sauce for 10–15 minutes, stirring occasionally.",
      "Add zucchini noodles and toss gently, cooking for 2–3 minutes until just tender.",
      "Serve warm, topped with fresh basil if desired."
    ]
  }
  ,

  {
    "id": 30,
    "meal": ["snacks"],
    "recipe": "Celery and Hummus",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Celery sticks", "quantity": 6, "unit": "pieces" },
      { "name": "Hummus", "quantity": 4, "unit": "tbsp" }
    ],
    "steps": [
      "Wash and cut celery into sticks (about 3 pieces per serving).",
      "Portion 2 tbsp of hummus into a small bowl for each person.",
      "Serve celery with hummus for dipping."
    ]
  },

  {
    "id": 30,
    "meal": ["breakfast", "lunch"],
    "recipe": "Arepa with Avocado & Egg",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Harina PAN", "quantity": 60, "unit": "g" },
      { "name": "Rolled oats", "quantity": 60, "unit": "g" },
      { "name": "Water", "quantity": 140, "unit": "ml" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Eggs", "quantity": 4, "unit": "small" },
      { "name": "Avocado (optional)", "quantity": 0.5, "unit": "piece" }
    ],
    "steps": [
      "Grind the oats slightly if needed to make them finer.",
      "Mix Harina PAN, oats, water, and salt to form a soft dough. Let it rest for 5 minutes.",
      "Shape into small flat patties.",
      "Heat olive oil in a pan over medium heat and cook arepas for 4–5 minutes per side until golden and cooked through.",
      "While cooking, fry or scramble the eggs.",
      "Slice cheese and optional avocado.",
      "Split arepas and fill each with egg, cheese, and optional avocado. Serve warm."
    ]
  },

  {
    "id": 31,
    "meal": "dinner",
    "recipe": "Overnight Boiled Chicken with Gravy & Corn",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Chicken thighs", "quantity": 2, "unit": "pieces" },
      { "name": "Chicken stock", "quantity": 500, "unit": "ml" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Onion", "quantity": 1, "unit": "small" },
      { "name": "Thyme", "quantity": 1, "unit": "sprig" },
      { "name": "Butter", "quantity": 1, "unit": "tbsp" },
      { "name": "Flour", "quantity": 1, "unit": "tbsp" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Green beans", "quantity": 100, "unit": "g" },
      { "name": "Olive oil", "quantity": 1, "unit": "tsp" },
      { "name": "Corn on the cob", "quantity": 2, "unit": "pieces" },
      { "name": "Butter (for corn)", "quantity": 2, "unit": "tsp" }
    ],
    "steps": [
      "In a pot, combine chicken, stock, garlic, onion, thyme, salt and pepper. Simmer 30 minutes until cooked.",
      "Let cool and refrigerate overnight in the liquid.",
      "Next day, reheat chicken gently in the same stock.",
      "Steam or boil carrots and green beans. Season and toss with olive oil.",
      "Boil corn for 7–10 minutes. Add 1 tsp butter and salt to each.",
      "Melt butter in a pan, stir in flour, cook 1 minute.",
      "Slowly whisk in chicken stock (~150 ml) until thickened into gravy.",
      "Serve chicken with veg, corn, and gravy."
    ]
  },

  {
    "id": 32,
    "meal": ["dinner"],
    "recipe": "Tuscan Turkey Meatballs & Lentil Florentine",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Brown lentils", "quantity": 100, "unit": "g" },
      { "name": "Tinned tomatoes", "quantity": 400, "unit": "g" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 3, "unit": "cloves" },
      { "name": "Celery", "quantity": 2, "unit": "sticks" },
      { "name": "Carrot", "quantity": 1, "unit": "piece" },
      { "name": "Spinach", "quantity": 60, "unit": "g" },
      { "name": "Fresh basil (leaves or granules)", "quantity": 1, "unit": "tbsp" },
      { "name": "Capers", "quantity": 1, "unit": "tbsp" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Salt", "quantity": 1.5, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Italian seasoning herbs", "quantity": 1, "unit": "tsp" }
    ],
    "steps": [
      "Finely chop half the onion, 1 clove garlic, and half the basil (if using leaves). In a bowl, mix with turkey mince, salt, and pepper.",
      "Form the turkey mixture into small meatballs (about 12).",
      "Finely chop the remaining onion, celery, carrot, and garlic.",
      "Heat 1 tbsp olive oil in a large pan over medium heat. Add the chopped onion, celery, carrot, and a pinch of salt. Fry for 5–7 minutes until softened and lightly golden. Remove the veg from the pan and set aside.",
      "Add a little more olive oil if needed, then fry the meatballs in the same pan until browned on all sides. Remove and set aside.",
      "In a saucepan, heat 1 tbsp olive oil over medium heat. Add the remaining garlic and sauté for 30 seconds until fragrant.",
      "Add the capers and cook for another minute.",
      "Add the tinned tomatoes, 1 tsp salt, and Italian seasoning herbs. Stir and bring to a simmer.",
      "Return the fried vegetables and meatballs to the sauce, along with the lentils. Stir to combine.",
      "Cover and simmer everything together for 30 minutes on low heat.",
      "Stir in the spinach and remaining basil (if using leaves) until wilted.",
      "Taste and adjust seasoning if needed. Serve hot."
    ]
  },

  {
    "id": 33,
    "meal": ["snacks"],
    "isCheat": true,
    "recipe": "Olive Oil & Himalayan Pink Salt Crisps",
    "defaultServings": 2,
    "ingredients": [
      { "name": "Crisps", "quantity": 135, "unit": "g" },
    ],
    "steps": [
      "Divide and eat the crisps as a snack.",
    ]
  },
  {
    "id": 34,
    "meal": ["lunch"],
    "isCheat": true,
    "recipe": "Argentine Beef Empanada Bites",
    "defaultServings": 2,
    "ingredients": [
      // Pastry
      { "name": "Plain flour", "quantity": 300, "unit": "g" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Butter or lard (cold, cubed)", "quantity": 75, "unit": "g" },
      { "name": "Warm water", "quantity": 120, "unit": "ml" },
      // Filling
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Onion", "quantity": 1, "unit": "medium, finely chopped" },
      { "name": "Red bell pepper", "quantity": 0.5, "unit": "piece, finely chopped" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves, minced" },
      { "name": "Ground beef", "quantity": 400, "unit": "g" },
      { "name": "Paprika", "quantity": 1, "unit": "tsp" },
      { "name": "Ground cumin", "quantity": 1, "unit": "tsp" },
      { "name": "Chili flakes (optional)", "quantity": 0.5, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Hard-boiled eggs", "quantity": 2, "unit": "pieces, chopped" },
      { "name": "Green olives (optional)", "quantity": 50, "unit": "g, chopped" },
      { "name": "Fresh parsley (optional)", "quantity": 1, "unit": "tbsp, chopped" }
    ],
    "steps": [
      // Pastry
      "Mix flour and salt in a large bowl.",
      "Rub in the cold butter or lard with your fingers until the mixture resembles breadcrumbs.",
      "Add warm water a little at a time, mixing until a dough forms.",
      "Knead for about 5 minutes until smooth. Cover and let rest for 30 minutes.",
      "Roll out dough to 2–3mm thick and cut into 12cm circles. Keep covered until ready to fill.",
      // Filling
      "Heat olive oil in a pan over medium heat.",
      "Add onion and red pepper, cook until softened (5–7 minutes).",
      "Add garlic, cook for 1 minute.",
      "Add ground beef, break up and cook until browned.",
      "Stir in paprika, cumin, chili flakes, salt, and pepper. Cook 2–3 minutes.",
      "Remove from heat and let cool slightly.",
      "Mix in chopped boiled eggs, olives, and parsley if using.",
      // Assembly
      "Place a spoonful of filling in the center of each dough circle. Fold over and seal the edges.",
      "Place on a baking tray, brush with beaten egg if desired.",
      "Bake at 200°C (392°F) for 18–22 minutes until golden.",
      "Serve warm."
    ]
  },
// ...existing code...
,
{
  "id": 35,
  "meal": ["dinner"],
  "isCheat": true,
  "recipe": "Steak and Chips",
  "defaultServings": 2,
  "ingredients": [
    { "name": "Ribeye or sirloin steak", "quantity": 2, "unit": "pieces (200-250g each)" },
    { "name": "Potatoes", "quantity": 600, "unit": "g" },
    { "name": "Vegetable oil", "quantity": 500, "unit": "ml (for frying)" },
    { "name": "Salt", "quantity": 1, "unit": "tsp" },
    { "name": "Black pepper", "quantity": 0.5, "unit": "tsp" },
    { "name": "Butter", "quantity": 20, "unit": "g" },
    { "name": "Garlic", "quantity": 2, "unit": "cloves" },
    { "name": "Fresh thyme or rosemary", "quantity": 2, "unit": "sprigs (optional)" },
    { "name": "Pearl onions", "quantity": 8, "unit": "pieces" },
    // Pepper sauce
    { "name": "Double cream", "quantity": 100, "unit": "ml" },
    { "name": "Rum", "quantity": 1, "unit": "tbsp" },
    { "name": "Black peppercorns, crushed", "quantity": 1, "unit": "tsp" }
  ],
  "steps": [
    "Peel and cut the potatoes into chips (fries).",
    "Fry the chips in hot oil at 180°C (356°F) until golden and crispy. Drain and season with salt.",
    "Blanch the pearl onions in boiling water for 2 minutes, then peel. Sauté in a little butter until golden and tender. Set aside.",
    "Pat steaks dry and season both sides with salt and black pepper.",
    "Heat a heavy pan over high heat. Add a little oil, then the steaks. Sear for 2–3 minutes per side for medium-rare, or to your liking.",
    "During the last minute, add butter, garlic, and herbs to the pan. Spoon the melted butter over the steaks.",
    "Rest the steaks for 5 minutes before serving.",
    "For the pepper sauce: In the same pan used for the steaks, add crushed black peppercorns and rum. Let the alcohol cook off for 30 seconds. Add double cream and simmer for 2–3 minutes, scraping up any pan juices, until slightly thickened. Season with salt to taste.",
    "Serve the steaks hot with the chips, sautéed pearl onions, and drizzle with pepper sauce."
  ]
},
{
  "id": 36,
  "meal": ["dinner"],
  "recipe": "Satay Chicken",
  "defaultServings": 2,
  "ingredients": [
    { "name": "Chicken breast", "quantity": 240, "unit": "g" },
    { "name": "Green bell pepper", "quantity": 1, "unit": "piece" },
    { "name": "Red bell pepper", "quantity": 1, "unit": "piece" },
    { "name": "Onion", "quantity": 1, "unit": "piece" },
    { "name": "Pak choi", "quantity": 300, "unit": "g" },
    { "name": "Celery", "quantity": 2, "unit": "pieces" },
    { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
    { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
    { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
    { "name": "Peanutbutter", "quantity": 2, "unit": "tbsp" },
    { "name": "Coconut Milk", "quantity": 100, "unit": "ml" },
    { "name": "Worcestershire sauce", "quantity": 0.5, "unit": "tbsp" },
    { "name": "Garlic", "quantity": 1, "unit": "clove" },
    { "name": "Corn flour", "quantity": 1, "unit": "tsp" },
    { "name": "Water (for slurry)", "quantity": 1, "unit": "tbsp" },
    { "name": "Lime Juice", "quantity": 0.5, "unit": "tsp" },
    { "name": "Ground Cumin", "quantity": 0.25, "unit": "tsp" }
  ],
  "steps": [
    "Chop the chicken breast and vegetables (peppers, onion, celery, pak choi).",
    "In the morning or the night before, toss the sliced chicken, peppers, onion, celery, and pak choi with olive oil and salt. Cover and refrigerate to marinate.",
    "Heat a large pan or wok over medium-high heat.",
    "Add the marinated chicken and vegetables to the pan and stir-fry for about 5-7 minutes until the chicken is mostly cooked.",
    "Stir in the peanut butter and mix well to coat the chicken and vegetables.",
    "Add the soy sauce, coconut milk, Worcestershire sauce, minced garlic, lime juice, and ground cumin. Stir everything together and let simmer for a few minutes.",
    "In a small bowl, mix the corn flour with 1 tablespoon of water to create a slurry.",
    "Pour the slurry into the pan, stirring constantly, and cook for another 1-2 minutes until the sauce thickens.",
    "Serve hot. Optionally, garnish with lime or chopped peanuts."
  ]
}, {
    "id": 0,
    "meal": ["breakfast", "lunch", "dinner", "snacks"],
    "recipe": "Skip",
    "defaultServings": 2,
    "ingredients": [],
    "steps": []
  }








];
