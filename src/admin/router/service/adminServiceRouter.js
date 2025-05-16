const router = require("express").Router();

const {
    getAllServices,
    addnewServices,
    deleteServices,
    getSingleServices,
    updateServices,
    generateNewService,
} = require("../../controller/Service/serviceController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.get("/all", getAllServices);
router.get("/single/:id", getSingleServices);
router.post("/add", addnewServices);
router.patch("/update/:id", updateServices);
router.delete("/delete/:id", deleteServices);
router.post("/generate/add", generateNewService);

module.exports = router;
