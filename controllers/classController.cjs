const Class = require("../models/classModel.cjs");

//Fills in drop down with class options
exports.getClassIds = async (req, res) => {
    try{
        const yogaClass = await Class.find({});
        res.json(yogaClass);
    }
    catch(e){
        res.status(400).json({error: e.message});
    }
};

exports.getClass = async (req, res) => {
    try{
        const classId = req.query.classId;
        const classDetail = await Class.findOne({classId: classId});

        res.json(classDetail);
    }
    catch (e){
        res.status(400).json({error: e.message});
    }
};

exports.add = async (req, res) => {
    try {
        const data = req.body;
        let classId = data.classId?.trim();

        //Checking if classId exists if it does update existing record
        if (classId) {

            const existing = await Class.findOne({ classId });

            if (existing) {

                // Update main fields
                existing.className = data.className;
                existing.instructorId = data.instructorId;
                existing.classType = data.classType;
                existing.description = data.description;

                const incoming = data.daytime?.[0];

                //Checking if daytime object exists 
                if (incoming) {

                    if (incoming._id && incoming._id !== "") {
                        const subDoc = existing.daytime.id(incoming._id);

                        if (subDoc) {
                            subDoc.day = incoming.day;
                            subDoc.time = incoming.time;
                            subDoc.duration = incoming.duration;
                        }
                    } else {
                        // Remove bad _id if present
                        delete incoming._id;
                
                        existing.daytime.push(incoming);
                    }
                }
                }

                await existing.save();

                return res.json({message: "Class updated",classId});
            }
        
        //Generating a new classId if making a new class 
        const lastClass = await Class.findOne().sort({ classId: -1 });

        let newId = "A001";

        if (lastClass) {
            const lastNumber = parseInt(lastClass.classId.substring(1), 10);
            newId = "A" + (lastNumber + 1).toString().padStart(3, "0");
        }

        const newClass = new Class({
            classId: newId,
            className: data.className,
            instructorId: data.instructorId,
            classType: data.classType,
            description: data.description,
            daytime: data.daytime || []
        });

        await newClass.save();

        res.status(201).json({message: "Class created",classId: newId});

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteClass = async(req,res) => {
    try{
        const {classId} = req.query;
        const result = await Class.findOneAndDelete({classId});
        if(!result){
            return res.status(404).json({error: "Class not found"});
        }
        res.json({message: "Class deleted", classId});
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
};