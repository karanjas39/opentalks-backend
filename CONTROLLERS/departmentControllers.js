const department = require(".././MODEL/departmentModel");

module.exports = {
  createDepartment,
  getDepartment,
  deleteDepartment,
  updateDepartment,
  getDepartmentsAll,
  searchDepartment,
};

function createDepartment(req, res) {
  let { name } = req.body;
  if (!name) {
    res.send({
      success: false,
      status: 400,
      message: "Name is required",
    });
  } else {
    department
      .findOne({ name })
      .then((data) => {
        if (!!data) {
          res.send({
            success: false,
            status: 400,
            message: "Department already exist",
          });
        } else {
          let newDepartment = new department({ name: req.body.name });
          newDepartment
            .save()
            .then((data) => {
              res.send({
                success: true,
                status: 200,
                message: "Department Created",
                created_department: newDepartment,
              });
            })
            .catch((err) => {
              res.send({
                success: false,
                status: 500,
                message: `Error: ${err.toString()}`,
              });
            });
        }
      })
      .catch((err) => {
        res.send({
          success: false,
          status: 500,
          message: `Error: ${err.toString()}`,
        });
      });
  }
}

function getDepartment(req, res) {
  let { _id } = req.body;
  if (!_id) {
    res.send({
      sucess: false,
      status: 400,
      message: "ID is mandatory",
    });
  } else {
    department
      .findOne({ _id })
      .then((data) => {
        if (!data) {
          res.send({
            success: false,
            status: 404,
            message: "Department not found",
          });
        } else {
          res.send({
            success: true,
            status: 200,
            department: data,
          });
        }
      })
      .catch((err) => {
        res.send({
          success: false,
          status: 500,
          message: `Error: ${err.toString()}`,
        });
      });
  }
}

function deleteDepartment(req, res) {
  let { _id } = req.body;
  if (!_id) {
    res.send({
      sucess: false,
      status: 400,
      message: "ID is mandatory",
    });
  } else {
    department
      .findOne({ _id })
      .then((depart) => {
        if (!depart) {
          res.send({
            success: false,
            status: 400,
            message: "Department not found",
          });
        } else {
          department
            .deleteOne({ _id })
            .then((dat) => {
              res.send({
                success: true,
                status: 200,
                message: "Department deleted",
                deleted_department: depart,
              });
            })
            .catch((err) => {
              res.send({
                success: false,
                status: 500,
                message: `Error: ${err.toString()}`,
              });
            });
        }
      })
      .catch((err) => {
        res.send({
          success: false,
          status: 500,
          message: `Error: ${err.toString()}`,
        });
      });
  }
}

function updateDepartment(req, res) {
  let { _id } = req.body;
  if (!_id) {
    res.send({
      sucess: false,
      status: 400,
      message: "ID is mandatory",
    });
  } else {
    department
      .findOne({ _id })
      .then((depar) => {
        if (!depar) {
          res.send({
            success: false,
            status: 400,
            message: "Department does not exist",
          });
        } else {
          department
            .findByIdAndUpdate(
              { _id },
              { name: req.body.name, updatedAt: Date.now() },
              { new: true }
            )
            .then((updated_department) => {
              res.send({
                success: true,
                status: 200,
                message: "Department Updated",
                updated_department,
              });
            })
            .catch((err) => {
              res.send({
                success: false,
                status: 500,
                message: `Error: ${err.toString()}`,
              });
            });
        }
      })
      .catch((err) => {
        res.send({
          success: false,
          status: 500,
          message: `Error: ${err.toString()}`,
        });
      });
  }
}

async function getDepartmentsAll(req, res) {
  try {
    let limit = !!req.body.byAdmin && req.body.byAdmin == true ? 3 : "";
    let departments = await department
      .find()
      .limit(limit)
      .sort({ createdAt: -1 });
    if (departments.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No department found",
      });
    }
    res.send({
      success: true,
      status: 200,
      departments,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getAllDepartmentsB`,
    });
  }
}

async function searchDepartment(req, res) {
  try {
    let { name, startPoint = 0 } = req.body;
    let results;
    if (!name) {
      return res.send({
        success: false,
        status: 404,
        message: "Department name is required",
      });
    }

    if (startPoint == 0) {
      results = await department.countDocuments({
        name: { $regex: name, $options: "i" },
      });
    }

    let departments = await department
      .find({ name: { $regex: name, $options: "i" } })
      .skip(startPoint)
      .limit(5);

    if (departments.length == 0) {
      return res.send({
        success: false,
        status: 400,
        message: "No departmnet found",
        results: 0,
      });
    }

    res.send({
      success: true,
      status: 200,
      departments,
      nextStartPoint: startPoint + 5,
      results,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in searchDepartmentB`,
    });
  }
}
