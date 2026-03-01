const { calculateBmi, getBmiCategory, calculateBodyFatPercent, getBodyFatCategory } = require("./bmi");

/* ═══════════════════════════════════════════════════════════════
   Rule-Based Personalized Plan Generator
   No API key required — runs 100% locally.
   Uses Mifflin-St Jeor for calorie estimation and curated
   Indian-friendly meal plans.
   ═══════════════════════════════════════════════════════════════ */

// ── Calorie estimation (Mifflin-St Jeor) ──────────────────────

function estimateBMR(weightKg, heightCm, age, gender) {
    if (gender === "Female") {
        return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    // Male / Other
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

function activityMultiplier(level) {
    switch (level) {
        case "Sedentary":
            return 1.2;
        case "Light":
            return 1.375;
        case "Moderate":
            return 1.55;
        case "Very active":
            return 1.725;
        default:
            return 1.4;
    }
}

function goalAdjustment(goal) {
    switch (goal) {
        case "Lose weight":
            return -400;
        case "Gain muscle":
            return 350;
        default:
            return 0;
    }
}

function computeCalorieTarget(weightKg, heightCm, age, gender, activity, goal) {
    const bmr = estimateBMR(weightKg, heightCm, age, gender);
    const tdee = bmr * activityMultiplier(activity);
    const dailyCalories = Math.round(tdee + goalAdjustment(goal));

    // Macros split depends on goal
    let proteinRatio, fatRatio, carbRatio;

    if (goal === "Gain muscle") {
        proteinRatio = 0.3;
        fatRatio = 0.25;
        carbRatio = 0.45;
    } else if (goal === "Lose weight") {
        proteinRatio = 0.35;
        fatRatio = 0.3;
        carbRatio = 0.35;
    } else {
        proteinRatio = 0.25;
        fatRatio = 0.28;
        carbRatio = 0.47;
    }

    return {
        dailyCalories: Math.max(dailyCalories, 1200),
        proteinG: Math.round((dailyCalories * proteinRatio) / 4),
        carbsG: Math.round((dailyCalories * carbRatio) / 4),
        fatG: Math.round((dailyCalories * fatRatio) / 9),
    };
}

const MEAL_PLANS = {
    "Non-veg": {
        "Lose weight": [
            {
                breakfast: "2 boiled egg whites + 1 whole egg omelette with onion & tomato, 1 multigrain toast, green tea (approx 250 kcal)",
                midMorning: "1 small apple or a handful of roasted chana (100 kcal)",
                lunch: "1 small bowl brown rice (100g cooked) + grilled chicken breast (120g) + cucumber raita (1 small bowl) + mixed vegetable sabzi (150 kcal)",
                eveningSnack: "1 cup buttermilk (chaas) with roasted cumin + 5 almonds (90 kcal)",
                dinner: "Grilled fish (150g) or chicken tikka (120g) + sautéed broccoli & bell peppers + 1 small multigrain roti (350 kcal)",
            },
            {
                breakfast: "Moong dal cheela (2 small) with mint chutney + 1 boiled egg, black coffee or green tea (280 kcal)",
                midMorning: "1 guava or 1 small orange + 4 walnuts (110 kcal)",
                lunch: "Quinoa or brown rice pulao (1 bowl) + chicken curry (100g lean, less oil) + salad with lemon dressing (400 kcal)",
                eveningSnack: "Sprouts chaat with onion, tomato, lemon (1 small bowl, 100 kcal)",
                dinner: "Tandoori chicken (2 pieces, skinless) + sautéed greens (palak/methi) + 1 roti (320 kcal)",
            },
        ],
        Maintain: [
            {
                breakfast: "2 whole egg omelette with vegetables + 2 multigrain toast with butter + 1 glass milk or tea (380 kcal)",
                midMorning: "1 banana + a handful of mixed nuts (almonds, cashews - 15g) (180 kcal)",
                lunch: "2 chapati + chicken curry (150g) + dal tadka (1 bowl) + salad + rice (1 small bowl) (550 kcal)",
                eveningSnack: "1 cup chai + 2 whole wheat biscuits or 1 small samosa (baked) (150 kcal)",
                dinner: "Fish curry or egg curry (2 eggs) + 2 roti + vegetable raita + mix veg sabzi (480 kcal)",
            },
        ],
        "Gain muscle": [
            {
                breakfast: "3 whole eggs scrambled with cheese & veggies + 2 multigrain bread with peanut butter + 1 glass milk + 1 banana (550 kcal)",
                midMorning: "Protein shake (milk + banana + 1 tbsp peanut butter + oats) or 1 large bowl of curd with muesli (300 kcal)",
                lunch: "2 chapati + brown rice (1 bowl) + chicken breast (180g) grilled or curry + paneer bhurji (50g) + dal (500-600 kcal)",
                eveningSnack: "2 boiled eggs + 1 sweet potato (medium) + handful of roasted peanuts (280 kcal)",
                dinner: "Grilled chicken (150g) or fish (200g) + 2 roti + palak dal + curd (1 bowl) (500 kcal)",
            },
        ],
    },
    Veg: {
        "Lose weight": [
            {
                breakfast: "1 bowl poha with peanuts & vegetables (150g) + green tea + 5 almonds (250 kcal)",
                midMorning: "1 small apple or papaya (1 cup) (80 kcal)",
                lunch: "1 multigrain roti + palak paneer (80g paneer, low oil) + brown rice (small bowl) + salad with lemon (400 kcal)",
                eveningSnack: "1 cup buttermilk + roasted makhana (1 small bowl, 90 kcal)",
                dinner: "Vegetable soup (1 big bowl) + 1 roti + lauki/tori sabzi + dal (1 small bowl) (300 kcal)",
            },
            {
                breakfast: "Besan cheela (2, made with less oil) with green chutney + 1 cup tea/coffee with low-fat milk (230 kcal)",
                midMorning: "1 guava + 4 walnut halves (100 kcal)",
                lunch: "Rajma (1 bowl) + 1 roti + cucumber-tomato salad + rice (half bowl) (420 kcal)",
                eveningSnack: "Sprouts salad with onion, coriander, lemon (120 kcal)",
                dinner: "Mixed veg curry + 1 multigrain roti + moong dal (small bowl) + curd (small bowl) (330 kcal)",
            },
        ],
        Maintain: [
            {
                breakfast: "2 paratha (aloo/gobi, less oil) + curd (1 bowl) + 1 glass lassi or tea (400 kcal)",
                midMorning: "1 banana + handful of mixed nuts (180 kcal)",
                lunch: "2 roti + rice (1 bowl) + paneer curry (100g) or chole + dal + salad + raita (600 kcal)",
                eveningSnack: "Tea/coffee + 2 multigrain biscuits or 1 bowl of fruit chaat (160 kcal)",
                dinner: "2 roti + seasonal sabzi + dal tadka + salad (450 kcal)",
            },
        ],
        "Gain muscle": [
            {
                breakfast: "2 paneer paratha + curd (1 bowl) + 1 glass milk with turmeric + 1 banana (550 kcal)",
                midMorning: "Peanut butter toast (2 slices whole wheat) + 1 glass soy milk or regular milk (350 kcal)",
                lunch: "2 roti + rice (1 bowl) + rajma/chole (1.5 bowls) + paneer curry (100g) + salad (650 kcal)",
                eveningSnack: "Makhana (1 big bowl roasted in ghee) + 1 sweet potato + mixed nuts (300 kcal)",
                dinner: "2 roti + dal makhni (1 bowl) + palak paneer (100g) + curd + salad (550 kcal)",
            },
        ],
    },
    Eggetarian: {
        "Lose weight": [
            {
                breakfast: "2 egg white omelette with veggies + 1 multigrain toast + green tea (220 kcal)",
                midMorning: "1 small apple or a handful of roasted chana (90 kcal)",
                lunch: "1 roti + egg curry (2 eggs, less oil) + brown rice (small bowl) + salad (400 kcal)",
                eveningSnack: "Buttermilk (1 glass) + roasted makhana (small bowl, 90 kcal)",
                dinner: "Moong dal (1 bowl) + 1 roti + sauteed vegetables + 1 boiled egg (320 kcal)",
            },
        ],
        Maintain: [
            {
                breakfast: "2 egg omelette with onion & tomato + 2 paratha (less oil) + curd + tea (420 kcal)",
                midMorning: "1 banana + 5 almonds + 3 walnuts (170 kcal)",
                lunch: "2 roti + rice (1 bowl) + egg curry (2 eggs) + dal + salad + raita (550 kcal)",
                eveningSnack: "Fruit chaat (1 bowl) or tea + 2 biscuits (150 kcal)",
                dinner: "Paneer bhurji (80g) or 1 egg bhurji + 2 roti + mix veg + curd (450 kcal)",
            },
        ],
        "Gain muscle": [
            {
                breakfast: "3 whole eggs scrambled + 2 multigrain toast with butter + 1 glass milk + 1 banana (520 kcal)",
                midMorning: "Peanut butter banana smoothie with milk (1 glass, 300 kcal)",
                lunch: "2 roti + rice (1 bowl) + egg curry (3 eggs) + paneer curry (80g) + dal + salad (650 kcal)",
                eveningSnack: "2 boiled eggs + sweet potato (medium) + handful of peanuts (280 kcal)",
                dinner: "Paneer tikka (120g) + 2 roti + dal makhni + curd + salad (550 kcal)",
            },
        ],
    },
    Vegan: {
        "Lose weight": [
            {
                breakfast: "Vegetable oats porridge (1 bowl, made with water) + 5 almonds + green tea (220 kcal)",
                midMorning: "1 small apple or 1 cup papaya (80 kcal)",
                lunch: "1 roti + rajma (1 bowl) + brown rice (small bowl) + salad with lemon (380 kcal)",
                eveningSnack: "Sprouts chaat with onion, tomato, lemon (110 kcal)",
                dinner: "Tofu stir-fry (100g) + 1 roti + moong dal + mixed salad (320 kcal)",
            },
        ],
        Maintain: [
            {
                breakfast: "2 roti with peanut butter + soy milk (1 glass) + 1 banana + 5 almonds (420 kcal)",
                midMorning: "Fruit salad (1 bowl) with flaxseeds + coconut water (160 kcal)",
                lunch: "2 roti + rice (1 bowl) + chole/rajma (1.5 bowls) + tofu curry (80g) + salad (580 kcal)",
                eveningSnack: "Roasted makhana (1 bowl) + 1 cup herbal tea + mixed nuts (180 kcal)",
                dinner: "2 roti + dal tadka (1 bowl) + seasonal sabzi + salad (430 kcal)",
            },
        ],
        "Gain muscle": [
            {
                breakfast: "Soy milk smoothie (banana + peanut butter + oats + soy milk) + 2 multigrain toast + mixed nuts (550 kcal)",
                midMorning: "Trail mix (peanuts, raisins, seeds - 40g) + 1 banana (300 kcal)",
                lunch: "2 roti + rice (1 bowl) + tofu curry (150g) + rajma/chole (1.5 bowls) + salad (650 kcal)",
                eveningSnack: "Soy chaap grilled (100g) + 1 sweet potato + peanuts (300 kcal)",
                dinner: "2 roti + dal makhni (1 bowl, coconut cream) + tofu bhurji (100g) + salad (520 kcal)",
            },
        ],
    },
};

const TIPS = {
    "Lose weight": [
        "Drink at least 8-10 glasses of water daily; start your morning with warm water and lemon.",
        "Avoid sugary drinks, packaged juices, and fried snacks. Opt for whole fruits instead.",
        "Walk for at least 30-40 minutes daily; even post-meal walks of 10 minutes help digestion.",
        "Do not skip meals — especially breakfast. Skipping meals leads to overeating later.",
        "Use smaller plates to naturally control portion sizes.",
        "Aim for 7-8 hours of quality sleep every night — poor sleep increases hunger hormones.",
        "Include fibre-rich foods (oats, salad, dal, whole grains) to stay full longer.",
        "Reduce salt and sugar intake gradually rather than cutting everything at once.",
    ],
    Maintain: [
        "Stay hydrated: aim for 2.5-3 litres of water per day.",
        "Maintain a consistent meal schedule — try to eat at roughly the same times each day.",
        "Include a balanced mix of protein, carbs, and fats in every meal.",
        "Engage in moderate exercise (walking, yoga, cycling) at least 4-5 days per week.",
        "Limit processed foods; cook at home as much as possible.",
        "Monitor your weight weekly — small corrections are easier than big ones.",
        "Practice mindful eating: chew slowly, avoid distractions during meals.",
        "Get 7-8 hours of sleep and manage stress through meditation or hobbies.",
    ],
    "Gain muscle": [
        "Increase protein intake: include a protein source in every meal and snack.",
        "Drink at least 3 litres of water daily, more on workout days.",
        "Do strength training (weight lifting, resistance exercises) 4-5 days per week with progressive overload.",
        "Eat a protein-rich snack within 30-60 minutes after your workout.",
        "Don't skip carbs — they fuel your workouts and recovery. Choose complex carbs like oats, brown rice, sweet potato.",
        "Get 7-9 hours of sleep — muscle recovery and growth happen primarily during sleep.",
        "Track your food intake for the first few weeks to ensure you're in a calorie surplus.",
        "Include healthy fats from nuts, seeds, avocado, and ghee for hormonal balance.",
    ],
};

function generateSummary(bmi, category, goal, activityLevel, gender, age) {
    const bmiStr = bmi.toFixed(1);
    let base = `Based on your profile (${gender}, age ${age}, activity level: ${activityLevel}), your BMI is ${bmiStr} which is categorised as "${category}". `;

    if (category === "Underweight") {
        base += "Being underweight may affect your energy levels and immune function. Focus on nutrient-dense meals with adequate protein and healthy fats. ";
        if (bmi < 16) {
            base += "⚠️ Your BMI is very low. It is STRONGLY recommended to consult a doctor or registered dietitian before making any dietary changes. ";
        }
    } else if (category === "Normal") {
        base += "Your weight is in a healthy range — great job! The plan below helps you stay on track. ";
    } else if (category === "Overweight") {
        base += "Being overweight increases the risk of metabolic issues. Consistent lifestyle changes in diet and physical activity can help. ";
    } else {
        base += "A BMI in the Obese range requires attention. Sustainable dietary changes and regular exercise are key. ";
        if (bmi >= 35) {
            base += "⚠️ Your BMI is significantly high. It is STRONGLY recommended to consult a qualified doctor or dietitian for a medically supervised plan. ";
        }
    }

    if (goal === "Lose weight") {
        base += "Your goal is to lose weight, so the plan below creates a moderate calorie deficit while ensuring adequate nutrition.";
    } else if (goal === "Gain muscle") {
        base += "Your goal is to gain muscle, so the plan provides a calorie surplus with higher protein to support muscle growth alongside resistance training.";
    } else {
        base += "Your goal is to maintain your current weight, so the plan is balanced to match your daily energy expenditure.";
    }

    return base;
}

function generateDisclaimers(bmi) {
    const disclaimers = [
        "This report is generated algorithmically and is for informational purposes only. It is NOT a substitute for professional medical, nutritional, or fitness advice.",
        "Always consult a licensed healthcare provider, registered dietitian, or certified fitness professional before making significant changes to your diet or exercise routine.",
        "Individual nutritional needs vary. Calorie and macro targets are estimates based on standard formulas and may not account for all health conditions.",
        "If you experience any adverse effects (dizziness, fatigue, unusual hunger), discontinue the plan and seek medical advice.",
    ];

    if (bmi < 16 || bmi >= 35) {
        disclaimers.unshift("⚠️ IMPORTANT: Your BMI indicates a potentially serious health concern. Please consult a qualified doctor or dietitian BEFORE following any diet plan.");
    }

    return disclaimers;
}

function generatePlan(input) {
    const bmi = calculateBmi(input.weightKg, input.heightCm);
    const bmiRounded = Math.round(bmi * 10) / 10;
    const category = getBmiCategory(bmi);

    const bfPercent = calculateBodyFatPercent(bmiRounded, input.age, input.gender);
    const bfPercentRounded = bfPercent !== null ? Math.round(bfPercent * 10) / 10 : null;
    const bfCategory = bfPercentRounded !== null ? getBodyFatCategory(bfPercentRounded, input.gender) : null;

    const calorieTarget = computeCalorieTarget(
        input.weightKg,
        input.heightCm,
        input.age,
        input.gender,
        input.activityLevel,
        input.goal
    );

    const pref = input.dietPreference;
    const goal = input.goal;
    const options = MEAL_PLANS[pref]?.[goal] ?? MEAL_PLANS["Veg"]["Maintain"];
    const dietChart = options[Math.floor(Math.random() * options.length)];

    const allergyNote = input.allergies && input.allergies.trim().length > 0
        ? ` (Note: avoid ${input.allergies}; substitute with a suitable alternative)`
        : "";

    const adjustedChart = {
        breakfast: dietChart.breakfast + allergyNote,
        midMorning: dietChart.midMorning + allergyNote,
        lunch: dietChart.lunch + allergyNote,
        eveningSnack: dietChart.eveningSnack + allergyNote,
        dinner: dietChart.dinner + allergyNote,
    };

    const summary = generateSummary(
        bmiRounded,
        category,
        input.goal,
        input.activityLevel,
        input.gender,
        input.age
    );

    const weeklyTips = TIPS[goal] || TIPS["Maintain"];
    const disclaimers = generateDisclaimers(bmiRounded);

    return {
        bmi: bmiRounded,
        category,
        bodyFatPercent: bfPercentRounded,
        bodyFatCategory: bfCategory,
        summary,
        calorieTarget,
        dietChart: adjustedChart,
        weeklyTips,
        disclaimers,
    };
}

module.exports = { generatePlan };
