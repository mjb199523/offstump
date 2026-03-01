const nodemailer = require("nodemailer");

async function sendNotificationEmail(userInput, plan) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials not configured. Skipping email notification.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "offstump26@gmail.com",
            subject: `New BMI Report Generated: ${userInput.name || "User"}`,
            text: `
A new user has just generated a BMI and Diet Report!

--- User Details ---
Name: ${userInput.name || "N/A"}
Phone: ${userInput.phone || "N/A"}
Age: ${userInput.age}
Gender: ${userInput.gender}
Height: ${userInput.heightCm} cm
Weight: ${userInput.weightKg} kg
Activity Level: ${userInput.activityLevel}
Goal: ${userInput.goal}
Diet Preference: ${userInput.dietPreference}
Allergies: ${userInput.allergies || "None"}
Medical Notes: ${userInput.medicalNotes || "None"}

--- BMI & Report Summary ---
BMI: ${plan.bmi} (${plan.category})
Body Fat %: ${plan.bodyFatPercent != null ? plan.bodyFatPercent + "% (" + plan.bodyFatCategory + ")" : "N/A"}

Summary text:
${plan.summary}

Daily Calories: ${plan.calorieTarget.dailyCalories} kcal
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Notification email sent successfully");
    } catch (error) {
        console.error("Failed to send notification email", error);
    }
}

module.exports = { sendNotificationEmail };
