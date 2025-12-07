$(() => {
    configureValidation();
    $("#dialog").hide();
    $("#openAdd").on("click", () => setupForAdd());
    $("#deletebutton").on("click", () => $("#dialog").show());
    $("#nobutton").on("click", () => {
        $("#dialog").hide();
        updateStatus("Delete cancelled");
    });
    $("#yesbutton").on("click", () => {
        $("#dialog").hide();
        _delete();
    });
    $("#EmployeeModalForm input").on("input change", toggleActionButton);
    $("#srch").on("keyup", runSearch);
    $("#actionbutton").on("click", () => {
        $("#actionbutton").val() === "update" ? update() : add();
    });
    $("#uploader").on("change", handleUpload);
    $("#employeeList").on("click", "button", handleEmployeeListClick);
    getAll("");
});

const updateStatus = (msg) => {
    $("#status").text(msg);
};

const configureValidation = () => {
    $("#EmployeeModalForm").validate({
        rules: {
            TextBoxTitle: { maxlength: 4, required: true, validTitle: true },
            TextBoxFirstName: { maxlength: 25, required: true },
            TextBoxLastName: { maxlength: 25, required: true },
            TextBoxEmail: { maxlength: 40, required: true, email: true },
            TextBoxPhone: { maxlength: 15, required: true }
        },
        errorElement: "div",
        messages: {
            TextBoxTitle: {
                required: "required 1-4 chars.", maxlength: "required 1-4 chars.", validTitle: "Mr. Ms. Mrs. or Dr."
            },
            TextBoxFirstName: {
                required: "required 1-25 chars.", maxlength: "required 1-25 chars."
            },
            TextBoxLastName: {
                required: "required 1-25 chars.", maxlength: "required 1-25 chars."
            },
            TextBoxPhone: {
                required: "required 1-15 chars.", maxlength: "required 1-15 chars."
            },
            TextBoxEmail: {
                required: "required 1-40 chars.", maxlength: "required 1-40 chars.", email: "need valid email format"
            }
        }

    });

    $.validator.addMethod("validTitle", (value) => {
        return (value === "Mr." || value === "Ms." || value === "Mrs." || value === "Dr.");
    }, "");
};

const toggleActionButton = () => {
    if ($("#EmployeeModalForm").valid()) {
        $("#actionbutton").prop("disabled", false);
    } else {
        $("#actionbutton").prop("disabled", true);
    }
};

const handleUpload = () => {
    try {
        const reader = new FileReader();
        const file = $("#uploader")[0].files[0];
        $("#uploadstatus").text("");
        if (!file) return;
        reader.readAsBinaryString(file);
        reader.onload = (readerEvt) => {
            const binaryString = reader.result;
            const encodedString = btoa(binaryString);
            let employee = JSON.parse(sessionStorage.getItem("employee")) || {};
            employee.staffPicture64 = encodedString;
            sessionStorage.setItem("employee", JSON.stringify(employee));
            sessionStorage.setItem("picture", encodedString);
            $("#imageHolder").html(`<img height="140" width="140" src="data:img/png;base64,${encodedString}" />`);
            $("#uploadstatus").text("retrieved local pic");
            toggleActionButton();
        };
    } catch (error) {
        $("#uploadstatus").text("pic upload failed");
    }
};

const getAll = async (msg) => {
    try {
        $("#employeeList").text("Finding employee Information...");
        let response = await fetch(`api/employee`);

        if (response.ok) {
            let payload = await response.json();
            buildEmployeeList(payload);
            msg === "" ? updateStatus("Employees Loaded") : updateStatus(`${msg} - Employees Loaded`);
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            updateStatus("no such path on server");
        }

        response = await fetch(`api/department`);
        if (response.ok) {
            let divs = await response.json();
            sessionStorage.setItem("alldepartments", JSON.stringify(divs));
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            updateStatus("no such path on server");
        }

    } catch (error) {
        updateStatus(error.message);
    }
};

const buildEmployeeList = (data, usealldata = true) => {
    $("#employeeList").empty();
    const header = $(`<div class="list-group-item row d-flex text-center" id="heading">
        <div class="col-2 fw-bold">Title</div>
        <div class="col-3 fw-bold">Name</div>
        <div class="col-2 fw-bold">Phone</div>
        <div class="col-3 fw-bold">Email</div>
        <div class="col-2 fw-bold">Department</div>
        </div>`);
    header.appendTo($("#employeeList"));
    if (usealldata) {
        sessionStorage.setItem("allemployees", JSON.stringify(data));
    }
    let btn = $(`<button class="list-group-item row d-flex" id="0">...click to add employee</button>`);
    btn.appendTo($("#employeeList"));
    data.forEach(emp => {
        btn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
        btn.html(`  <div class="col-2">${emp.title}</div>
                        <div class="col-3">${emp.firstname} ${emp.lastname}</div>
                        <div class="col-2">${emp.phoneno}</div>
                        <div class="col-3">${emp.email}</div>
                        <div class="col-2">${emp.departmentName}</div>`
        );
        btn.appendTo($("#employeeList"));
    });
};

const handleEmployeeListClick = (e) => {
    const id = e.currentTarget.id;

    if (id === "0") {
        setupForAdd();
        return;
    }

    const allEmployees = JSON.parse(sessionStorage.getItem("allemployees")) || [];

    if (allEmployees.length === 0) {
        updateStatus("No employee data available. Please reload the employees.");
        return;
    }

    setupForUpdate(id, allEmployees);
};


const loadDepartmentDDL = (deptId) => {
    let html = '';
    $('#ddlDepartments').empty();
    let allDepartments = JSON.parse(sessionStorage.getItem('alldepartments')) || [];

    allDepartments.forEach((dept) => {
        html += `<option value="${dept.id}">${dept.name}</option>`;
    });

    $('#ddlDepartments').append(html);
    $('#ddlDepartments').val(deptId);
};

const clearModalFields = () => {
    loadDepartmentDDL(-1);
    $("#TextBoxTitle").val("");
    $("#TextBoxFirstName").val("");
    $("#TextBoxLastName").val("");
    $("#TextBoxEmail").val("");
    $("#TextBoxPhone").val("");
    sessionStorage.removeItem("employee");
    sessionStorage.removeItem("picture");
    $("#uploadstatus").text("");
    $("#imageHolder").html("");
    $("#uploader").val("");
    let validator = $("#EmployeeModalForm").validate();
    validator.resetForm();
    $("#modalstatus").text("");
    $("#actionbutton").prop("disabled", true);
};

const setupForAdd = () => {
    $("#actionbutton").val("add");
    $("#modaltitle").text("Add Employee");
    $("#modalstatus").text("add new employee");
    $("#actionbutton").show();
    $("#deletebutton").hide();
    clearModalFields();
    $("#theModal").modal("show");
};

const setupForUpdate = (id, data) => {
    $("#actionbutton").val("update");
    $("#modaltitle").text("Update Employee");
    clearModalFields();
    data.forEach(employee => {
        if (employee.id === parseInt(id)) {
            $("#TextBoxTitle").val(employee.title);
            $("#TextBoxFirstName").val(employee.firstname);
            $("#TextBoxLastName").val(employee.lastname);
            $("#TextBoxEmail").val(employee.email);
            $("#TextBoxPhone").val(employee.phoneno);
            sessionStorage.setItem("employee", JSON.stringify(employee));
            $("#modalstatus").text("update data");
            $("#modaltitle").text("Update Employee");
            loadDepartmentDDL(employee.departmentId);
            if (employee.staffPicture64) {
                $("#imageHolder").html(`<img height="140" width="140" src="data:img/png;base64,${employee.staffPicture64}" />`);
            }
        }
    });
    $("#deletebutton").show();
    $("#actionbutton").show();
    toggleActionButton();
    $("#theModal").modal("show");
};

const add = async () => {
    try {
        let emp = new Object();
        emp.title = $("#TextBoxTitle").val();
        emp.firstname = $("#TextBoxFirstName").val();
        emp.lastname = $("#TextBoxLastName").val();
        emp.email = $("#TextBoxEmail").val();
        emp.phoneno = $("#TextBoxPhone").val();
        emp.departmentId = parseInt($("#ddlDepartments").val());
        emp.id = -1;
        emp.timer = null;
        emp.staffPicture64 = sessionStorage.getItem("picture");
        let response = await fetch("api/employee", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(emp)
        });
        if (response.ok) {
            let data = await response.json();
            getAll(data.msg);
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            updateStatus("no such path on server");
        }
    } catch (error) {
        updateStatus(error.message);
    }
    $("#theModal").modal("hide");
};

const update = async () => {
    try {
        let emp = JSON.parse(sessionStorage.getItem("employee"));
        emp.phoneno = $("#TextBoxPhone").val();
        emp.title = $("#TextBoxTitle").val();
        emp.firstname = $("#TextBoxFirstName").val();
        emp.email = $("#TextBoxEmail").val();
        emp.lastname = $("#TextBoxLastName").val();
        emp.departmentId = parseInt($("#ddlDepartments").val());
        emp.staffPicture64 = sessionStorage.getItem("picture") ?? emp.staffPicture64;
        let response = await fetch("api/employee", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(emp),
        });
        if (response.ok) {
            let payload = await response.json();
            getAll(payload.msg);
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            updateStatus("no such path on server");
        }
    } catch (error) {
        updateStatus(error.message);
        console.table(error);
    }
    $("#theModal").modal("hide");
};

const _delete = async () => {
    let employee = JSON.parse(sessionStorage.getItem("employee"));
    try {
        let response = await fetch(`api/employee/${employee.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
        if (response.ok) {
            let data = await response.json();
            getAll(data.msg);
        } else {
            updateStatus(`Status - ${response.status}, Problem on delete server side, see server console`);
        }
        $('#theModal').modal('hide');
    } catch (error) {
        updateStatus(error.message);
    }
};

const runSearch = () => {
    let alldata = JSON.parse(sessionStorage.getItem("allemployees")) || [];
    let term = new RegExp($("#srch").val(), 'i');
    let filtereddata = alldata.filter((emp) => term.test(emp.lastname) || term.test(emp.firstname) || term.test(emp.email));
    buildEmployeeList(filtereddata, false);
};

const errorRtn = (problemJson, status) => {
    if (status > 499) {
        updateStatus("Problem server side, see debug console");
    } else {
        let keys = Object.keys(problemJson.errors);
        let problem = {
            status: status,
            statusText: problemJson.errors[keys[0]][0]
        };
        updateStatus("Problem client side, see browser console");
        console.log(problem);
    }
};
