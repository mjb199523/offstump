const { z } = require("zod");

const userInputSchema = z.object({
    name: z.string().optional().default(""),
    phone: z.string().min(1, "Phone number is required"),
    age: z.coerce
        .number()
        .int()
        .min(5, "Age must be at least 5")
        .max(100, "Age must be at most 100"),
    gender: z.enum(["Male", "Female", "Other"]),
    heightCm: z.coerce
        .number()
        .min(80, "Height must be at least 80 cm")
        .max(250, "Height must be at most 250 cm"),
    weightKg: z.coerce
        .number()
        .min(20, "Weight must be at least 20 kg")
        .max(350, "Weight must be at most 350 kg"),
    activityLevel: z.enum(["Sedentary", "Light", "Moderate", "Very active"]),
    goal: z.enum(["Lose weight", "Maintain", "Gain muscle"]),
    dietPreference: z.enum(["Veg", "Non-veg", "Eggetarian", "Vegan"]),
    allergies: z.string().optional().default(""),
    medicalNotes: z.string().optional().default(""),
});

const calorieTargetSchema = z.object({
    dailyCalories: z.number(),
    proteinG: z.number(),
    carbsG: z.number(),
    fatG: z.number(),
});

const dietChartSchema = z.object({
    breakfast: z.string(),
    midMorning: z.string(),
    lunch: z.string(),
    eveningSnack: z.string(),
    dinner: z.string(),
});

const planResponseSchema = z.object({
    bmi: z.number(),
    category: z.string(),
    bodyFatPercent: z.number().nullable().optional(),
    bodyFatCategory: z.string().nullable().optional(),
    summary: z.string(),
    calorieTarget: calorieTargetSchema,
    dietChart: dietChartSchema,
    weeklyTips: z.array(z.string()),
    disclaimers: z.array(z.string()),
});

const pdfRequestSchema = z.object({
    userInput: userInputSchema,
    plan: planResponseSchema,
});

module.exports = {
    userInputSchema,
    calorieTargetSchema,
    dietChartSchema,
    planResponseSchema,
    pdfRequestSchema
};
