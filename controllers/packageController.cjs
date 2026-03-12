const Package = require("../models/packageModel.cjs");

exports.getGeneralPackages = async (req, res) => {
    try{
        const packages = await Package.find({ packageId: /^P/});
        res.json(packages);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getSpecialPackages = async (req, res) => {
    try{
        const packages = await Package.find({ packageId: /^S/});
        res.json(packages);
    }
    catch (err) {
        res.status(400).json({ error: err.message});
    }
};