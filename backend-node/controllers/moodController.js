import { Mood } from "../models/Mood.js";
import axios from 'axios';
const createMood = async (req, res) => {
    const { entry_text, department } = req.body;
    const userId = req.user.id;

    try {
        // Daily Limit Check: Count entries from today for this user
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayEntriesCount = await Mood.countDocuments({
            user_id: userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (todayEntriesCount >= 5) {
            return res.status(429).json({ 
                message: "Daily limit reached. You can only submit 5 entries per day to ensure mindful reflection." 
            });
        }

        // Normalize the AI_ENGINE_URL to prevent double slashes
        const aiBaseUrl = process.env.AI_ENGINE_URL.replace(/\/+$/, '');
        
        // Calling the AI server 
        let ai_response;
        try {
            ai_response = await axios.post(`${aiBaseUrl}/analyze`, { text: entry_text });
        } catch (aiErr) {
            const status = aiErr.response?.status || 500;
            const detail = aiErr.response?.data?.detail || aiErr.message;
            
            if (status === 503) {
                return res.status(503).json({ message: "The AI is currently busy due to high demand. Please try again in a few seconds." });
            }
            throw new Error(`AI Engine Error (${status}): ${detail}`);
        }
        
        const aiData = ai_response.data.message;
        const aiData_parsing = JSON.parse(aiData);
        
        // Creating the new entry
        const employee_feedback = aiData_parsing["Employee_Response"];
        const newEntry = new Mood({ 
            entry_text, 
            sentiment_score: aiData_parsing["Sentiment_Score"], 
            category_tags: aiData_parsing["Category_Tags"], 
            urgency_level: aiData_parsing["Urgency_Level"], 
            reasoning: aiData_parsing["Reasoning"], 
            department: department, 
            org_id: req.user.org_id, 
            user_id: userId 
        });

        await newEntry.save();
        return res.status(201).json({ message: "Mood Saved.", data: newEntry, feedback: employee_feedback });

    } catch (error) {
        console.error("Mood Creation Error:", error.message);
        return res.status(error.status || 400).json({ 
            message: error.message || "An unexpected error occurred. Please try again." 
        });
    }
};
export default createMood;