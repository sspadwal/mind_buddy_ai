// importing the moodSchema.
import { Mood } from "../models/Mood.js"

// creating the moodHistory controller
const moodHistory = async (req, res) => {
    let moods = [];
    try {
        const role = req.user.role;
        if (role === "admin") {
            moods = await Mood.find({ 
                org_id: req.user.org_id,
                department: req.user.department 
            })
        }
        else if (role === "employee") {
            moods = await Mood.find({ user_id: req.user.id })
        }
        else {
            return res.status(403).json({ message: "Access Denied: Role not recognized" })
        }
        // finding all the Moods.
        // const mood = await Mood.find()
        // returning the response to the client with proper fetching the data from database.
        return res.status(200).json({ message: moods })
    }
    catch (error) {
        // returning the error to the user if not find out the data.
        return res.status(400).json({ message: error.message })
    }
}

export default moodHistory;