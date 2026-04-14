const Instructor = require("../models/instructorModel.cjs");

exports.search = async (req, res) => {
  try {
    const searchString = req.query.firstname;
    const instructor = await Instructor.find({
      firstname: { $regex: searchString, $options: "i" },
    });

    if (!instructor || instructor.length == 0) {
      return res.status(404).json({ message: "No instructor found" });
    } else {
      res.json(instructor[0]);
    }
  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

//Find the package selected in the dropdown
exports.getInstructor = async (req, res) => {
  try {
    const instructorId = req.query.instructorId;
    const instructorDetail = await Instructor.findOne({ instructorId: instructorId });

    res.json(instructorDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const data = req.body;
    let instructorId = data.instructorId?.trim();

    // Check if we are attempting an UPDATE
    if (instructorId) {
      const existing = await Instructor.findOne({ instructorId });

      if (existing) {
        // Update the existing document fields
        existing.firstname = data.firstname;
        existing.lastname = data.lastname;
        existing.email = data.email;
        existing.phone = data.phone;
        existing.address = data.address;
        existing.preferredContact = data.preferredContact;

        await existing.save();
        return res.json({ message: "Instructor updated", instructorId });
      } 
    }

    // Logic for NEW Instructor
    const lastInstructor = await Instructor.findOne().sort({ instructorId: -1 });
    let newId = "I001";

    if (lastInstructor) {
      const lastNumber = parseInt(lastInstructor.instructorId.substring(1), 10);
      newId = "I" + (lastNumber + 1).toString().padStart(3, "0");
    }

    const newInstructor = new Instructor({
      instructorId: newId,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      phone: data.phone,
      address: data.address,
      preferredContact: data.preferredContact
    });

    await newInstructor.save();
    res.status(201).json({ message: "Instructor created", instructorId: newId });

  } catch (err) {
    console.error("Error in add/update:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//Populate the instructorId dropdown
exports.getInstructorIds = async (req, res) => {
  try {
    const instructors = await Instructor.find({});

    res.json(instructors);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
     const {instructorId} = req.query;
     const result = await Instructor.findOneAndDelete({ instructorId });
     if (!result) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    res.json({ message: "Instructor deleted", instructorId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
