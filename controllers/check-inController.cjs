const CheckIn = require("../models/check-inModel.cjs");

exports.add = async (req, res) => {
    try {
        const data = req.body;

        // Find the last check-in to generate the next ID
        const lastCheckIn = await CheckIn.findOne().sort({ checkinId: -1 });

        let newId = 1;
        if (lastCheckIn) {
            newId = lastCheckIn.checkinId + 1;
        }

        const newCheckIn = new CheckIn({
            checkinId: newId,
            customerId: data.customerId,
            classId: data.classId, 
            datetime: data.datetime
        });

        await newCheckIn.save();

        // Send back the customerId and classId so the frontend alert can use them!
        res.status(201).json({ 
            message: "Check in successful",
            customerId: newCheckIn.customerId,
            classId: newCheckIn.classId
        });
        
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};