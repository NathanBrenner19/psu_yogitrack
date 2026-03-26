const Package = require("../models/packageModel.cjs");

//Finds the next valid package Id 
const getNextPackageIdForPrefix = async (prefix) => {
    //Find the next package Id filter from the prefix passed
    const latestPackage = await Package.find({ packageId: new RegExp(`^${prefix}`) })
        .sort({ packageId: -1 })
        .limit(1);

    if (!latestPackage || latestPackage.length === 0) {
        return `${prefix}001`;
    }


    const latestId = latestPackage[0].packageId || "";
    const numericPart = parseInt(latestId.slice(1), 10);
    const nextNumber = Number.isNaN(numericPart) ? 1 : numericPart + 1;

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

//Gets package info
exports.getPackage = async (req, res) => {
    try{
        const packageId = req.query.packageId;
        const packageDetail = await Package.findOne({packageId: packageId});

        res.json(packageDetail);
    }
    catch (e){
        res.status(400).json({ error: e.message });
    }
};

//Add edited package data into DB
exports.add = async (req, res) => {
    try{
        const {
            packageId,
            packageName,
            description,
            price
        } = req.body;

        if (!packageId){
            return res.status(400).json({ message: "Missing required fields"});
        }

        //Finds the package from Id dropdown and updates it with the data from the edit form
        const updatedPackage = await Package.findOneAndUpdate(
            { packageId },
            {
                ...(typeof packageName !== "undefined" ? { packageName } : {}),
                ...(typeof description !== "undefined" ? { description } : {}),
                ...(typeof price !== "undefined" ? { price } : {})
            },
            { returnDocument: "after", runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: "Package not found" });
        }

        return res.status(200).json({
            message: "Package updated successfully",
            package: updatedPackage
        });
    }
    catch(e){
        return res.status(400).json({ message: e.message });
    }
};

//Gets all general packages
exports.getGeneralPackages = async (req, res) => {
    try{
        const packages = await Package.find({ packageId: /^P/});
        res.json(packages);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//Gets all special packages
exports.getSpecialPackages = async (req, res) => {
    try{
        const packages = await Package.find({ packageId: /^S/});
        res.json(packages);
    }
    catch (err) {
        res.status(400).json({ error: err.message});
    }
};

//Gets all package ID's for drop down menu
exports.getPackagesId = async (req, res) => {
    try{
        const packages = await Package.find({});
        res.json(packages);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const { packageId } = req.query;
        if (!packageId) {
            return res.status(400).json({ error: "packageId is required" });
        }
        const result = await Package.findOneAndDelete({ packageId });
        if (!result) {
            return res.status(404).json({ error: "Package not found" });
        }
        res.json({ message: "Package deleted", packageId });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Creates a new package with a new valid ID and prefix
exports.createPackage = async (req, res) => {
    try {
        const { packageType, packageName, description, price } = req.body || {};

        if (!packageType || !packageName || typeof price === "undefined") {
            return res.status(400).json({ error: "packageType, packageName and price are required." });
        }

        let prefix;
        if (packageType === "general") {
            prefix = "P";
        } else if (packageType === "special") {
            prefix = "S";
        } else {
            return res.status(400).json({ error: "Invalid packageType. Expected 'general' or 'special'." });
        }

        const packageId = await getNextPackageIdForPrefix(prefix);

        const newPackage = new Package({
            packageId,
            packageName,
            description: description || "",
            price
        });

        const saved = await newPackage.save();
        return res.status(201).json(saved);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};