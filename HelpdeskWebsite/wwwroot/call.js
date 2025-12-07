$(() => {
    $("#deletedialog").hide();
    $("#openAddCall").on("click", () => setupForAdd());
    getAll("");
});

const updateStatus = (text) => {
    $("#status").text(text);
};

const getAll = async (msg) => {
    try {
        updateStatus("Finding Call Information...");
        let response = await fetch(`api/call`);
        if (response.ok) {
            let payload = await response.json();
            buildCallList(payload);
            msg === "" ? updateStatus("Calls Loaded") : updateStatus(`${msg} - Calls Loaded`);
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            updateStatus("no such path on server");
        }

        response = await fetch(`api/problem`);
        if (response.ok) {
            let divs = await response.json();
            sessionStorage.setItem("allproblems", JSON.stringify(divs));
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            updateStatus("no such path on server");
        }

        response = await fetch(`api/employee`);
        if (response.ok) {
            let divs = await response.json();
            sessionStorage.setItem("allemployees", JSON.stringify(divs));
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

const buildCallList = (data, usealldata = true) => {
    $("#callList").empty();
    $("#callListHeader").empty();
    const headerdiv = $(`<div class="list-group-item row d-flex text-center" id="heading">
         <div class="col-3 h5">Opened</div>
         <div class="col-3 h5">Employee</div>
         <div class="col-3 h5">Problem</div>
         <div class="col-3 h5">Status</div>
     </div>`);
    headerdiv.appendTo($("#callListHeader"));
    if (usealldata) {
        sessionStorage.setItem("allcalls", JSON.stringify(data));
    }
    let btn = $(`<button class="list-group-item row d-flex" id="0">...click to add a call</button>`);
    btn.appendTo($("#callList"));
    data.forEach(call => {
        btn = $(`<button class="list-group-item row d-flex" id="${call.id}">`);
        const statusText = call.openStatus ? "Open" : "Closed";
        btn.html(`<div class="col-3" id="calldate${call.id}">${formatDate(call.dateOpened).replace("T", " ")}</div>
 <div class="col-3" id="callfor${call.id}">${call.employeeName}</div>
 <div class="col-3" id="callproblem${call.id}">${call.problemDescription}</div>
 <div class="col-3" id="callstatus${call.id}">${statusText}</div>`
        );
        btn.appendTo($("#callList"));
    });
};

const validateModal = () => {
    $("#modalstatus").removeClass();
    if ($("#CallModalForm").valid()) {
        $("#modalstatus").attr("class", "badge bg-success");
        $("#modalstatus").text("data entered is valid");
        $("#actionbutton").prop("disabled", false);
    }
    else {
        $("#modalstatus").attr("class", "badge bg-danger");
        $("#modalstatus").text("fix errors");
        $("#actionbutton").prop("disabled", true);
    }
};

document.addEventListener("keyup", e => {
    validateModal();
});

$("#CallModalForm").validate({
    rules: {
        ddlProblems: { required: true },
        ddlEmployees: { required: true },
        ddlTechs: { required: true },
        TextBoxNotes: { required: true, maxlength: 250 },
    },
    errorElement: "div",
    messages: {
        ddlProblems: {
            required: "Select a problem."
        },
        ddlEmployees: {
            required: "Select an employee."
        },
        ddlTechs: {
            required:  "Select a technician."
        },
        TextBoxNotes: {
            required:  "This field is required. (max. 250 characters)",  maxlength: "Too many characters! (max. 250)"
        }
    }
});

$("#srch").on("keyup", () => {
    let alldata = JSON.parse(sessionStorage.getItem("allcalls"));
    let term = new RegExp($("#srch").val(), 'i');
    let filtereddata = alldata.filter((call) => term.test(call.employeeName) || term.test(call.problemDescription));
    buildCallList(filtereddata, false);
});

$("select").on('change', (e) => {
    validateModal();
});

$("textarea").on('input', (e) => {
    validateModal();
});

$("#actionbutton").on('click', (e) => {
    $("#actionbutton").val() === "update" ? update() : add();
});

$("#deletebutton").on('click', (e) => {

    $("#deletedialog").show();
});

$("#callList").on('click', (e) => {
    if (!e) e = window.event;
    let id = e.target.parentNode.id;
    if (id === "callList" || id === "") {
        id = e.target.id;
    }
    if (id !== "status" && id !== "heading") {
        let data = JSON.parse(sessionStorage.getItem("allcalls"));
        if (id === "0") {
            setupForAdd();
        } else {
            data.forEach(call => {
                if (call.id === parseInt(id)) {
                    call.openStatus ? setupForUpdate(call) : setupForView(call);
                    return;
                }
            });
        }
    } else {
        return false;
    }
});

$("#deletenobutton").on("click", (e) => {
    $("#deletedialog").hide();
    $("#modalstatus").text("delete cancelled");
});

$("#deleteyesbutton").on("click", () => {
    $("#deletedialog").hide();
    _delete();
});

$("#checkBoxClose").on("click", () => {
    if ($("#checkBoxClose").is(":checked")) {
        $(".dateClosedItem").show();
        $("#labelDateClosed").text(formatDate().replace("T", " "));
        sessionStorage.setItem("dateclosed", formatDate());
    } else {
        $(".dateClosedItem").hide();
        $("#labelDateClosed").text("");
        sessionStorage.setItem("dateclosed", "");
    }
});

const loadProblemDDL = (probid) => {
    let html = '';
    $('#ddlProblems').empty();
    let allproblems = JSON.parse(sessionStorage.getItem('allproblems')) || [];
    allproblems.forEach((prob) => {
        html += `<option value="${prob.id}">${prob.description}</option>`;
    });
    $('#ddlProblems').append(html);
    $('#ddlProblems').val(probid);
};
const loadEmployeeDDL = (empid) => {
    let html = '';
    $('#ddlEmployees').empty();
    let allemployees = JSON.parse(sessionStorage.getItem('allemployees')) || [];
    allemployees.forEach((emp) => {
        html += `<option value="${emp.id}">${emp.firstname} ${emp.lastname}</option>`;
    });
    $('#ddlEmployees').append(html);
    $('#ddlEmployees').val(empid);
};
const loadTechDDL = (techid) => {
    let html = '';
    $('#ddlTechs').empty();
    let allemployees = JSON.parse(sessionStorage.getItem('allemployees')) || [];
    allemployees.forEach((emp) => {
        if (emp.isTech) {
            html += `<option value="${emp.id}">${emp.firstname} ${emp.lastname}</option>`;
        }
    });
    $('#ddlTechs').append(html);
    $('#ddlTechs').val(techid);
};

const clearModalFields = () => {
    loadProblemDDL(-1);
    loadEmployeeDDL(-1);
    loadTechDDL(-1);
    $("#modalFields *").prop("disabled", false);
    $("#TextBoxNotes").val("");
    $("#checkBoxClose").prop("checked", false);
    const nowDate = formatDate();
    $("#labelDateOpened").text(nowDate.replace("T", " "));
    $(".dateClosedItem").hide();
    $(".closeCallItem").hide();
    sessionStorage.setItem("dateopened", nowDate);
    sessionStorage.removeItem("call");
    let validator = $("#CallModalForm").validate();
    validator.resetForm();
    $("#actionbutton").prop("disabled", true);
    $("#modalstatus").text("");
};

const setupForAdd = () => {
    $("#actionbutton").val("add");
    $("#modal-title").html("<h4>add call</h4>");
    $("#modalstatus").text("add new call");
    $("#theModalLabel").text("Add Call");
    $("#actionbutton").show();
    $("#deletebutton").hide();
    clearModalFields();
    $("#theModal").modal("show");
};

const setupForUpdate = (call) => {
    $("#actionbutton").val("update");
    $("#modal-title").html("<h4>update call</h4>");

    clearModalFields();

    loadProblemDDL(call.problemId);
    loadEmployeeDDL(call.employeeId);
    loadTechDDL(call.techId);
    $("#TextBoxNotes").val(call.notes);
    $("#labelDateOpened").text(formatDate(call.dateOpened).replace("T", " "));
    $("#checkBoxClose").prop("checked", !call.openStatus);
    call.dateClosed ? $("#labelDateClosed").text(formatDate(call.dateClosed).replace("T", " ")) : $("#labelDateClosed").text("");
    $(".closeCallItem").show();
    call.openStatus ? $(".dateClosedItem").hide() : $(".dateClosedItem").show();

    sessionStorage.setItem("dateopened", formatDate(call.dateOpened));
    call.dateClosed ? sessionStorage.setItem("dateclosed", formatDate(call.dateClosed)) : sessionStorage.setItem("dateclosed", "");
    sessionStorage.setItem("call", JSON.stringify(call));

    $("#modalstatus").text("update data");
    $("#theModal").modal("show");
    $("#theModalLabel").text("Update Call");
    $("#actionbutton").show();
    $("#deletebutton").show();
};

const setupForView = (call) => {
    $("#modal-title").html("<h4>view closed call</h4>");

    clearModalFields();

    loadProblemDDL(call.problemId);
    loadEmployeeDDL(call.employeeId);
    loadTechDDL(call.techId);
    $("#TextBoxNotes").val(call.notes);
    $("#labelDateOpened").text(formatDate(call.dateOpened).replace("T", " "));
    $("#labelDateClosed").text(formatDate(call.dateClosed).replace("T", " "));
    $("#checkBoxClose").prop("checked", !call.openStatus);
    $(".dateClosedItem").show();
    $(".closeCallItem").show();
    $("#modalstatus").hide();
    $("#modalFields *").prop("disabled", true);

    sessionStorage.setItem("dateopened", formatDate(call.dateOpened));
    sessionStorage.setItem("dateclosed", formatDate(call.dateClosed));
    sessionStorage.setItem("call", JSON.stringify(call));


    $("#modalstatus").text("view data");
    $("#theModal").modal("show");
    $("#theModalLabel").text("View Closed Call");
    $("#actionbutton").hide();
    $("#deletebutton").show();
};

const add = async () => {
    try {
        let call = new Object();
        call.problemId = parseInt($("#ddlProblems").val());
        call.employeeId = parseInt($("#ddlEmployees").val());
        call.techId = parseInt($("#ddlTechs").val());
        call.employeeName = "";
        call.problemDescription = "";
        call.techName = "";
        call.dateOpened = sessionStorage.getItem("dateopened");
        call.dateClosed = null;
        call.openStatus = true;
        call.notes = $("#TextBoxNotes").val();
        call.timer = null;

        let response = await fetch("api/call", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(call)
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
    }
    $("#theModal").modal("hide");


};


const update = async (e) => {
    try {

        let call = JSON.parse(sessionStorage.getItem("call"));
        call.problemId = parseInt($("#ddlProblems").val());
        call.employeeId = parseInt($("#ddlEmployees").val());
        call.techId = parseInt($("#ddlTechs").val());
        call.openStatus = !($("#checkBoxClose").is(":checked"));
        call.dateOpened = sessionStorage.getItem("dateopened");
        if (!call.openStatus) {
            call.dateClosed = sessionStorage.getItem("dateclosed");
        } else {
            call.dateClosed = null;
        }
        call.notes = $("#TextBoxNotes").val();
        let response = await fetch("api/call", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(call),
        });

        if (response.ok) {
            let payload = await response.json();
            getAll(payload.msg);
            updateStatus(payload.msg);
        } else if (response.status === 409) {
            let payload = await response.json();
            updateStatus(payload.error);
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
    let call = JSON.parse(sessionStorage.getItem("call"));
    try {
        let response = await fetch(`api/call/${call.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
        if (response.ok) {
            let data = await response.json();
            getAll(data.msg);
            updateStatus(data.msg);
        } else {
            $('#status').text(`Status - ${response.status}, Problem on delete server side, see server console`);
        }
        $('#theModal').modal('hide');
    } catch (error) {
        $('#status').text(error.message);
    }
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

const formatDate = (date) => {
    let d;
    (date === undefined) ? d = new Date() : d = new Date(Date.parse(date));
    let _day = d.getDate();
    if (_day < 10) { _day = "0" + _day; }
    let _month = d.getMonth() + 1;
    if (_month < 10) { _month = "0" + _month; }
    let _year = d.getFullYear();
    let _hour = d.getHours();
    if (_hour < 10) { _hour = "0" + _hour; }
    let _min = d.getMinutes();
    if (_min < 10) { _min = "0" + _min; }
    return _year + "-" + _month + "-" + _day + "T" + _hour + ":" + _min;
};
