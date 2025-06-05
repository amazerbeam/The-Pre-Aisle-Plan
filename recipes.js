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
      { "name": "Cinnamon", "quantity": 1, "unit": "pinch" }
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
      { "name": "Eggs", "quantity": 6, "unit": "small" },
      { "name": "Butter", "quantity": 1, "unit": "tsp" },
      { "name": "Salt", "quantity": 1, "unit": "pinch" },
      { "name": "Pepper", "quantity": 1, "unit": "pinch" }
    ],
    "steps": [
      "Whisk eggs with salt and pepper.",
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
	  "Season the chicken breast with salt and pepper (optional), then grill or pan-fry until fully cooked. Let it rest and slice into strips.",
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
    "id": 4,
    "meal": ["lunch"],
    "recipe": "Tuna Wrap",
	"defaultServings": 2,
    "ingredients": [
      { "name": "Whole grain wrap", "quantity": 1, "unit": "piece" },
      { "name": "Tuna", "quantity": 100, "unit": "g" },
      { "name": "Lettuce", "quantity": 1, "unit": "handful" },
      { "name": "Tomato", "quantity": 1, "unit": "piece" },
      { "name": "Yogurt", "quantity": 2, "unit": "tbsp" }
    ],
    "steps": [
      "Mix tuna with yogurt.",
      "Layer wrap with lettuce, tomato, and tuna mix.",
      "Roll and serve."
    ]
  },
  {
    "id": 5,
    "meal": ["dinner"],
    "recipe": "Baked Salmon with Veggies",
	"defaultServings": 2,
    "ingredients": [
      { "name": "Salmon fillet", "quantity": 2, "unit": "pieces" },
      { "name": "Broccoli", "quantity": 1, "unit": "head" },
      { "name": "Carrots", "quantity": 2, "unit": "pieces" },
      { "name": "Olive oil", "quantity": 1, "unit": "tbsp" },
      { "name": "Garlic", "quantity": 2, "unit": "cloves" }
    ],
    "steps": [
      "Preheat oven to 180°C.",
      "Place salmon and veggies on tray.",
      "Drizzle with oil and minced garlic.",
      "Bake for 20 minutes and serve."
    ]
  },
  {
    "id": 6,
    "meal": ["dinner"],
    "recipe": "Stir-Fried Chicken & Peppers",
	"defaultServings": 2,
    "ingredients": [
      { "name": "Chicken breast", "quantity": 200, "unit": "g" },
      { "name": "Bell peppers", "quantity": 2, "unit": "pieces" },
      { "name": "Soy sauce", "quantity": 1, "unit": "tbsp" },
      { "name": "Ginger", "quantity": 1, "unit": "tsp" },
      { "name": "Garlic", "quantity": 1, "unit": "clove" }
    ],
    "steps": [
      "Slice chicken and peppers.",
      "Stir-fry garlic and ginger.",
      "Add chicken, cook thoroughly.",
      "Add peppers and soy sauce, cook for 5 minutes."
    ]
  },{
  "id": 9,
  "meal": ["lunch", "dinner"],
  "recipe": "Tofu Stir-Fry with Peppers, Onion & Mushrooms",
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
},{
  "id": 10,
  "meal": ["breakfast"],
  "recipe": "Pancakes and Bacon",
  "defaultServings": 2,
  "ingredients": [
    { "name": "Plain flour", "quantity": 100, "unit": "g" },
    { "name": "Eggs", "quantity": 2, "unit": "medium" },
    { "name": "Milk", "quantity": 300, "unit": "ml" },
    { "name": "Salt", "quantity": 1, "unit": "pinch" },
    { "name": "Butter", "quantity": 10, "unit": "g" },
    { "name": "Streaky bacon", "quantity": 12, "unit": "slices" },
    { "name": "Maple syrup", "quantity": 2, "unit": "tbsp" }
  ],
  "steps": [
    "Whisk flour and salt in a bowl.",
    "Crack in the eggs and add the milk. Whisk until smooth and lump-free.",
    "Heat a non-stick pan and melt a little butter.",
    "Pour in batter to form pancakes; cook until golden on one side, then flip.",
    "Fry bacon separately until crispy.",
    "Serve pancakes stacked with 6 slices of bacon per serving.",
    "Drizzle with maple syrup and enjoy warm."
  ]
},{
  "id": 11,
  "meal": "snacks",
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
},{
  "id": 12,
  "meal": "snacks",
  "recipe": "Cottage Cheese and Pineapple",
  "defaultServings": 2,
  "ingredients": [
    { "name": "Cottage cheese", "quantity": 200, "unit": "g" },
    { "name": "Pineapple chunks", "quantity": 100, "unit": "g" }
  ],
  "steps": [
    "Portion 100g of cottage cheese into two bowls.",
    "Top each with 50g of pineapple chunks.",
    "Serve chilled."
  ]
}




];
