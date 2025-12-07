$(() => { // main jQuery routine - executes every on page load, $ is short for jquery
    $("#deletedialog").hide();
    getAll(""); // first grab the data from the server
}); // jQuery ready method

const getAll = async (msg) => {
    try {
        $("#callList").text("Finding Call Information...");
        let response = await fetch(`api/call`);
        if (response.ok) {
            let payload = await response.json(); // this returns a promise, so we await it
            buildCallList(payload);
            msg === "" ? // are we appending to an existing message
                $("#status").text("Calls Loaded") : $("#status").text(`${msg} - Calls Loaded`);
        } else if (response.status !== 404) { // probably some other client side error
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else { // else 404 not found
            $("#status").text("no such path on server");
        } // else

        // get problem data
        response = await fetch(`api/problem`);
        if (response.ok) {
            let divs = await response.json(); // this returns a promise, so we await it
            sessionStorage.setItem("allproblems", JSON.stringify(divs));
        } else if (response.status !== 404) { // probably some other client side error
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else { // else 404 not found
            $("#status").text("no such path on server");
        } // else

        // get employee data
        response = await fetch(`api/employee`);
        if (response.ok) {
            let divs = await response.json(); // this returns a promise, so we await it
            sessionStorage.setItem("allemployees", JSON.stringify(divs));
        } else if (response.status !== 404) {   
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else { // else 404 not found
            $("#status").text("no such path on server");
        } // else

    } catch (error) {
        $("#status").text(error.message);
    }
}; // getAll
const buildCallList = (data, usealldata = true) => {
    $("#callList").empty();
    $("#callListHeader").empty();
    $("#callListStatus").empty();
    statusdiv = $(`<div class="list-group-item row d-flex" id="status" style="color: black;">Call List</div>`);
    headerdiv = $(`<div class= "list-group-item row d-flex text-center" id="heading">
         <div class="col-4 h4">Date</div>
         <div class="col-4 h4">For</div>
         <div class="col-4 h4">Problem</div>
     </div>`);
    statusdiv.appendTo($("#callListStatus"));
    headerdiv.appendTo($("#callListHeader"));
    usealldata ? sessionStorage.setItem("allcalls", JSON.stringify(data)) : null;
    btn = $(`<button class="list-group-item row d-flex" id="0">...click to add a call</button>`);    
    btn.appendTo($("#callList"));
    data.forEach(call => {
        btn = $(`<button class="list-group-item row d-flex" id="${call.id}">`);
        btn.html(`<div class="col-4" id="calldate${call.id}">${formatDate(call.dateOpened).replace("T", " ")}</div>
 <div class="col-4" id="callfor${call.id}">${call.employeeName}</div>
 <div class="col-4" id="callproblem${call.id}">${call.problemDescription}</div>`
        );
        btn.appendTo($("#callList"));
    }); // forEach
}; // buildCallList

const validateModal = () => {
    $("#modalstatus").removeClass(); //remove any existing css on div
    if ($("#CallModalForm").valid()) {
        $("#modalstatus").attr("class", "badge bg-success"); //green
        $("#modalstatus").text("data entered is valid");
        $("#actionbutton").prop("disabled", false);
    }
    else {
        $("#modalstatus").attr("class", "badge bg-danger"); //red
        $("#modalstatus").text("fix errors");
        $("#actionbutton").prop("disabled", true);
    }
};

document.addEventListener("keyup", e => {
    validateModal();
});

const countChars = (sel) => {
    return $(sel).val();
};

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
}); //CallModalForm.validate

$("#srch").on("keyup", () => {
    let alldata = JSON.parse(sessionStorage.getItem("allcalls"));
    let filtereddata = alldata.filter((call) => call.employeeName.match(new RegExp($("#srch").val(), 'i')));
    buildCallList(filtereddata, false);
}); // srch keyup


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
            setupForAdd()
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
    html = '';
    $('#ddlProblems').empty();
    let allproblems = JSON.parse(sessionStorage.getItem('allproblems'));
    allproblems.forEach((prob) => {
        html += `<option value="${prob.id}">${prob.description}</option>`
    });
    $('#ddlProblems').append(html);
    $('#ddlProblems').val(probid);
}; 
const loadEmployeeDDL = (empid) => {
    html = '';
    $('#ddlEmployees').empty();
    let allemployees = JSON.parse(sessionStorage.getItem('allemployees'));
    allemployees.forEach((emp) => {
        html += `<option value="${emp.id}">${emp.lastname}</option>`
    });
    $('#ddlEmployees').append(html);
    $('#ddlEmployees').val(empid);
}; 
const loadTechDDL = (techid) => {
    html = '';
    $('#ddlTechs').empty();
    let allemployees = JSON.parse(sessionStorage.getItem('allemployees'));
    allemployees.forEach((emp) => {
        if (emp.isTech) {
            html += `<option value="${emp.id}">${emp.lastname}</option>`
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
    $(".dateClosedItem").hide()
    $(".closeCallItem").hide()
    sessionStorage.setItem("dateopened", nowDate);
    sessionStorage.removeItem("call");
    $("#theModal").modal("toggle");
    let validator = $("#CallModalForm").validate();
    validator.resetForm();
    $("#modalstatus").show()
    $("#modalstatus").removeClass("badge bg-success bg-danger");
};

const setupForAdd = () => {
    $("#actionbutton").val("add");
    $("#modal-title").html("<h4>add call</h4>");
    $("#theModal").modal("toggle");
    $("#modalstatus").text("add new call");
    $("#theModalLabel").text("Add Call");
    $("#actionbutton").show();
    $("#deletebutton").hide();
    clearModalFields();
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
    $(".dateClosedItem").hide()
    $(".closeCallItem").show()

    sessionStorage.setItem("dateopened", formatDate(call.dateOpened));
    sessionStorage.setItem("call", JSON.stringify(call));

    $("#modalstatus").text("update data");
    $("#theModal").modal("toggle");
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
    $(".dateClosedItem").show()
    $(".closeCallItem").show()
    $("#modalstatus").hide()
    $("#modalFields *").prop("disabled", true);

    sessionStorage.setItem("dateopened", formatDate(call.dateOpened));
    sessionStorage.setItem("dateclosed", formatDate(call.dateClosed));
    sessionStorage.setItem("call", JSON.stringify(call));


    $("#modalstatus").text("view data");
    $("#theModal").modal("toggle");
    $("#theModalLabel").text("View Closed Call");
    $("#actionbutton").hide();
    $("#deletebutton").show();
}; 

const add = async () => {
    try {
        call = new Object();
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

        console.log(call)
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
            $("#status").text("no such path on server");
        } 
    } catch (error) {
        $("#status").text("no such path on server");
    } 
    $("#theModal").modal("toggle");


}; 


const update = async (e) => { // click event handler
    try {
     
        let call = JSON.parse(sessionStorage.getItem("call"));
        call.problemId = parseInt($("#ddlProblems").val());
        call.employeeId = parseInt($("#ddlEmployees").val());
        call.techId = parseInt($("#ddlTechs").val());
        call.openStatus = !($("#checkBoxClose").is(":checked"));
        call.dateOpened = sessionStorage.getItem("dateopened");
        if (!call.openStatus) {
            call.dateClosed = sessionStorage.getItem("dateclosed");
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
            $("#status").text(`Call ${call.id} added`);
        } else if (response.status !== 404) {
            let problemJson = await response.json();
            errorRtn(problemJson, response.status);
        } else {
            $("#status").text("no such path on server");
        } 
      
    } catch (error) {
        $("#status").text(error.message);
        console.table(error);
    }
    $("#theModal").modal("toggle");
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
        } else {
            $('#status').text(`Status - ${response.status}, Problem on delete server side, see server console`);
        } 
        $('#theModal').modal('toggle');
    } catch (error) {
        $('#status').text(error.message);
    }
}; // _delete

const errorRtn = (problemJson, status) => {
    if (status > 499) {
        $("#status").text("Problem server side, see debug console");
    } else {
        let keys = Object.keys(problemJson.errors);
        problem = {
            status: status,
            statusText: problemJson.errors[keys[0]][0] 
        };
        $("#status").text("Problem client side, see browser console");
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
}