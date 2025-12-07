$(() => { // main jQuery routine - executes every on page load
    
    getAll(""); // first grab the data from the server


  

}); // jQuery ready method


const getAll = async (msg) => {
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
            },

        }); //StudentModalForm.validate

        $.validator.addMethod("validTitle", (value) => { //custome rule
            return (value === "Mr." || value === "Ms." || value === "Mrs." || value === "Dr.");
        }, ""); //.validator.addMethod


        const update = async (e) => {                                                                                   // UPDATE employee
            // action button click event handler
            try {
                // set up a new client side instance of employee
                let emp = JSON.parse(sessionStorage.getItem("employee"));
                // pouplate the properties
                emp.phoneno = $("#TextBoxPhone").val();
                emp.title = $("#TextBoxTitle").val();
                emp.firstname = $("#TextBoxFirstName").val();
                emp.email = $("#TextBoxEmail").val();
                emp.lastname = $("#TextBoxLastName").val();
                emp.departmentId = parseInt($("#ddlDepartments").val());
                // send the updated back to the server asynchronously using Http PUT
                let response = await fetch("api/employee", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                    body: JSON.stringify(emp),
                });
                if (response.ok) {
                    // or check for response.status
                    let payload = await response.json();
                    getAll(payload.msg);
                } else if (response.status !== 404) {
                    let problemJson = await response.json();
                    errorRtn(problemJson, response.status);
                } else {
                    // else 404 not found
                    $("#status").text("no such path on server");
                } // else
            } catch (error) {
                $("#status").text(error.message);
                console.table(error);
            } // try/catch
            $("#theModal").modal("toggle");

        };


        const clearModalFields = () => {
            loadDepartmentDDL(-1);                                                                  // reset department dropdown
            $("#TextBoxTitle").val("");
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
            $("#theModal").modal("toggle");
        }; // clearModalFields


        const setupForAdd = () => {
            $("#actionbutton").val("add");
            $("#modaltitle").html("<h4>add employee</h4>");
            $("#theModal").modal("toggle");
            $("#modalstatus").text("add new employee");
            $("#theModalLabel").text("Add");
            clearModalFields();
        }; // setupForAdd

        const _delete = async () => {
            let employee = JSON.parse(sessionStorage.getItem("employee"));
            try {
                let response = await fetch(`api/employee/${employee.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                });
                if (response.ok) // or check for response.status
                {
                    let data = await response.json();
                    getAll(data.msg);
                } else {
                    $('#status').text(`Status - ${response.status}, Problem on delete server side, see server console`);
                } // else
                $('#theModal').modal('toggle');
            } catch (error) {
                $('#status').text(error.message);
            }
        }; // _delete


        const setupForUpdate = (id, data) => {
            $("#actionbutton").val("update");
            $("#modaltitle").html("<h4>update employee</h4>");
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
                    $("#theModal").modal("toggle");
                    $("#theModalLabel").text("Update");
                    loadDepartmentDDL(employee.departmentId);
                    $("#imageHolder").html(`<img height="180" width="180" src="data:img/png;base64,${employee.staffPicture64}" />`);
                } // if
            }); // data.forEach
        }; // setupForUpdate


        const add = async () => {
            try {
                emp = new Object();
                //get the data from the boxes
                emp.title = $("#TextBoxTitle").val();
                emp.firstname = $("#TextBoxFirstName").val();
                emp.lastname = $("#TextBoxLastName").val();
                emp.email = $("#TextBoxEmail").val();
                emp.phoneno = $("#TextBoxPhone").val();
                emp.departmentId = parseInt($("#ddlDepartments").val());;
                emp.id = -1;
                emp.timer = null;
                emp.staffPicture64 = null;
                // send the employee info to the server asynchronously using POST
                let response = await fetch("api/employee", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify(emp)
                });
                if (response.ok) // or check for response.status
                {
                    let data = await response.json();
                    getAll(data.msg);
                } else if (response.status !== 404) { // probably some other client side error
                    let problemJson = await response.json();
                    errorRtn(problemJson, response.status);
                } else { // else 404 not found
                    $("#status").text("no such path on server");
                } // else
            } catch (error) {
                $("#status").text(error.message);
            } // try/catch
            $("#theModal").modal("toggle");
        }; // add

        const loadDepartmentDDL = (deptId) => {
            html = '';
            $('#ddlDepartments').empty();
            let allDepartments = JSON.parse(sessionStorage.getItem('alldepartments')) || [];

            allDepartments.forEach((dept) => {
                html += `<option value="${dept.id}">${dept.name}</option>`;
            });

            $('#ddlDepartments').append(html);
            $('#ddlDepartments').val(deptId);                                           // pre-select the department if deptId is provided
        }; // loadDepartmentDDL


        $("#actionbutton").on("click", () => {                                          // ACTION button click handler (to knowif its an update or add button)
            $("#actionbutton").val() === "update" ? update() : add();
        }); // actionbutton click


        $("#dialog").hide();                                                            // DELETE confirmation dialog
        $("#deletebutton").on("click", () => {
            $("#dialog").show();

        }); // deletebutton click


        $("#nobutton").on("click", (e) => {
            $("#dialog").hide();
            $("#status").text("Delete cancelled");                                       //remove if you dont want the modal to have this
        });

        $("#yesbutton").on("click", () => {
            $("#dialog").hide();
            _delete();
        });

        $("#EmployeeModalForm input").on("input change", function () {
            if ($("#EmployeeModalForm").valid()) {
                $("#actionbutton").prop("disabled", false);
            } else {
                $("#actionbutton").prop("disabled", true);
            }
        });


        $("#actionbutton").prop("disabled", true);

        $("#srch").on("keyup", () => {
            let alldata = JSON.parse(sessionStorage.getItem("allemployees"));
            let filtereddata = alldata.filter((emp) => emp.lastname.match(new RegExp($("#srch").val(), 'i')));
            buildEmployeeList(filtereddata, false);
        }); // srch keyup

        $("input:file").on("change", () => {
            try {
                const reader = new FileReader();
                const file = $("#uploader")[0].files[0];
                $("#uploadstatus").text("");
                file ? reader.readAsBinaryString(file) : null;
                reader.onload = (readerEvt) => {
                    // get binary data then convert to encoded string
                    const binaryString = reader.result;
                    const encodedString = btoa(binaryString);
                    // replace the picture in session storage
                    let employee = JSON.parse(sessionStorage.getItem("employee")) || {};
                    employee.staffPicture64 = encodedString;
                    sessionStorage.setItem("employee", JSON.stringify(employee));
                    $("#uploadstatus").text("retrieved local pic")
                };
            } catch (error) {
                $("#uploadstatus").text("pic upload failed")
            }
        }); // input file change

        $("#employeeList").on('click', (e) => {                                                                         // Handle clicks on employee rows or the add button
            if (!e) e = window.event;
            let id = e.target.parentNode.id;
            if (id === "employeeList" || id === "") {
                id = e.target.id;
            }                                                                                                           // clicked on row somewhere else
            if (id !== "status" && id !== "heading") {
                let data = JSON.parse(sessionStorage.getItem("allemployees"));
                id === "0" ? setupForAdd() : setupForUpdate(id, data);

            } else {
                return false; // ignore if they clicked on heading or status
            }
        }); // employeeListClick
            
        // Fetch all employees and department data from the server
        try {
            $("#employeeList").text("Finding employee Information...");                                           // Show loading message in the employee list
            let response = await fetch(`api/employee`);

            // get employee data
            if (response.ok) {
                let payload = await response.json(); 
                buildEmployeeList(payload);                                                                       // Build the list of employees dynamically
                msg === "" ? 
                $("#status").text("Employees Loaded") : $("#status").text(`${msg} - Employees Loaded`);           // Display status message
            } else if (response.status !== 404) { 
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {                                                                                               // else 404 not found
                $("#status").text("no such path on server");
            }                                                                                                      // else

            // get department data
            response = await fetch(`api/department`);
            if (response.ok) {
                let divs = await response.json(); 
                sessionStorage.setItem("alldepartments", JSON.stringify(divs));
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

        const buildEmployeeList = (data, usealldata = true) => {
        $("#employeeList").empty();                                                                                  // Clear existing list
        div = $(`<div class="list-group-item  row d-flex" id="status">employee Info</div>
        <div class= "list-group-item row d-flex text-center" id="heading">
        <div class="col-4 h4">Title</div>
        <div class="col-4 h4">First</div>
        <div class="col-4 h4">Last</div>
        </div>`);
        div.appendTo($("#employeeList"));
        usealldata ? sessionStorage.setItem("allemployees", JSON.stringify(data)) : null;                                             // Store employee data in session storage for easy access later
        btn = $(`<button class="list-group-item row d-flex" id="0">...click to add employee</button>`);               // Button to add a new employee
        btn.appendTo($("#employeeList"));
        data.forEach(emp => {                                                                                          // Populate employee list
            btn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
            btn.html(`  <div class="col-4" id="employeetitle${emp.id}">${emp.title}</div>
                        <div class="col-4" id="employeefname${emp.id}">${emp.firstname}</div>
                        <div class="col-4" id="employeelastnam${emp.id}">${emp.lastname}</div>`
            );
            btn.appendTo($("#employeeList"));
        });                                                                                                             // forEach

       

       

    }; // buildemployeeList