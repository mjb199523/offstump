function calculateBmi(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
}

function getBmiCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

function getBmiColor(category) {
    switch (category) {
        case "Underweight":
            return "#60a5fa"; // blue
        case "Normal":
            return "#34d399"; // green
        case "Overweight":
            return "#fbbf24"; // amber
        case "Obese":
            return "#f87171"; // red
    }
}

function getBmiExplanation(bmi, category) {
    const rounded = bmi.toFixed(1);

    if (category === "Underweight") {
        return `Your BMI is ${rounded}, which falls in the Underweight range. This may indicate insufficient nutrition. Consider consulting a healthcare provider or registered dietitian.`;
    }
    if (category === "Normal") {
        return `Your BMI is ${rounded}, which is within the Normal range. This generally indicates a healthy body weight relative to your height. Keep up your healthy habits!`;
    }
    if (category === "Overweight") {
        return `Your BMI is ${rounded}, which falls in the Overweight range. Small, consistent lifestyle changes in diet and exercise can help. A healthcare provider can offer personalized guidance.`;
    }
    return `Your BMI is ${rounded}, which falls in the Obese range. It is strongly recommended to consult a qualified doctor or dietitian for a personalized health and nutrition plan.`;
}

function getBmiGaugePercent(bmi) {
    const min = 10;
    const max = 45;
    const bounded = Math.min(Math.max(bmi, min), max);
    return ((bounded - min) / (max - min)) * 100;
}

function calculateBodyFatPercent(bmi, age, gender) {
    if (gender !== "Male" && gender !== "Female") return null;
    let bf = 0;
    if (gender === "Male") {
        bf = (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
        bf = (1.20 * bmi) + (0.23 * age) - 5.4;
    }
    return Math.min(Math.max(bf, 2), 75);
}

function getBodyFatCategory(bfPercent, gender) {
    if (gender === "Male") {
        if (bfPercent < 6) return "Essential";
        if (bfPercent < 14) return "Athletes";
        if (bfPercent < 18) return "Fitness";
        if (bfPercent < 25) return "Average";
        return "High";
    } else if (gender === "Female") {
        if (bfPercent < 14) return "Essential";
        if (bfPercent < 21) return "Athletes";
        if (bfPercent < 25) return "Fitness";
        if (bfPercent < 32) return "Average";
        return "High";
    }
    return "Unknown";
}

module.exports = {
    calculateBmi,
    getBmiCategory,
    getBmiColor,
    getBmiExplanation,
    getBmiGaugePercent,
    calculateBodyFatPercent,
    getBodyFatCategory
};
