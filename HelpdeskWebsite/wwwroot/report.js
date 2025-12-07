$(() => {
$("#callReportBtn").on("click", async (e) => {
        try {
            updateStatus("generating report on server - please wait...");
            let response = await fetch(`api/callreport`);
            if (!response.ok)
                throw new Error(
                    `Status - ${response.status}, Text - ${response.statusText}`
                );
            let data = await response.json();
            updateStatus("report generated");
            data.msg === "Call Report Generated"
                ? window.open("/pdfs/callreport.pdf")
                : updateStatus("problem generating report");
        } catch (error) {
            updateStatus(error.message);
        }
    });

  
        $("#employeeReportBtn").on("click", async (e) => {
            try {
                updateStatus("generating report on server - please wait...");
                let response = await fetch(`api/employeereport`);
                if (!response.ok)
                    throw new Error(
                        `Status - ${response.status}, Text - ${response.statusText}`
                    );
                let data = await response.json();
                updateStatus("report generated");
                data.msg === "Employee Report Generated"
                    ? window.open("/pdfs/employeereport.pdf")
                    : updateStatus("problem generating report");
            } catch (error) {
                updateStatus(error.message);
            }
        });


});



// server was reached but server had a problem with the call
const errorRtn = (problemJson, status) => {
    if (status > 499) {
        $("#status").text("Problem server side, see debug console");
    } else {
        let keys = Object.keys(problemJson.errors);
        problem = {
            status: status,
            statusText: problemJson.errors[keys[0]][0] // first error
        };
        $("#status").text("Problem client side, see browser console");
        console.log(problem);
    } // else
};

const updateStatus = (text) => {
    $("#lblstatus").text(text);
};
