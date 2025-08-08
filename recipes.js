const recipeData = [
  {
    "id": 1,
    "meal": ["breakfast"],
    "recipe": "Overnight Oats",
    "defaultServings": 2,
    "calories": 880,
    "ingredients": [
      { "name": "Rolled oats", "quantity": 40, "unit": "g" },
      { "name": "Greek yogurt", "quantity": 100, "unit": "g" },
      { "name": "Milk", "quantity": 200, "unit": "ml" },
      { "name": "Berries", "quantity": 100, "unit": "g" },
      { "name": "Chia seeds", "quantity": 2, "unit": "tsp" },
      { "name": "Honey", "quantity": 0.5, "unit": "tsp" },
      { "name": "Peanut butter", "quantity": 1, "unit": "tbsp" },
      { "name": "Banana", "quantity": 1, "unit": "medium" },
      { "name": "Cinnamon", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
      "Combine oats, yogurt, milk, chia seeds, and peanut butter.",
      "Mix well and refrigerate overnight.",
      "In the morning, stir and top with berries, banana slices, honey, and cinnamon."
    ]
  }, {
    "id": 2,
    "meal": ["breakfast"],
    "recipe": "Scrambled Eggs with Spinach & Avocado",
    "defaultServings": 2,
    "calories": 734,
    "ingredients": [
      { "name": "Eggs", "quantity": 8, "unit": "small" },
      { "name": "Butter", "quantity": 1, "unit": "tsp" },
      { "name": "Spinach", "quantity": 60, "unit": "g" },
      { "name": "Avocado", "quantity": 1, "unit": "medium" }
    ],
    "steps": [
      "Slice or mash avocado and set aside.",
      "Sauté spinach in a non-stick pan until wilted. Remove and plate.",
      "Whisk eggs with salt to taste.",
      "Heat butter in a pan, add eggs, and stir continuously until softly scrambled.",
      "Serve eggs with spinach and avocado on the side."
    ]
  },
  {
    "id": 3,
    "meal": ["lunch"],
    "recipe": "Grilled Chicken Salad with Avocado, Chickpeas & Feta",
    "defaultServings": 2,
    "calories": 1210,
    "ingredients": [
      { "name": "Chicken breast", "quantity": 240, "unit": "g" },
      { "name": "Salad leaves", "quantity": 2, "unit": "handfuls" },
      { "name": "Cucumber", "quantity": 1, "unit": "piece" },
      { "name": "Cherry tomatoes", "quantity": 10, "unit": "pieces" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Lemon", "quantity": 1, "unit": "piece" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Avocado", "quantity": 1, "unit": "medium" },
      { "name": "Chickpeas", "quantity": 150, "unit": "g" },
      { "name": "Feta cheese", "quantity": 40, "unit": "g" }
    ],
    "steps": [
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
    "id": 4,
    "meal": ["dinner"],
    "recipe": "Baked Salmon with Avocado & Nut Salad",
    "defaultServings": 2,
    "calories": 1200,
    "ingredients": [
      { "name": "Salmon fillet", "quantity": 2, "unit": "pieces (~150g each)" },
      { "name": "Broccoli", "quantity": 1, "unit": "head" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Salad leaves", "quantity": 2, "unit": "handfuls" },
      { "name": "Lemon", "quantity": 1, "unit": "piece" },
      { "name": "Olive oil", "quantity": 3, "unit": "tbsp" },
      { "name": "Avocado", "quantity": 1, "unit": "medium" },
      { "name": "Almonds", "quantity": 30, "unit": "g" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" }
    ],
    "steps": [
      "Preheat oven to 180°C.",
      "Cut broccoli into florets and toss with 1 tbsp olive oil and salt.",
      "Spread broccoli on a baking tray and roast for 10 minutes.",
      "Add salmon fillets in the center, drizzle with olive oil and season.",
      "Bake for another 20 minutes until salmon is cooked and broccoli tender.",
      "Spiralize carrots and toss with salad leaves, avocado (sliced), and chopped almonds.",
      "Make a dressing with lemon juice and 1 tbsp olive oil, and toss with salad.",
      "Serve the baked salmon with roasted broccoli and the avocado-nut salad."
    ]
  }
  ,
  {
    "id": 5,
    "meal": ["dinner"],
    "recipe": "Stir-Fried Chicken & Peppers with Tofu & Nuts",
    "defaultServings": 2,
    "calories": 1180,
    "ingredients": [
      { "name": "Chicken breast", "quantity": 240, "unit": "g" },
      { "name": "Green bell pepper", "quantity": 1, "unit": "piece" },
      { "name": "Red bell pepper", "quantity": 1, "unit": "piece" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Pak choi", "quantity": 300, "unit": "g" },
      { "name": "Celery", "quantity": 2, "unit": "pieces" },
      { "name": "Mushrooms", "quantity": 100, "unit": "g" },
      { "name": "Firm tofu", "quantity": 100, "unit": "g" },
      { "name": "Eggs", "quantity": 2, "unit": "small" },
      { "name": "Cashews", "quantity": 30, "unit": "g" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Worcestershire sauce", "quantity": 0.5, "unit": "tbsp" },
      { "name": "Ginger", "quantity": 1, "unit": "tsp" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Corn flour", "quantity": 1, "unit": "tsp" },
      { "name": "Sesame seeds", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" }
    ],
    "steps": [
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
    "id": 6,
    "meal": ["dinner"],
    "recipe": "Spicy Tofu Stir-Fry with Mushrooms & Nuts",
    "defaultServings": 2,
    "calories": 1180,
    "ingredients": [
      { "name": "Firm tofu", "quantity": 400, "unit": "g" },
      { "name": "Olive oil", "quantity": 3, "unit": "tbsp" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Red pepper", "quantity": 1, "unit": "piece" },
      { "name": "White onion", "quantity": 1, "unit": "piece" },
      { "name": "Mushrooms", "quantity": 150, "unit": "g" },
      { "name": "Soy sauce", "quantity": 2, "unit": "tbsp" },
      { "name": "Smoked paprika", "quantity": 0.5, "unit": "tsp" },
      { "name": "Chili flakes", "quantity": 0.5, "unit": "tsp" },
      { "name": "Cashews", "quantity": 30, "unit": "g" }
    ],
    "steps": [
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
    "id": 7,
    "meal": ["breakfast"],
    "recipe": "Pancakes and Bacon",
    "isCheat": true,
    "defaultServings": 2,
    "calories": 900,
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
    "id": 8,
    "meal": ["snacks"],
    "recipe": "Apple, Almonds & Greek Yogurt",
    "defaultServings": 2,
    "calories": 450,
    "ingredients": [
      { "name": "Apple", "quantity": 2, "unit": "medium" },
      { "name": "Almonds", "quantity": 30, "unit": "g" },
      { "name": "Greek yogurt", "quantity": 150, "unit": "g" }
    ],
    "steps": [
      "Slice each apple into wedges or bite-sized pieces.",
      "Portion the almonds into two servings (15g each).",
      "Spoon 75g of Greek yogurt into a bowl per person.",
      "Serve one apple, 15g almonds, and 75g yogurt per person."
    ]
  }, {
    "id": 9,
    "meal": ["snacks"],
    "recipe": "Pineapple, Cashew & Yogurt Bowl",
    "defaultServings": 2,
    "calories": 540,
    "ingredients": [
      { "name": "Pineapple chunks", "quantity": 150, "unit": "g" },
      { "name": "Cashews", "quantity": 30, "unit": "g" },
      { "name": "Greek yogurt", "quantity": 150, "unit": "g" },
      { "name": "Chia seeds", "quantity": 2, "unit": "tsp" }
    ],
    "steps": [
      "Divide pineapple chunks into two bowls (75g each).",
      "Add 15g of cashews to each bowl.",
      "Spoon 75g of Greek yogurt into each bowl.",
      "Top each with 1 tsp of chia seeds.",
      "Serve chilled."
    ]
  }
  , {
    "id": 10,
    "meal": ["breakfast"],
    "recipe": "Banana Chia Pudding with Peanut Butter & Berries",
    "defaultServings": 2,
    "calories": 660,
    "ingredients": [
      { "name": "Chia seeds", "quantity": 4, "unit": "tbsp" },
      { "name": "Whole milk", "quantity": 160, "unit": "ml" },
      { "name": "Banana", "quantity": 1, "unit": "piece" },
      { "name": "Honey", "quantity": 1, "unit": "tsp" },
      { "name": "Vanilla extract", "quantity": 0.5, "unit": "tsp" },
      { "name": "Peanut butter", "quantity": 2, "unit": "tbsp" },
      { "name": "Greek yogurt", "quantity": 150, "unit": "g" },
      { "name": "Berries", "quantity": 100, "unit": "g" }
    ],
    "steps": [
      "Mash the banana in a bowl or jar.",
      "Add milk, chia seeds, honey, and vanilla. Mix well.",
      "Let sit for 5 minutes, then stir again to break up clumps.",
      "Cover and refrigerate for at least 2 hours or overnight.",
      "In the morning, stir in peanut butter and Greek yogurt.",
      "Top with fresh berries before serving."
    ]
  }
  ,
  {
    "id": 11,
    "meal": "lunch",
    "recipe": "Tuna & Egg Patties",
    "defaultServings": 2,
    "calories": 1380,
    "ingredients": [
      { "name": "Tuna", "quantity": 220, "unit": "g" },
      { "name": "Eggs", "quantity": 8, "unit": "small" },
      { "name": "Salt", "quantity": 0.25, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Onion powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Butter", "quantity": 4, "unit": "tsp" }
    ],
    "steps": [
      "Whisk the eggs in a bowl and mix in the drained tuna.",
      "Season with salt, pepper, and onion powder.",
      "Heat 2 tsp of butter in a non-stick pan over medium heat.",
      "Scoop and flatten patties into the pan, fry 2–3 mins per side until golden.",
      "Serve hot, optionally brushing with remaining melted butter if desired."
    ]
  }

  , {
    "id": 12,
    "meal": ["lunch"],
    "recipe": "Crispy Spiced Chicken Wings",
    "defaultServings": 2,
    "isCheat": true,
    "calories": 1100,
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
    "id": 13,
    "meal": "dinner",
    isCheat: "true",
    "recipe": "Crispy Chicken Wings with Fries ",
    "defaultServings": 2,
    "calories": 1800,
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
    "id": 14,
    "meal": ["lunch"],
    "recipe": "Turkey Lettuce Cups with Feta & Nut Salad",
    "defaultServings": 2,
    "calories": 1280,
    "ingredients": [
      { "name": "Turkey mince", "quantity": 400, "unit": "g" },
      { "name": "Lettuce leaves", "quantity": 8, "unit": "pieces" },
      { "name": "Bell peppers", "quantity": 2, "unit": "pieces" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Olive oil", "quantity": 3, "unit": "tbsp" },
      { "name": "Salt", "quantity": 0.25, "unit": "tsp" },
      { "name": "Pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Cucumber", "quantity": 0.5, "unit": "piece" },
      { "name": "Cherry tomatoes", "quantity": 6, "unit": "pieces" },
      { "name": "Red onion", "quantity": 0.25, "unit": "piece" },
      { "name": "Feta cheese", "quantity": 40, "unit": "g" },
      { "name": "Almonds (chopped)", "quantity": 20, "unit": "g" },
      { "name": "Lemon juice", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
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
  }
  ,
  {
    "id": 15,
    "meal": ["snacks"],
    "recipe": "Peach Yogurt Bowl with Almonds & Coconut",
    "defaultServings": 2,
    "calories": 520,
    "ingredients": [
      { "name": "Peach", "quantity": 1, "unit": "medium" },
      { "name": "Greek yogurt", "quantity": 150, "unit": "g" },
      { "name": "Honey", "quantity": 2, "unit": "tsp" },
      { "name": "Chia seeds", "quantity": 2, "unit": "tsp" },
      { "name": "Cinnamon", "quantity": 0.25, "unit": "tsp" },
      { "name": "Almonds", "quantity": 15, "unit": "g" },
      { "name": "Coconut flakes", "quantity": 5, "unit": "g" },
      { "name": "Almond butter", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
      "Wash and slice the peach into thin wedges.",
      "Divide the yogurt into two bowls.",
      "Top each bowl with peach slices.",
      "Drizzle 1 tsp honey over each serving.",
      "Sprinkle chia seeds, cinnamon, chopped almonds, and coconut flakes.",
      "Add 0.5 tbsp almond butter to each bowl.",
      "Serve immediately or chill briefly before serving."
    ]
  }
  ,
  {
    "id": 16,
    "meal": ["snacks"],
    "recipe": "Olive Oil Crackers with Pesto",
    "defaultServings": 2,
    "isCheat": true,
    "calories": 340,
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
    "id": 17,
    "meal": ["dinner"],
    "recipe": "Breaded Chicken with Garlic Veggies & Avocado",
    "defaultServings": 2,
    "calories": 1195,
    "ingredients": [
      { "name": "Chicken breasts", "quantity": 340, "unit": "g" },
      { "name": "Breadcrumbs", "quantity": 0.25, "unit": "cup" },
      { "name": "Garlic powder", "quantity": 1, "unit": "tsp" },
      { "name": "Onion powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Paprika", "quantity": 0.5, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.75, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Broccoli", "quantity": 1, "unit": "head" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Avocado", "quantity": 1, "unit": "medium" },
      { "name": "Cashews or almonds", "quantity": 20, "unit": "g" },
      { "name": "Sesame seeds", "quantity": 1, "unit": "tsp" }
    ],
    "steps": [
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
  }
  ,
  {
    "id": 18,
    "isCheat": true,
    "meal": ["dinner"],
    "recipe": "Chorizo Pizza",
    "defaultServings": 2,
    "calories": 1800,
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
  }, {
    "id": 19,
    "meal": ["dinner"],
    "recipe": "Turkey Stuffed Peppers with Roasted Sweet Potato & Nuts",
    "defaultServings": 2,
    "calories": 1020,
    "ingredients": [
      { "name": "Bell peppers", "quantity": 2, "unit": "pieces" },
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Tomato paste", "quantity": 1, "unit": "tbsp" },
      { "name": "Paprika", "quantity": 0.5, "unit": "tsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 2.5, "unit": "tbsp" },
      { "name": "Sweet potato", "quantity": 400, "unit": "g" },
      { "name": "Almonds or cashews (chopped)", "quantity": 20, "unit": "g" }
    ],
    "steps": [
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
    "id": 20,
    "meal": ["dinner"],
    "recipe": "Chickpea & Tofu Curry",
    "defaultServings": 2,
    "calories": 1340,
    "ingredients": [
      { "name": "Chickpeas (cooked or canned)", "quantity": 240, "unit": "g" },
      { "name": "Firm tofu", "quantity": 150, "unit": "g" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Red pepper", "quantity": 1, "unit": "piece" },
      { "name": "Tinned tomatoes", "quantity": 1, "unit": "tin" },
      { "name": "Curry powder", "quantity": 2, "unit": "tbsp" },
      { "name": "Olive oil", "quantity": 2.5, "unit": "tbsp" },
      { "name": "Sweet potato", "quantity": 400, "unit": "g" },
      { "name": "Cashews", "quantity": 20, "unit": "g" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Stock", "quantity": 1, "unit": "cup" },

      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
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
    "id": 21,
    "meal": ["dinner"],
    "recipe": "Turkey Bolognese",
    "defaultServings": 2,
    "calories": 1240,
    "ingredients": [
      { "name": "Zucchini", "quantity": 2, "unit": "medium" },
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Tinned tomatoes", "quantity": 1, "unit": "tin" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" },
      { "name": "Olive oil", "quantity": 1.5, "unit": "tbsp" },
      { "name": "Onion", "quantity": 1, "unit": "medium" },
      { "name": "Green olives", "quantity": 40, "unit": "g" },
      { "name": "Italian seasoning", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Pesto or Capers", "quantity": 1, "unit": "tbsp" },
      { "name": "Basil (optional garnish)", "quantity": 1, "unit": "tbsp" },
      { "name": "Sweet potato", "quantity": 300, "unit": "g" },
      { "name": "Parmesan cheese (grated)", "quantity": 30, "unit": "g" }
    ],
    "steps": [
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
    "id": 22,
    "meal": ["dinner"],
    "recipe": "Cashew Carbonara",
    "defaultServings": 2,
    "calories": 1260,
    "ingredients": [
      { "name": "Zucchini", "quantity": 2, "unit": "medium" },
      { "name": "Turkey mince", "quantity": 200, "unit": "g" },
      { "name": "Ground almonds", "quantity": 1, "unit": "tbsp" },
      { "name": "Cashew nuts", "quantity": 60, "unit": "g" },
      { "name": "Milk", "quantity": 100, "unit": "ml" },
      { "name": "Egg", "quantity": 1, "unit": "medium" },
      { "name": "Parmesan cheese", "quantity": 30, "unit": "g" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Olive oil", "quantity": 2, "unit": "tsp" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Wholemeal bread", "quantity": 2, "unit": "slices (40g each)" },
      { "name": "Chives or scallions (garnish)", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
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
    "id": 23,
    "meal": ["snacks"],
    "recipe": "Celery and Hummus",
    "defaultServings": 2,
    "calories": 500,
    "ingredients": [
      { "name": "Celery sticks", "quantity": 8, "unit": "pieces" },
      { "name": "Hummus", "quantity": 6, "unit": "tbsp" },
      { "name": "Walnuts (optional)", "quantity": 15, "unit": "g" }
    ],
    "steps": [
      "Wash and cut celery into sticks (about 4 pieces per serving).",
      "Portion 3 tbsp of hummus into a small bowl for each person.",
      "Serve celery with hummus for dipping.",
      "Top each serving with a few chopped walnuts (optional) for extra calories and healthy fats."
    ]
  },
  {
    "id": 24,
    "meal": ["breakfast"],
    "recipe": "Arepa with Chicken, Egg & Avocado",
    "defaultServings": 2,
    "calories": 715,
    "ingredients": [
      { "name": "Harina PAN", "quantity": 60, "unit": "g" },
      { "name": "Rolled oats", "quantity": 60, "unit": "g" },
      { "name": "Water", "quantity": 140, "unit": "ml" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Eggs", "quantity": 2, "unit": "small" },
      { "name": "Avocado", "quantity": 1, "unit": "piece" },
      { "name": "Chicken breast", "quantity": 100, "unit": "g" }
    ],
    "steps": [
      "Grind the oats slightly if needed to make them finer.",
      "Mix Harina PAN, oats, water, and salt to form a soft dough. Let it rest for 5 minutes.",
      "Shape into small flat patties.",
      "Heat olive oil in a pan over medium heat and cook arepas for 4–5 minutes per side until golden and cooked through.",
      "Boil or shred cooked chicken breast if not already prepared.",
      "Fry or scramble the eggs.",
      "Slice the avocado.",
      "Split arepas and fill each with chicken, egg, and avocado. Serve warm."
    ]
  }
  ,
  {
    "id": 25,
    "meal": ["dinner"],
    "recipe": "Tuscan Turkey Meatballs",
    "defaultServings": 2,
    "calories": 1584,
    "ingredients": [
      { "name": "Turkey mince", "quantity": 300, "unit": "g" },
      { "name": "Brown lentils", "quantity": 1, "unit": "tin" },
      { "name": "Tinned tomatoes", "quantity": 1, "unit": "tin" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 3, "unit": "cloves" },
      { "name": "Celery", "quantity": 2, "unit": "sticks" },
      { "name": "Carrot", "quantity": 1, "unit": "piece" },
      { "name": "Spinach", "quantity": 60, "unit": "g" },
      { "name": "Fresh basil (leaves or granules)", "quantity": 1, "unit": "tbsp" },
      { "name": "Capers", "quantity": 1, "unit": "tbsp" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Sugar", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Italian seasoning herbs", "quantity": 1, "unit": "tsp" },
      { "name": "Stock", "quantity": 1, "unit": "cup" },
      { "name": "Sweet potato", "quantity": 300, "unit": "g" }
    ],
    "steps": [
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
  }
  ,

  {
    "id": 26,
    "meal": ["snacks"],
    "isCheat": true,
    "recipe": "Olive Oil & Himalayan Pink Salt Crisps",
    "defaultServings": 2,
    "calories": 700,
    "ingredients": [
      { "name": "Crisps", "quantity": 135, "unit": "g" },
    ],
    "steps": [
      "Divide and eat the crisps as a snack.",
    ]
  },
  {
    "id": 27,
    "meal": ["lunch"],
    "isCheat": true,
    "recipe": "Argentine Beef Empanada Bites",
    "defaultServings": 2,
    "calories": 900,
    "ingredients": [
      { "name": "Plain flour", "quantity": 300, "unit": "g" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Butter or lard (cold, cubed)", "quantity": 75, "unit": "g" },
      { "name": "Warm water", "quantity": 120, "unit": "ml" },
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
      "Mix flour and salt in a large bowl.",
      "Rub in the cold butter or lard with your fingers until the mixture resembles breadcrumbs.",
      "Add warm water a little at a time, mixing until a dough forms.",
      "Knead for about 5 minutes until smooth. Cover and let rest for 30 minutes.",
      "Roll out dough to 2–3mm thick and cut into 12cm circles. Keep covered until ready to fill.",
      "Heat olive oil in a pan over medium heat.",
      "Add onion and red pepper, cook until softened (5–7 minutes).",
      "Add garlic, cook for 1 minute.",
      "Add ground beef, break up and cook until browned.",
      "Stir in paprika, cumin, chili flakes, salt, and pepper. Cook 2–3 minutes.",
      "Remove from heat and let cool slightly.",
      "Mix in chopped boiled eggs, olives, and parsley if using.",
      "Place a spoonful of filling in the center of each dough circle. Fold over and seal the edges.",
      "Place on a baking tray, brush with beaten egg if desired.",
      "Bake at 200°C (392°F) for 18–22 minutes until golden.",
      "Serve warm."
    ]
  },

  {
    "id": 28,
    "meal": ["dinner"],
    "isCheat": true,
    "recipe": "Steak and Chips",
    "defaultServings": 2,
    "calories": 1600,
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
    "id": 29,
    "meal": ["dinner"],
    "recipe": "Satay Chicken",
    "defaultServings": 2,
    "calories": 1140,
    "ingredients": [
      { "name": "Chicken breast", "quantity": 350, "unit": "g" },
      { "name": "Green bell pepper", "quantity": 1, "unit": "piece" },
      { "name": "Red bell pepper", "quantity": 1, "unit": "piece" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Pak choi", "quantity": 300, "unit": "g" },
      { "name": "Celery", "quantity": 2, "unit": "pieces" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Peanut butter", "quantity": 3.5, "unit": "tbsp" },
      { "name": "Coconut water", "quantity": 100, "unit": "ml" },
      { "name": "Worcestershire sauce", "quantity": 0.5, "unit": "tbsp" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Corn flour", "quantity": 1, "unit": "tsp" },
      { "name": "Water (for slurry)", "quantity": 1, "unit": "tbsp" },
      { "name": "Lime Juice", "quantity": 0.5, "unit": "tsp" },
      { "name": "Ground Cumin", "quantity": 0.25, "unit": "tsp" }
    ],
    "steps": [
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
  }
  ,
  {
    "id": 30,
    "meal": ["lunch"],
    "recipe": "Lentils with Pak Choi",
    "defaultServings": 4,
    "calories": 700,
    "ingredients": [
      { "name": "Brown lentils", "quantity": 1, "unit": "tin" },
      { "name": "Onion", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 3, "unit": "cloves" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Celery", "quantity": 2, "unit": "sticks" },
      { "name": "Tinned tomatoes", "quantity": 1, "unit": "tin" },
      { "name": "Pak choi", "quantity": 300, "unit": "g" },
      { "name": "Bay leaf", "quantity": 1, "unit": "piece" },
      { "name": "Broth", "quantity": 1500, "unit": "ml" },
      { "name": "Ground paprika", "quantity": 1, "unit": "tsp" },
      { "name": "Ground cumin", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Pepper", "quantity": 1, "unit": "to taste" },
      { "name": "Capers (optional)", "quantity": 2, "unit": "tbsp" },
      { "name": "Red bell pepper (optional)", "quantity": 1, "unit": "piece" }
    ],
    "steps": [
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
    "id": 31,
    "meal": ["breakfast"],
    "isCheat": true,
    "recipe": "Hash Browns & Bacon Sandwich",
    "defaultServings": 2,
    "calories": 1843,
    "ingredients": [
      { "name": "Streaky bacon", "quantity": 12, "unit": "slices" },
      { "name": "Bread", "quantity": 4, "unit": "slices" },
      { "name": "Potatoes", "quantity": 500, "unit": "g" },
      { "name": "Onion", "quantity": 70, "unit": "g" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Butter", "quantity": 20, "unit": "g" }
    ],
    "steps": [
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
    "id": 32,
    "meal": ["snacks"],
    "isCheat": true,
    "recipe": "Toast and Butter",
    "defaultServings": 2,
    "calories": 470,
    "ingredients": [
      { "name": "Bread", "quantity": 4, "unit": "slices" },
      { "name": "Butter", "quantity": 20, "unit": "g" }
    ],
    "steps": [
      "Toast the bread slices.",
      "Spread butter on each slice.",
      "Serve warm."
    ]
  },

  {
    "id": 33,
    "meal": ["lunch"],
    "isCheat": true,
    "recipe": "Cheese & Bacon Arancini",
    "calories": 974,

    "defaultServings": 2,
    "ingredients": [
      { "name": "Risotto rice", "quantity": 300, "unit": "g" },
      { "name": "Stock", "quantity": 700, "unit": "ml" },
      { "name": "Onion", "quantity": 1, "unit": "small" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Bacon", "quantity": 100, "unit": "g" },
      { "name": "Mozzarella", "quantity": 100, "unit": "g" },
      { "name": "Parmesan", "quantity": 40, "unit": "g" },
      { "name": "Egg", "quantity": 1, "unit": "piece" },
      { "name": "Breadcrumbs", "quantity": 80, "unit": "g" },
      { "name": "Breadcrumbs", "quantity": 40, "unit": "g (for coating)" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Pepper", "quantity": 0.25, "unit": "tsp" },
    ],
    "steps": [
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
    "id": 34,
    "meal": ["lunch"],
    "isCheat": true,
    "recipe": "Airport Burrito",
    "defaultServings": 4,
    "calories": 1266,
    "ingredients": [
      { "name": "Beef roast (chuck or topside)", "quantity": 1000, "unit": "g" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.5, "unit": "tsp" },
      { "name": "Oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Onion", "quantity": 2, "unit": "medium" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" },
      { "name": "Cumin", "quantity": 1, "unit": "tsp" },
      { "name": "Smoked paprika", "quantity": 1, "unit": "tsp" },
      { "name": "Beef stock", "quantity": 500, "unit": "ml" },
      { "name": "Butter", "quantity": 2, "unit": "tbsp" },
      { "name": "Plain flour", "quantity": 2, "unit": "tbsp" },
      { "name": "Worcestershire sauce", "quantity": 1, "unit": "tsp" },
      { "name": "Frank’s Hot Sauce", "quantity": 2, "unit": "tsp" },
      { "name": "Uncooked rice", "quantity": 0.33, "unit": "cups" },
      { "name": "Avocados", "quantity": 2, "unit": "pieces" },
      { "name": "Halloumi", "quantity": 200, "unit": "g" },
      { "name": "Jalapeños", "quantity": 4, "unit": "tbsp (sliced)" },
      { "name": "Flour tortillas", "quantity": 4, "unit": "large" },
      { "name": "Mozzarella", "quantity": 100, "unit": "g" },
      { "name": "Parmesan", "quantity": 40, "unit": "g" },
    ],
    "steps": [
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
    "id": 35,
    "meal": ["lunch"],
    "recipe": "Irish Turkey Stew with Sweet Potatoes & Wholemeal Bread",
    "defaultServings": 2,
    "calories": 1200,
    "ingredients": [
      { "name": "Turkey breast", "quantity": 300, "unit": "g" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Onion", "quantity": 1, "unit": "medium" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" },
      { "name": "Turnip", "quantity": 1, "unit": "small" },
      { "name": "Carrots", "quantity": 2, "unit": "medium" },
      { "name": "Celery", "quantity": 2, "unit": "stalks" },
      { "name": "Mushrooms", "quantity": 150, "unit": "g" },
      { "name": "Sweet potatoes", "quantity": 200, "unit": "g" },
      { "name": "Tomato paste", "quantity": 1, "unit": "tbsp" },
      { "name": "Thyme (dried)", "quantity": 1, "unit": "tsp" },
      { "name": "Rosemary (dried)", "quantity": 1, "unit": "tsp" },
      { "name": "Bay leaf", "quantity": 1, "unit": "leaf" },
      { "name": "Chicken stock (low-sodium)", "quantity": 500, "unit": "ml" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Parsley (fresh, optional garnish)", "quantity": 1, "unit": "tbsp" },
      { "name": "Wholemeal bread", "quantity": 2, "unit": "slices" }
    ],
    "steps": [
      "Pat the turkey dry and cut into 2–3 cm cubes. Season with salt and pepper.",
      "Heat 1 tbsp olive oil in a pot over medium-high heat. Sear turkey cubes until browned, then set aside.",
      "Lower heat to medium. Add remaining olive oil, then sauté onion, garlic, and celery for 3–4 minutes.",
      "Add mushrooms and cook until browned, about 5 minutes.",
      "Stir in tomato paste, thyme, rosemary, and bay leaf. Cook for 1 minute.",
      "Add the turkey back to the pot along with diced turnip, sweet potatoes, and chopped carrots.",
      "Pour in the stock and bring to a boil. Reduce heat and simmer covered for 25–30 minutes until tender.",
      "Discard bay leaf, adjust seasoning, and garnish with parsley.",
      "Serve hot with a slice of wholemeal bread on the side."
    ]
  }
  ,

  {
    "id": 36,
    "meal": ["breakfast"],
    "recipe": "Almond Flour Pancakes",
    "defaultServings": 2,
    "calories": 880,
    "ingredients": [
      { "name": "Almond flour", "quantity": 60, "unit": "g" },
      { "name": "Eggs", "quantity": 2, "unit": "small" },
      { "name": "Milk (or plant milk)", "quantity": 60, "unit": "ml" },
      { "name": "Baking powder", "quantity": 0.5, "unit": "tsp" },
      { "name": "Vanilla extract", "quantity": 0.5, "unit": "tsp" },
      { "name": "Olive oil or butter (for cooking)", "quantity": 1, "unit": "tsp" },
      { "name": "Mixed berries", "quantity": 60, "unit": "g" },
      { "name": "Honey (optional)", "quantity": 1, "unit": "tsp" },
      { "name": "Greek yogurt", "quantity": 100, "unit": "g" },
      { "name": "Banana", "quantity": 1, "unit": "small" }
    ],
    "steps": [
      "In a bowl, whisk eggs, milk, and vanilla extract.",
      "Add almond flour and baking powder. Mix until a smooth batter forms.",
      "Heat a non-stick pan over medium heat and lightly grease with oil or butter.",
      "Pour small portions of batter to form 4–6 mini pancakes.",
      "Cook for 2–3 minutes until bubbles form, then flip and cook another 1–2 minutes.",
      "Serve warm with berries, sliced banana, a dollop of Greek yogurt, and a drizzle of honey if desired."
    ]
  }
  ,
  {
    "id": 37,
    "meal": ["breakfast"],
    "recipe": "Warm Oat Porridge with Berries & Nuts",
    "defaultServings": 2,
    "calories": 880,
    "ingredients": [
      { "name": "Rolled oats", "quantity": 60, "unit": "g" },
      { "name": "Milk", "quantity": 250, "unit": "ml" },
      { "name": "Water", "quantity": 150, "unit": "ml" },
      { "name": "Mixed berries", "quantity": 80, "unit": "g" },
      { "name": "Honey", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 1, "unit": "pinch" },
      { "name": "Peanut butter", "quantity": 1, "unit": "tbsp" },
      { "name": "Almonds", "quantity": 10, "unit": "g" },
      { "name": "Walnuts", "quantity": 10, "unit": "g" },


    ],
    "steps": [
      "In a small saucepan, combine oats, milk, water & salt.",
      "Bring to a gentle simmer over medium heat, stirring regularly.",
      "Simmer for 5 minutes until thick and creamy.",
      "Stir in peanut butter, and cook for 1 more minute.",
      "Divide into bowls and top with  peanut butter, berries, chopped nuts, and a drizzle of honey.",
      "Serve warm."
    ]
  }
  ,
  {
    "id": 38,
    "meal": ["lunch"],
    "recipe": "Fish Cakes with Leafy Salad & Sweet Potato",
    "defaultServings": 2,
    "calories": 1220,
    "ingredients": [
      { "name": "White fish (cod, haddock, or pollock)", "quantity": 250, "unit": "g" },
      { "name": "Egg", "quantity": 1, "unit": "piece" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" },
      { "name": "Spring onion or red onion", "quantity": 1, "unit": "small" },
      { "name": "Parsley (fresh)", "quantity": 1, "unit": "tbsp" },
      { "name": "Lemon zest", "quantity": 0.5, "unit": "tsp" },
      { "name": "Almond flour", "quantity": 2, "unit": "tbsp" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Salt", "quantity": 0.5, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.25, "unit": "tsp" },
      { "name": "Sweet potato", "quantity": 300, "unit": "g" },
      { "name": "Mixed salad leaves", "quantity": 2, "unit": "handfuls" },
      { "name": "Cucumber", "quantity": 0.5, "unit": "piece" },
      { "name": "Cherry tomatoes", "quantity": 6, "unit": "pieces" },
      { "name": "Lemon juice", "quantity": 1, "unit": "tbsp" }
    ],
    "steps": [
      "Peel and cube the sweet potato. Roast in the oven at 200°C for 25–30 minutes with a bit of olive oil and salt.",
      "Poach the fish in simmering water for 5–6 minutes or until cooked through. Drain and cool.",
      "Flake the fish into a bowl. Add finely chopped onion, garlic, parsley, lemon zest, almond flour, and beaten egg.",
      "Season with salt and pepper. Mix well and form into 4 small fish cakes.",
      "Chill for 10–15 minutes if time allows to help them hold shape.",
      "Heat 1 tbsp olive oil in a non-stick pan over medium heat. Fry fish cakes for 3–4 minutes per side until golden and heated through.",
      "Meanwhile, prepare the salad: toss mixed leaves with sliced cucumber and halved cherry tomatoes. Dress with lemon juice and 1 tbsp olive oil.",
      "Serve 2 fish cakes per person alongside the salad and roasted sweet potato."
    ]
  }  ,

  {
  "id": 39,
  "meal": ["dinner"],
  "recipe": "Chicken & Pork Paella",
  "defaultServings": 4,
  "calories": 1200,
  "ingredients": [
    { "name": "Olive oil", "quantity": 50, "unit": "ml" },
    { "name": "Chicken", "quantity": 8, "unit": "pieces" },
    { "name": "Pork belly", "quantity": 150, "unit": "g" },
    { "name": "Chorizo", "quantity": 50, "unit": "g" },
    { "name": "Red pepper", "quantity": 1, "unit": "piece" },
    { "name": "Green pepper", "quantity": 1, "unit": "piece" },
    { "name": "Flat beans", "quantity": 50, "unit": "g" },
    { "name": "Butter beans", "quantity": 1, "unit": "tin" },
    { "name": "Garlic", "quantity": 2, "unit": "cloves" },
    { "name": "Paprika", "quantity": 1, "unit": "tsp" },
    { "name": "Turmeric", "quantity": 0.5, "unit": "tsp" },
    { "name": "Tomato sauce", "quantity": 400, "unit": "g" },
    { "name": "Paella rice", "quantity": 400, "unit": "g" },
    { "name": "Water", "quantity": 900, "unit": "ml" },
    { "name": "Rosemary sprig", "quantity": 1, "unit": "piece" },
    { "name": "Salt", "quantity": 1, "unit": "to taste" }
  ],
  "steps": [
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
}
,
  {
    "id": 0,
    "meal": ["breakfast", "lunch", "dinner", "snacks"],
    "recipe": "Skip",
    "defaultServings": 2,
    "ingredients": [],
    "calories": 0,

    "steps": []
  }

];
