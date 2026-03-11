import { Mood } from "../models/Mood.js";
import axios from 'axios';
const createMood = async (req, res) => {
    // here we are getting the data from the requst body
    const { entry_text, department } = req.body
    try {
        // calling the ai server 
        const ai_response = await axios.post(`${process.env.AI_ENGINE_URL}/analyze`, { text: entry_text })
        
        // const aiData = JSON.parse(ai_response.data.message)
        const aiData = ai_response.data.message;

        const aiData_parsing = JSON.parse(aiData)
        // creating the new entry in the database
        const employee_feedback = aiData_parsing["Employee_Response"]
        const newEntry = new Mood({ entry_text, sentiment_score: aiData_parsing["Sentiment_Score"], category_tags: aiData_parsing["Category_Tags"], urgency_level: aiData_parsing["Urgency_Level"], reasoning: aiData_parsing["Reasoning"], department: department, org_id: req.user.org_id, user_id: req.user.id })
        // saving the new entry in the database
        await newEntry.save()
        // sending the response to the client
        return res.status(201).json({ message: "Mood Saved.", data: newEntry, feedback: employee_feedback })
    } catch (error) {
        // sending the error response to the client
        console.error("Error in createMood:", error.response?.data || error.message);
        const errorMessage = error.response ? "AI Engine Error: " + (error.response.data?.detail || error.message) : "AI analysis Failed or Database Error. Please try again later";
        return res.status(400).json({ message: errorMessage, error: error.message })
    }
}
export default createMood;